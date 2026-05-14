import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireLiveLessonUser } from '@/features/live-lessons/server/liveLessons';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  const { lessonId } = await context.params;
  const supabase = createServiceRoleClient();
  const leftAt = new Date().toISOString();

  const { data: latest } = await supabase
    .from('live_lesson_participants')
    .select('id')
    .eq('lesson_id', lessonId)
    .eq('user_id', auth.user.id)
    .is('left_at', null)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest?.id) return NextResponse.json({ ok: true });

  await supabase
    .from('live_lesson_participants')
    .update({ left_at: leftAt })
    .eq('id', latest.id);

  await supabase.from('live_lesson_events').insert({
    event_type: 'leave',
    lesson_id: lessonId,
    payload: { left_at: leftAt },
    user_id: auth.user.id,
    user_name: auth.user.name,
  });

  return NextResponse.json({ ok: true });
}
