import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireLiveLessonUser } from '@/features/live-lessons/server/liveLessons';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

const leaveParamsSchema = z.object({
  lessonId: z.string().trim().min(1),
});

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;

  const limited = await enforceRateLimit(
    'live-lesson-leave',
    auth.user.id,
    { limit: 30, windowSeconds: 60 },
  );
  if (limited) return limited;

  const parsedParams = leaveParamsSchema.safeParse(await context.params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Geçersiz ders kimliği.' }, { status: 400 });
  }
  const { lessonId } = parsedParams.data;
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
