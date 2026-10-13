import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  requireLiveLessonUser,
  toClientLiveLesson,
} from '@/features/live-lessons/server/liveLessons';
import type { LiveLesson } from '@/features/live-lessons/types';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

const joinParamsSchema = z.object({
  lessonId: z.string().trim().min(1),
});

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;

  const limited = await enforceRateLimit(
    'live-lesson-join',
    auth.user.id,
    { limit: 20, windowSeconds: 60 },
  );
  if (limited) return limited;

  const parsedParams = joinParamsSchema.safeParse(await context.params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Geçersiz ders kimliği.' }, { status: 400 });
  }
  const { lessonId } = parsedParams.data;
  const supabase = createServiceRoleClient();
  const role = isLiveLessonAdmin(auth.user) ? 'teacher' : 'student';

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

  await supabase.from('live_lesson_participants').insert({
    lesson_id: lessonId,
    microphone_allowed: role === 'teacher',
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

  return NextResponse.json({ lesson: toClientLiveLesson(lesson as LiveLesson), role });
}
