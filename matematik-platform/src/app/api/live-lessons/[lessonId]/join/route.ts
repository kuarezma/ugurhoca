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

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  const { lessonId } = await context.params;
  const supabase = createServiceRoleClient();
  const role = isLiveLessonAdmin(auth.user) ? 'teacher' : 'student';
  const identity = buildLiveLessonIdentity(auth.user.id, role);

  const { data: lesson, error: lessonError } = await supabase
    .from('live_lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json({ error: 'Ders bulunamadı.' }, { status: 404 });
  }
  if (lesson.status === 'cancelled' || lesson.status === 'ended') {
    return NextResponse.json({ error: 'Bu ders artık aktif değil.' }, { status: 409 });
  }
  if (role === 'student' && !canUserAccessLiveLesson(lesson as LiveLesson, auth.user)) {
    return NextResponse.json({ error: 'Bu ders size açık değil.' }, { status: 403 });
  }

  let micPermission: LiveLessonMicPermission =
    role === 'teacher' ? 'allowed' : 'blocked';
  let microphoneAllowed = role === 'teacher';
  let mutedByTeacher = role !== 'teacher';

  if (role === 'student') {
    const { data: previous } = await supabase
      .from('live_lesson_participants')
      .select('mic_permission, microphone_allowed, muted_by_teacher')
      .eq('lesson_id', lessonId)
      .eq('identity', identity)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const previousRow = (previous || null) as
      | {
          mic_permission?: LiveLessonMicPermission | null;
          microphone_allowed?: boolean | null;
          muted_by_teacher?: boolean | null;
        }
      | null;

    if (
      previousRow?.mic_permission === 'allowed' &&
      previousRow.microphone_allowed === true &&
      previousRow.muted_by_teacher !== true
    ) {
      micPermission = 'allowed';
      microphoneAllowed = true;
      mutedByTeacher = false;
    }
  }

  await supabase.from('live_lesson_participants').insert({
    identity,
    lesson_id: lessonId,
    last_seen_at: new Date().toISOString(),
    mic_permission: micPermission,
    microphone_allowed: microphoneAllowed,
    muted_by_teacher: mutedByTeacher,
    role,
    user_id: auth.user.id,
    user_name: auth.user.name,
  });

  if (role === 'teacher' && lesson.status === 'scheduled') {
    await supabase
      .from('live_lessons')
      .update({ started_at: new Date().toISOString(), status: 'active' })
      .eq('id', lessonId);
  }

  return NextResponse.json({ lesson, role });
}
