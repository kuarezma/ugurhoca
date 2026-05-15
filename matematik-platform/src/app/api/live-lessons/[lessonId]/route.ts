import { NextResponse } from 'next/server';
import {
  isLiveLessonAdmin,
  requireLiveLessonUser,
  updateLiveLesson,
} from '@/features/live-lessons/server/liveLessons';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  if (!isLiveLessonAdmin(auth.user)) {
    return NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekir.' }, { status: 403 });
  }

  const { lessonId } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | {
        description?: string | null;
        durationMinutes?: number;
        startsAt?: string;
        targetGrade?: string;
        targetStudentIds?: string[];
        title?: string;
      }
    | null;

  try {
    const lesson = await updateLiveLesson({
      description: body?.description || null,
      durationMinutes: Number(body?.durationMinutes || 60),
      lessonId,
      startsAt: String(body?.startsAt || ''),
      targetGrade: String(body?.targetGrade || ''),
      targetStudentIds: Array.isArray(body?.targetStudentIds) ? body.targetStudentIds : [],
      title: String(body?.title || ''),
    });
    return NextResponse.json({ lesson });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ders güncellenemedi.' },
      { status: 400 },
    );
  }
}
