import { RoomServiceClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  isLiveLessonAdmin,
  requireLiveLessonUser,
  updateLiveLessonStatus,
  LiveLessonInputError,
} from '@/features/live-lessons/server/liveLessons';
import { getLiveKitServiceHost } from '@/features/live-lessons/lib/lesson-auth';
import { logger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

const endLessonBodySchema = z
  .object({
    status: z.enum(['ended', 'cancelled']).optional(),
  })
  .nullable()
  .optional();

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  if (!isLiveLessonAdmin(auth.user)) {
    return NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekir.' }, { status: 403 });
  }

  const limited = await enforceRateLimit(
    'live-lesson-end',
    auth.user.id,
    { limit: 20, windowSeconds: 60 },
  );
  if (limited) return limited;

  const { lessonId } = await context.params;
  const rawBody = await request.json().catch(() => null);
  const parsedBody = endLessonBodySchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Geçersiz ders durumu.' }, { status: 400 });
  }
  const status = parsedBody.data?.status === 'cancelled' ? 'cancelled' : 'ended';

  try {
    const lesson = await updateLiveLessonStatus({ lessonId, status });

    // LiveKit bulut odasını anında kapat ve katılımcıları düşürerek kota tüketimini kes
    const livekitHost = getLiveKitServiceHost();
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (livekitHost && apiKey && apiSecret && lesson?.room_id) {
      try {
        const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
        await roomService.deleteRoom(lesson.room_id);
      } catch {
        // Oda zaten boşalmış veya LiveKit tarafında kapanmış olabilir; ana akışı engelleme
      }
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    if (error instanceof LiveLessonInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logger.error('Canlı ders sonlandırma hatası', error);
    return NextResponse.json({ error: 'Ders güncellenemedi.' }, { status: 400 });
  }
}
