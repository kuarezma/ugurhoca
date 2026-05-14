import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { isLiveLessonAdmin, requireLiveLessonUser } from '@/features/live-lessons/server/liveLessons';

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
  if (role === 'student' && String(auth.user.grade) !== String(lesson.target_grade)) {
    return NextResponse.json({ error: 'Bu ders sizin sınıfınıza açık değil.' }, { status: 403 });
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

  return NextResponse.json({ lesson, role });
}
