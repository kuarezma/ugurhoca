import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';
import { createLogger } from '@/lib/logger';
import { apiError, apiOk } from '@/lib/api-response';
import { mergeAdminThread } from '@/features/messages/mapNotificationsToThread';
import { parseSupportPayload } from '@/features/messages/supportChatUtils';

const log = createLogger('admin-conversation-thread');

const FETCH_LIMIT = 200;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';

  if (!accessToken) {
    return apiError('Oturum açmanız gerekiyor.', 401, 'missing_access_token');
  }

  const authClient = createServerSupabaseClient(accessToken);
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(accessToken);

  if (userError || !user?.email) {
    return apiError('Oturum açmanız gerekiyor.', 401, 'invalid_session');
  }

  if (!isAdminEmail(user.email)) {
    return apiError('Bu işlem için yetkiniz yok.', 403, 'not_admin');
  }

  const url = new URL(request.url);
  const studentId = url.searchParams.get('student_id')?.trim();

  if (!studentId) {
    return apiError('student_id parametresi gerekli.', 400, 'missing_student_id');
  }

  let service: ReturnType<typeof createServiceRoleClient>;
  try {
    service = createServiceRoleClient();
  } catch (envError) {
    log.error('Service role client oluşturulamadı', envError);
    return apiError('Sunucu yapılandırması eksik.', 500, 'service_unavailable');
  }

  const adminUserId = user.id;

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
      .select('id, created_at, message, metadata')
      .eq('user_id', studentId)
      .eq('type', 'admin-message')
      .order('created_at', { ascending: true })
      .limit(FETCH_LIMIT),
  ]);

  if (inboxRes.error) {
    log.error('Admin inbox okuma hatası', inboxRes.error);
    return apiError(inboxRes.error.message, 500, 'inbox_fetch_failed');
  }

  if (repliesRes.error) {
    log.error('Öğrenci admin-message okuma hatası', repliesRes.error);
    return apiError(repliesRes.error.message, 500, 'replies_fetch_failed');
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
