import { NextResponse } from 'next/server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  isLiveLessonAdmin,
  requireLiveLessonUser,
} from '@/features/live-lessons/server/liveLessons';
import { deriveLiveKitIdentity } from '@/features/live-lessons/lib/lesson-identity';

export const runtime = 'nodejs';
type RouteContext = { params: Promise<{ lessonId: string }> };

async function getParticipantNames(context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  if (!isLiveLessonAdmin(auth.user)) {
    return NextResponse.json(
      { error: 'Öğretmen yetkisi gerekiyor.' },
      { status: 403 },
    );
  }
  const limited = await enforceRateLimit(
    'live-lesson-participants',
    auth.user.id,
    {
      limit: 60,
      windowSeconds: 60,
    },
  );
  if (limited) return limited;
  const { lessonId } = await context.params;
  const { data, error } = await createServiceRoleClient()
    .from('live_lesson_participants')
    .select('user_id, user_name, role')
    .eq('lesson_id', lessonId);
  if (error) {
    return NextResponse.json(
      { error: 'Katılımcı adları alınamadı.' },
      { status: 500 },
    );
  }
  const participantNames: Record<string, string> = {};
  for (const row of data || []) {
    if (!row.user_id) continue;
    const identity = deriveLiveKitIdentity(
      row.role === 'teacher' ? 'teacher' : 'student',
      row.user_id,
    );
    participantNames[identity] = row.user_name;
  }
  return NextResponse.json({ participantNames });
}

export async function GET(_request: Request, context: RouteContext) {
  const response = await getParticipantNames(context);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
