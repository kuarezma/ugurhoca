import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { isLiveLessonAdmin, requireLiveLessonUser } from '@/features/live-lessons/server/liveLessons';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

const studentIdentityPrefix = 'student_';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function userIdFromIdentity(identity: string): string | null {
  if (!identity.startsWith(studentIdentityPrefix)) return null;
  const value = identity.slice(studentIdentityPrefix.length);
  return uuidPattern.test(value) ? value : null;
}

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
  if (!targetIdentity.startsWith(studentIdentityPrefix)) {
    return NextResponse.json({ error: 'Öğrenci kimliği geçersiz.' }, { status: 400 });
  }

  const targetUserId = userIdFromIdentity(targetIdentity);
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('live_lesson_events').insert({
    event_type: 'join_approved',
    lesson_id: lessonId,
    payload: {
      approved_at: new Date().toISOString(),
      target_identity: targetIdentity,
      ...(targetUserId ? { target_user_id: targetUserId } : {}),
    },
    user_id: auth.user.id,
    user_name: auth.user.name,
  });

  if (error) {
    return NextResponse.json({ error: 'Öğrenci onayı kaydedilemedi.' }, { status: 400 });
  }

  return NextResponse.json({ approved: true });
}
