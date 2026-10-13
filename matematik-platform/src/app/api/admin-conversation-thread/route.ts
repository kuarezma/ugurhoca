import { z } from 'zod';
import { requireAdmin } from '@/lib/api-auth';
import { createLogger } from '@/lib/logger';
import { apiError, apiOk } from '@/lib/api-response';
import { enforceRateLimit } from '@/lib/rate-limit';
import { mergeAdminThread } from '@/features/messages/mapNotificationsToThread';
import { parseSupportPayload } from '@/features/messages/supportChatUtils';

const log = createLogger('admin-conversation-thread');

const FETCH_LIMIT = 200;

const studentIdSchema = z
  .string()
  .trim()
  .min(1, 'student_id parametresi gerekli.');

export async function GET(request: Request) {
  let auth: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    auth = await requireAdmin(request);
  } catch (envError) {
    log.error('Service role client oluşturulamadı', envError);
    return apiError('Sunucu yapılandırması eksik.', 500, 'service_unavailable');
  }

  if (auth.error) {
    return auth.error;
  }

  const limited = await enforceRateLimit(
    'admin-conversation-thread',
    auth.user.id,
    { limit: 60, windowSeconds: 60 },
  );
  if (limited) {
    return limited;
  }

  const url = new URL(request.url);
  const parsedStudentId = studentIdSchema.safeParse(
    url.searchParams.get('student_id') ?? '',
  );

  if (!parsedStudentId.success) {
    return apiError('student_id parametresi gerekli.', 400, 'missing_student_id');
  }

  const studentId = parsedStudentId.data;
  const service = auth.serviceRole;
  const adminUserId = auth.user.id;

  const [inboxRes, repliesRes] = await Promise.all([
    service
      .from('notifications')
      .select('id, created_at, message, is_read')
      .eq('user_id', adminUserId)
      .eq('type', 'message')
      .order('created_at', { ascending: true })
      .limit(FETCH_LIMIT),
    service
      .from('notifications')
      .select('id, created_at, message, metadata, is_read')
      .eq('user_id', studentId)
      .eq('type', 'admin-message')
      .order('created_at', { ascending: true })
      .limit(FETCH_LIMIT),
  ]);

  if (inboxRes.error) {
    log.error('Admin inbox okuma hatası', inboxRes.error);
    return apiError('Mesaj geçmişi getirilemedi.', 500, 'inbox_fetch_failed');
  }

  if (repliesRes.error) {
    log.error('Öğrenci admin-message okuma hatası', repliesRes.error);
    return apiError('Mesaj yanıtları getirilemedi.', 500, 'replies_fetch_failed');
  }

  const inboxRows = (inboxRes.data || []).filter((n) => {
    const parsed = parseSupportPayload(n.message);
    return parsed?.sender_id === studentId;
  });

  const merged = mergeAdminThread(
    inboxRows,
    (repliesRes.data || []) as Parameters<typeof mergeAdminThread>[1],
  );

  return apiOk({ messages: merged });
}
