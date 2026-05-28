import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  requireLiveLessonUser,
} from '@/features/live-lessons/server/liveLessons';
import { buildLiveLessonIdentity } from '@/features/live-lessons/lib/participant-identity';
import type {
  LiveLesson,
  LiveLessonMicPermission,
} from '@/features/live-lessons/types';
import {
  isValidRoomId,
  signPersistToken,
  verifyTeacherProof,
} from '@/features/live-lessons/lib/lesson-auth';
import { buildLiveKitVideoGrant } from '@/features/live-lessons/lib/livekit-grants';

export const runtime = 'nodejs';

type Body = {
  identity: string;
  lessonId: string;
  roomName: string;
  role: 'teacher' | 'student';
  teacherProof?: string;
};

export async function POST(request: Request) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Sunucuda LIVEKIT_API_KEY ve LIVEKIT_API_SECRET tanımlı değil.' },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (
    !body ||
    !isValidRoomId(body.roomName) ||
    typeof body.identity !== 'string' ||
    body.identity.length === 0 ||
    body.identity.length > 128 ||
    (body.role !== 'teacher' && body.role !== 'student')
  ) {
    return NextResponse.json({ error: 'Geçersiz ders bağlantısı.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: lesson } = await supabase
    .from('live_lessons')
    .select('*')
    .eq('id', body.lessonId)
    .eq('room_id', body.roomName)
    .single();

  if (!lesson || lesson.status === 'ended' || lesson.status === 'cancelled') {
    return NextResponse.json({ error: 'Ders aktif değil.' }, { status: 404 });
  }

  const isAdmin = isLiveLessonAdmin(auth.user);
  const resolvedRole = isAdmin ? 'teacher' : 'student';
  const expectedIdentity = buildLiveLessonIdentity(auth.user.id, resolvedRole);
  if (body.role !== resolvedRole || body.identity !== expectedIdentity) {
    return NextResponse.json({ error: 'Ders rolü doğrulanamadı.' }, { status: 403 });
  }

  if (body.role === 'teacher') {
    const validProof = verifyTeacherProof(body.roomName, body.teacherProof);
    if (!isAdmin || !validProof) {
      return NextResponse.json({ error: 'Öğretmen yetkisi doğrulanamadı.' }, { status: 403 });
    }
  }
  if (body.role === 'student' && !canUserAccessLiveLesson(lesson as LiveLesson, auth.user)) {
    return NextResponse.json({ error: 'Bu ders size açık değil.' }, { status: 403 });
  }

  let studentCanPublishMicrophone = false;
  if (resolvedRole === 'student') {
    const { data: participantRow } = await supabase
      .from('live_lesson_participants')
      .select('mic_permission, microphone_allowed, muted_by_teacher')
      .eq('lesson_id', body.lessonId)
      .eq('identity', body.identity)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const row = (participantRow || null) as
      | {
          mic_permission?: LiveLessonMicPermission | null;
          microphone_allowed?: boolean | null;
          muted_by_teacher?: boolean | null;
        }
      | null;

    studentCanPublishMicrophone =
      row?.mic_permission === 'allowed' &&
      row.microphone_allowed === true &&
      row.muted_by_teacher !== true;
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: body.identity,
    name: auth.user.name || auth.user.email,
    ttl: '8h',
  });

  token.addGrant(
    buildLiveKitVideoGrant(resolvedRole, body.roomName, {
      studentCanPublishMicrophone,
    }),
  );

  return NextResponse.json({
    persistToken: signPersistToken({
      identity: body.identity,
      role: body.role,
      roomId: body.roomName,
    }),
    token: await token.toJwt(),
  });
}
