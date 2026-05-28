import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  requireLiveLessonUser,
} from '@/features/live-lessons/server/liveLessons';
import {
  buildLiveLessonIdentity,
  parseLiveLessonIdentity,
} from '@/features/live-lessons/lib/participant-identity';
import {
  muteParticipantMicrophoneTracks,
  sendLiveLessonRoomMessage,
  setStudentMicrophonePublishPermission,
} from '@/features/live-lessons/server/livekit-permissions';
import { createLogger } from '@/lib/logger';
import type {
  LiveLesson,
  LiveLessonMicPermission,
} from '@/features/live-lessons/types';

const log = createLogger('live-lesson-microphone');

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

type Body = {
  action?: 'request' | 'allow' | 'deny' | 'mute' | 'mute_all';
  targetIdentity?: string;
};

function microphoneStateForAction(action: NonNullable<Body['action']>) {
  if (action === 'allow') return { allowed: true, permission: 'allowed' };
  if (action === 'request') return { allowed: false, permission: 'requested' };
  return { allowed: false, permission: 'blocked' };
}

async function loadLesson(lessonId: string) {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from('live_lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  return { lesson: data as LiveLesson | null, supabase };
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;

  const { lessonId } = await context.params;
  const url = new URL(request.url);
  const requestedIdentity = url.searchParams.get('identity')?.trim() ?? '';
  const isAdmin = isLiveLessonAdmin(auth.user);
  const callerRole = isAdmin ? 'teacher' : 'student';
  const callerIdentity = buildLiveLessonIdentity(auth.user.id, callerRole);

  const identity = requestedIdentity || callerIdentity;

  if (!isAdmin && identity !== callerIdentity) {
    return NextResponse.json(
      { error: 'Bu kayda erişim yetkiniz yok.' },
      { status: 403 },
    );
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('live_lesson_participants')
    .select('mic_permission, microphone_allowed, muted_by_teacher')
    .eq('lesson_id', lessonId)
    .eq('identity', identity)
    .is('left_at', null)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    log.warn('Mikrofon durumu okunamadı', {
      identity,
      lessonId,
      message: error.message,
    });
  }

  const row = (data || null) as
    | {
        mic_permission?: LiveLessonMicPermission | null;
        microphone_allowed?: boolean | null;
        muted_by_teacher?: boolean | null;
      }
    | null;

  return NextResponse.json({
    micPermission: row?.mic_permission ?? null,
    microphoneAllowed: Boolean(row?.microphone_allowed),
    mutedByTeacher: Boolean(row?.muted_by_teacher),
  });
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;

  const { lessonId } = await context.params;
  const body = (await request.json().catch(() => null)) as Body | null;
  const action = body?.action;

  if (!action) {
    return NextResponse.json({ error: 'Mikrofon işlemi geçersiz.' }, { status: 400 });
  }

  const { lesson, supabase } = await loadLesson(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: 'Ders bulunamadı.' }, { status: 404 });
  }
  if (lesson.status === 'ended' || lesson.status === 'cancelled') {
    return NextResponse.json({ error: 'Ders aktif değil.' }, { status: 409 });
  }

  const isAdmin = isLiveLessonAdmin(auth.user);

  if (action === 'request') {
    if (isAdmin) {
      return NextResponse.json({ error: 'Öğretmen için mikrofon isteği gerekmez.' }, { status: 400 });
    }
    if (!canUserAccessLiveLesson(lesson, auth.user)) {
      return NextResponse.json({ error: 'Bu ders size açık değil.' }, { status: 403 });
    }

    const identity = buildLiveLessonIdentity(auth.user.id, 'student');
    await supabase
      .from('live_lesson_participants')
      .update({
        hand_status: 'mic_requested',
        last_seen_at: new Date().toISOString(),
        mic_permission: 'requested',
        muted_by_teacher: false,
        updated_at: new Date().toISOString(),
      })
      .eq('lesson_id', lessonId)
      .eq('identity', identity)
      .is('left_at', null);

    await supabase.from('live_lesson_events').insert({
      event_type: 'microphone_request',
      lesson_id: lessonId,
      payload: { identity },
      user_id: auth.user.id,
      user_name: auth.user.name,
    });

    await sendLiveLessonRoomMessage({
      message: {
        displayName: auth.user.name,
        fromIdentity: identity,
        kind: 'microphone_request',
      },
      roomName: lesson.room_id,
    }).catch((reason) => {
      log.warn('Mikrofon isteği yayını gönderilemedi', {
        identity,
        lessonId,
        reason: reason instanceof Error ? reason.message : String(reason),
      });
    });

    return NextResponse.json({ ok: true, micPermission: 'requested' });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: 'Bu işlem için öğretmen yetkisi gerekir.' }, { status: 403 });
  }

  if (action === 'mute_all') {
    const { data: activeStudents } = await supabase
      .from('live_lesson_participants')
      .select('identity')
      .eq('lesson_id', lessonId)
      .eq('role', 'student')
      .is('left_at', null);

    const identities = [
      ...new Set(
        ((activeStudents || []) as Array<{ identity?: string | null }>)
          .map((row) => row.identity)
          .filter((identity): identity is string => Boolean(identity)),
      ),
    ];

    await Promise.all(
      identities.map((identity) =>
        setStudentMicrophonePublishPermission({
          allowed: false,
          identity,
          roomName: lesson.room_id,
        }).catch(() => undefined),
      ),
    );

    await supabase
      .from('live_lesson_participants')
      .update({
        hand_status: 'lowered',
        mic_permission: 'blocked',
        microphone_allowed: false,
        muted_by_teacher: true,
        updated_at: new Date().toISOString(),
      })
      .eq('lesson_id', lessonId)
      .eq('role', 'student')
      .is('left_at', null);

    await sendLiveLessonRoomMessage({
      message: {
        allowed: false,
        fromIdentity: 'server',
        kind: 'microphone_permission',
        targetIdentity: '*',
      },
      roomName: lesson.room_id,
    }).catch((reason) => {
      log.warn('mute_all yayını gönderilemedi', {
        lessonId,
        reason: reason instanceof Error ? reason.message : String(reason),
      });
    });

    return NextResponse.json({ ok: true, muted: identities.length });
  }

  const targetIdentity = body?.targetIdentity?.trim() ?? '';
  const parsedIdentity = parseLiveLessonIdentity(targetIdentity);
  if (!parsedIdentity || parsedIdentity.role !== 'student') {
    return NextResponse.json({ error: 'Öğrenci kimliği geçersiz.' }, { status: 400 });
  }

  const state = microphoneStateForAction(action);
  if (action === 'allow' || action === 'deny' || action === 'mute') {
    try {
      await setStudentMicrophonePublishPermission({
        allowed: state.allowed,
        identity: targetIdentity,
        roomName: lesson.room_id,
      });
    } catch {
      if (state.allowed) {
        return NextResponse.json(
          { error: 'Mikrofon izni şu anda güncellenemedi. Lütfen tekrar deneyin.' },
          { status: 503 },
        );
      }

      if (!state.allowed) {
        await muteParticipantMicrophoneTracks(lesson.room_id, targetIdentity).catch(() => undefined);
      }
    }

    await supabase
      .from('live_lesson_participants')
      .update({
        hand_status: 'lowered',
        mic_permission: state.permission,
        microphone_allowed: state.allowed,
        muted_by_teacher: !state.allowed,
        updated_at: new Date().toISOString(),
      })
      .eq('lesson_id', lessonId)
      .eq('identity', targetIdentity)
      .is('left_at', null);

    await supabase.from('live_lesson_events').insert({
      event_type: state.allowed ? 'microphone_allowed' : 'microphone_muted',
      lesson_id: lessonId,
      payload: {
        action,
        target_identity: targetIdentity,
        target_user_id: parsedIdentity.userId,
      },
      user_id: auth.user.id,
      user_name: auth.user.name,
    });

    await sendLiveLessonRoomMessage({
      destinationIdentities: [targetIdentity],
      message: {
        allowed: state.allowed,
        fromIdentity: 'server',
        kind: 'microphone_permission',
        targetIdentity,
      },
      roomName: lesson.room_id,
    }).catch((reason) => {
      log.warn('Mikrofon izin yayını gönderilemedi', {
        action,
        allowed: state.allowed,
        lessonId,
        reason: reason instanceof Error ? reason.message : String(reason),
        targetIdentity,
      });
    });

    return NextResponse.json({ ok: true, micPermission: state.permission });
  }

  return NextResponse.json({ error: 'Mikrofon işlemi geçersiz.' }, { status: 400 });
}
