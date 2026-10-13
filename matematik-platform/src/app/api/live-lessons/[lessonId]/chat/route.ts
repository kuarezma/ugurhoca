import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  requireLiveLessonUser,
} from '@/features/live-lessons/server/liveLessons';
import type { LiveLesson } from '@/features/live-lessons/types';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

const chatMessageBodySchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Mesaj 1-500 karakter olmalı.')
    .max(500, 'Mesaj 1-500 karakter olmalı.'),
});

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;

  const limited = await enforceRateLimit(
    'live-lesson-chat-get',
    auth.user.id,
    { limit: 60, windowSeconds: 60 },
  );
  if (limited) return limited;

  const { lessonId } = await context.params;
  const supabase = createServiceRoleClient();

  const { data: lesson } = await supabase
    .from('live_lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: 'Ders bulunamadı.' }, { status: 404 });
  }

  if (!isLiveLessonAdmin(auth.user) && !canUserAccessLiveLesson(lesson as LiveLesson, auth.user)) {
    return NextResponse.json({ error: 'Bu dersin sohbetine erişim yetkiniz yok.' }, { status: 403 });
  }

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

  const limited = await enforceRateLimit(
    'live-lesson-chat-post',
    auth.user.id,
    { limit: 30, windowSeconds: 60 },
  );
  if (limited) return limited;

  const { lessonId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = chatMessageBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Mesaj 1-500 karakter olmalı.' }, { status: 400 });
  }
  const { message } = parsed.data;

  const supabase = createServiceRoleClient();

  const { data: lesson } = await supabase
    .from('live_lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (!lesson || lesson.status === 'ended' || lesson.status === 'cancelled') {
    return NextResponse.json({ error: 'Ders aktif değil veya bulunamadı.' }, { status: 404 });
  }

  if (!isLiveLessonAdmin(auth.user) && !canUserAccessLiveLesson(lesson as LiveLesson, auth.user)) {
    return NextResponse.json({ error: 'Bu dersin sohbetine mesaj gönderme yetkiniz yok.' }, { status: 403 });
  }
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
