import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  requireLiveLessonUser,
} from '@/features/live-lessons/server/liveLessons';
import { parseLiveLessonIdentity } from '@/features/live-lessons/lib/participant-identity';
import type { LiveLesson } from '@/features/live-lessons/types';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  const { lessonId } = await context.params;
  if (isLiveLessonAdmin(auth.user)) return NextResponse.json({ approved: true });

  const currentIdentity = new URL(request.url).searchParams.get('identity') ?? '';
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from('live_lesson_events')
    .select('payload')
    .eq('lesson_id', lessonId)
    .eq('event_type', 'join_approved')
    .order('created_at', { ascending: false })
    .limit(100);

  const approved = (data || []).some((event) => {
    const payload = event.payload as Record<string, unknown> | null;
    return (
      payload?.target_identity === currentIdentity ||
      payload?.target_user_id === auth.user.id
    );
  });

  return NextResponse.json({ approved });
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  if (!isLiveLessonAdmin(auth.user)) {
    return NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekir.' }, { status: 403 });
  }

  const { lessonId } = await context.params;
  const body = (await request.json().catch(() => null)) as { targetIdentity?: string } | null;
  const targetIdentity = body?.targetIdentity?.trim() ?? '';
  const parsedIdentity = parseLiveLessonIdentity(targetIdentity);
  if (!parsedIdentity || parsedIdentity.role !== 'student') {
    return NextResponse.json({ error: 'Öğrenci kimliği geçersiz.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: lesson } = await supabase
    .from('live_lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: 'Ders bulunamadı.' }, { status: 404 });
  }

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('grade')
    .eq('id', parsedIdentity.userId)
    .maybeSingle();

  if (
    !canUserAccessLiveLesson(lesson as LiveLesson, {
      grade: (targetProfile as { grade?: string | number | null } | null)?.grade,
      id: parsedIdentity.userId,
    })
  ) {
    return NextResponse.json({ error: 'Öğrenci bu derse atanmadı.' }, { status: 403 });
  }

  const { error } = await supabase.from('live_lesson_events').insert({
    event_type: 'join_approved',
    lesson_id: lessonId,
    payload: {
      approved_at: new Date().toISOString(),
      target_identity: targetIdentity,
      target_user_id: parsedIdentity.userId,
    },
    user_id: auth.user.id,
    user_name: auth.user.name,
  });

  if (error) {
    return NextResponse.json({ error: 'Öğrenci onayı kaydedilemedi.' }, { status: 400 });
  }

  return NextResponse.json({ approved: true });
}
