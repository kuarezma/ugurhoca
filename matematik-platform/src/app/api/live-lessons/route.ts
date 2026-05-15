import { NextResponse } from 'next/server';
import {
  createLiveLessons,
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
  try {
    const auth = await requireLiveLessonUser();
    if (!auth.ok) return auth.response;
    if (!isLiveLessonAdmin(auth.user)) {
      return NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekir.' }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as
      | {
          description?: string | null;
          durationMinutes?: number;
          repeatWeeklyUntil?: string | null;
          startsAt?: string;
          targetGrade?: string;
          targetStudentIds?: string[];
          title?: string;
        }
      | null;

    const lessons = await createLiveLessons({
      description: body?.description || null,
      durationMinutes: Number(body?.durationMinutes || 60),
      repeatWeeklyUntil: body?.repeatWeeklyUntil || null,
      startsAt: String(body?.startsAt || ''),
      targetGrade: String(body?.targetGrade || ''),
      targetStudentIds: Array.isArray(body?.targetStudentIds) ? body.targetStudentIds : [],
      title: String(body?.title || ''),
      userId: auth.user.id,
    });
    return NextResponse.json({ lesson: lessons[0], lessons });
  } catch (error) {
    console.error('Canlı ders planlama hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ders planlanamadı.' },
      { status: 400 },
    );
  }
}
