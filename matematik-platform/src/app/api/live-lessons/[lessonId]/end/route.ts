import { NextResponse } from 'next/server';
import {
  isLiveLessonAdmin,
  requireLiveLessonUser,
  updateLiveLessonStatus,
} from '@/features/live-lessons/server/liveLessons';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  if (!isLiveLessonAdmin(auth.user)) {
    return NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekir.' }, { status: 403 });
  }

  const { lessonId } = await context.params;
  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  const status = body?.status === 'cancelled' ? 'cancelled' : 'ended';

  try {
    const lesson = await updateLiveLessonStatus({ lessonId, status });
    return NextResponse.json({ lesson });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ders güncellenemedi.' },
      { status: 400 },
    );
  }
}
