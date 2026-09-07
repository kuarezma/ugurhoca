import { RoomServiceClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';
import { isLiveLessonAdmin, requireLiveLessonUser } from '@/features/live-lessons/server/liveLessons';
import { getLiveKitServiceHost } from '@/features/live-lessons/lib/lesson-auth';
import { deriveLiveKitIdentity } from '@/features/live-lessons/lib/lesson-identity';

export const runtime = 'nodejs';

const log = createLogger('live-lesson-approval');

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

const studentIdentityPrefix = 'student_';

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireLiveLessonUser();
  if (!auth.ok) return auth.response;
  if (isLiveLessonAdmin(auth.user)) return NextResponse.json({ approved: true });

  const { lessonId } = await context.params;
  // Kimlik istemciden gelen bir query parametresinden değil, doğrulanmış
  // oturumdan türetilir — aksi halde bir öğrenci başka bir öğrencinin
  // (odadaki katılımcı listesinden görebileceği) kimliğini sorgulayarak
  // onun onay durumunu kendi hesabına mal edebilirdi.
  const myIdentity = deriveLiveKitIdentity('student', auth.user.id);

  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from('live_lesson_events')
    .select('payload')
    .eq('lesson_id', lessonId)
    .eq('event_type', 'join_approved')
    .order('created_at', { ascending: false })
    .limit(200);

  const approved = (data || []).some((event) => {
    const payload = event.payload as Record<string, unknown> | null;
    return payload?.target_identity === myIdentity;
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
  if (!targetIdentity.startsWith(studentIdentityPrefix) || targetIdentity.length > 64) {
    return NextResponse.json({ error: 'Öğrenci kimliği geçersiz.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: lesson } = await supabase
    .from('live_lessons')
    .select('room_id')
    .eq('id', lessonId)
    .single();

  const { error } = await supabase.from('live_lesson_events').insert({
    event_type: 'join_approved',
    lesson_id: lessonId,
    payload: {
      approved_at: new Date().toISOString(),
      target_identity: targetIdentity,
    },
    user_id: auth.user.id,
    user_name: auth.user.name,
  });

  if (error) {
    return NextResponse.json({ error: 'Öğrenci onayı kaydedilemedi.' }, { status: 400 });
  }

  // Onay kaydı, öğrenci yeniden token isteğinde bulunduğunda zaten
  // canPublish: true üretir (bkz. /api/livekit/token). Öğrenci hâlihazırda
  // odaya bağlıysa yeniden bağlanmasını beklemeden LiveKit'e halihazırdaki
  // katılımcının iznini anında yükseltmesini de söyleriz — başarısız olursa
  // (ör. öğrenci henüz bağlanmadıysa) sorun değil, token isteğinde zaten
  // doğru izin verilecek.
  const livekitHost = getLiveKitServiceHost();
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (livekitHost && apiKey && apiSecret && lesson?.room_id) {
    try {
      const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
      await roomService.updateParticipant(lesson.room_id, targetIdentity, undefined, {
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
      });
    } catch (livekitError) {
      log.warn('LiveKit katılımcı izni anlık yükseltilemedi (öğrenci henüz bağlı olmayabilir)', {
        error: livekitError instanceof Error ? livekitError.message : String(livekitError),
        lessonId,
        targetIdentity,
      });
    }
  }

  return NextResponse.json({ approved: true });
}
