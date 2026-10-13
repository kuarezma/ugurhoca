import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  isLiveLessonAdmin,
  requireLiveLessonUser,
  updateLiveLesson,
  LiveLessonInputError,
} from '@/features/live-lessons/server/liveLessons';
import { logger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

const updateLiveLessonBodySchema = z.object({
  description: z.string().nullable().optional(),
  durationMinutes: z.coerce.number().optional(),
  materialsUrl: z.string().nullable().optional(),
  recordingUrl: z.string().nullable().optional(),
  startsAt: z.string().optional(),
  targetGrade: z.string().optional(),
  targetStudentIds: z.array(z.string()).optional(),
  title: z.string().optional(),
});

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  if (!isLiveLessonAdmin(auth.user)) {
    return NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekir.' }, { status: 403 });
  }

  const limited = await enforceRateLimit(
    'live-lesson-update',
    auth.user.id,
    { limit: 30, windowSeconds: 60 },
  );
  if (limited) return limited;

  const { lessonId } = await context.params;
  const rawBody = await request.json().catch(() => null);
  const parsedBody = updateLiveLessonBodySchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Geçersiz ders güncelleme isteği.' }, { status: 400 });
  }
  const body = parsedBody.data;

  try {
    const lesson = await updateLiveLesson({
      description: body.description || null,
      durationMinutes: Number(body.durationMinutes || 60),
      lessonId,
      materialsUrl: body.materialsUrl ?? null,
      recordingUrl: body.recordingUrl ?? null,
      startsAt: String(body.startsAt || ''),
      targetGrade: String(body.targetGrade || ''),
      targetStudentIds: Array.isArray(body.targetStudentIds) ? body.targetStudentIds : [],
      title: String(body.title || ''),
    });
    return NextResponse.json({ lesson });
  } catch (error) {
    if (error instanceof LiveLessonInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logger.error('Canlı ders güncelleme hatası', error);
    return NextResponse.json({ error: 'Ders güncellenemedi.' }, { status: 400 });
  }
}
