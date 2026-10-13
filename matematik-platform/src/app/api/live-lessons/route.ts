import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createLiveLessons,
  loadLiveLessonsForCurrentUser,
  requireLiveLessonUser,
  isLiveLessonAdmin,
  LiveLessonInputError,
} from '@/features/live-lessons/server/liveLessons';
import { logger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const createLiveLessonBodySchema = z.object({
  description: z.string().nullable().optional(),
  durationMinutes: z.coerce.number().optional(),
  repeatWeeklyUntil: z.string().nullable().optional(),
  startsAt: z.string().optional(),
  targetGrade: z.string().optional(),
  targetStudentIds: z.array(z.string()).optional(),
  title: z.string().optional(),
});

export async function GET() {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;

  const limited = await enforceRateLimit(
    'live-lessons-list',
    auth.user.id,
    { limit: 60, windowSeconds: 60 },
  );
  if (limited) return limited;

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

    const limited = await enforceRateLimit(
      'live-lessons-create',
      auth.user.id,
      { limit: 20, windowSeconds: 60 },
    );
    if (limited) return limited;

    const rawBody = await request.json().catch(() => null);
    const parsedBody = createLiveLessonBodySchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Geçersiz ders planlama isteği.' }, { status: 400 });
    }
    const body = parsedBody.data;

    const lessons = await createLiveLessons({
      description: body.description || null,
      durationMinutes: Number(body.durationMinutes || 60),
      repeatWeeklyUntil: body.repeatWeeklyUntil || null,
      startsAt: String(body.startsAt || ''),
      targetGrade: String(body.targetGrade || ''),
      targetStudentIds: Array.isArray(body.targetStudentIds) ? body.targetStudentIds : [],
      title: String(body.title || ''),
      userId: auth.user.id,
    });
    return NextResponse.json({ lesson: lessons[0], lessons });
  } catch (error) {
    if (error instanceof LiveLessonInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logger.error('Canlı ders planlama hatası', error);
    return NextResponse.json({ error: 'Ders planlanamadı.' }, { status: 400 });
  }
}
