import { NextResponse } from 'next/server';
import {
  createLiveLesson,
  loadLiveLessonsForCurrentUser,
  requireLiveLessonUser,
  isLiveLessonAdmin,
} from '@/features/live-lessons/server/liveLessons';

export const runtime = 'nodejs';

export async function GET() {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;

  const lessons = await loadLiveLessonsForCurrentUser();
  return NextResponse.json({ lessons });
}

export async function POST(request: Request) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  if (!isLiveLessonAdmin(auth.user)) {
    return NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekir.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        description?: string | null;
        durationMinutes?: number;
        startsAt?: string;
        targetGrade?: string;
        title?: string;
      }
    | null;

  try {
    const lesson = await createLiveLesson({
      description: body?.description || null,
      durationMinutes: Number(body?.durationMinutes || 60),
      startsAt: String(body?.startsAt || ''),
      targetGrade: String(body?.targetGrade || ''),
      title: String(body?.title || ''),
      userId: auth.user.id,
    });
    return NextResponse.json({ lesson });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ders planlanamadı.' },
      { status: 400 },
    );
  }
}
