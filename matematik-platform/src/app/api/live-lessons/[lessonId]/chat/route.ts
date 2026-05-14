import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { isLiveLessonAdmin, requireLiveLessonUser } from '@/features/live-lessons/server/liveLessons';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  const { lessonId } = await context.params;
  const supabase = createServiceRoleClient();

  const { data } = await supabase
    .from('live_lesson_chat_messages')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true })
    .limit(100);

  return NextResponse.json({ messages: data || [] });
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  const { lessonId } = await context.params;
  const body = (await request.json().catch(() => null)) as { message?: string } | null;
  const message = body?.message?.trim() || '';
  if (message.length < 1 || message.length > 500) {
    return NextResponse.json({ error: 'Mesaj 1-500 karakter olmalı.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const role = isLiveLessonAdmin(auth.user) ? 'teacher' : 'student';
  const { data, error } = await supabase
    .from('live_lesson_chat_messages')
    .insert({
      lesson_id: lessonId,
      message,
      role,
      user_id: auth.user.id,
      user_name: auth.user.name,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Mesaj gönderilemedi.' }, { status: 400 });
  }

  return NextResponse.json({ message: data });
}
