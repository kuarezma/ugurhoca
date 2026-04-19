import { apiError, apiOk } from '@/lib/api-response';
import { createLogger } from '@/lib/logger';
import { supportMessageSchema } from '@/lib/route-schemas';

const log = createLogger('support-message');
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL } from '@/lib/admin';
import {
  buildSupportNotificationPayload,
  cleanupExpiredNotifications,
  findActiveModerationAction,
  notifyAdminForSupportMessage,
  sendSupportEmail,
} from '@/features/support/server/supportMessages';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';

  if (!accessToken) {
    return apiError('Oturum açmanız gerekiyor.', 401, 'missing_access_token');
  }

  const supabase = createServerSupabaseClient(accessToken);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user?.id) {
    return apiError('Oturum açmanız gerekiyor.', 401, 'invalid_session');
  }

  const body = await request.json().catch(() => null);
  const parsed = supportMessageSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message || 'Mesaj içeriği eksik.',
      400,
      'invalid_support_message',
    );
  }

  if (parsed.data.sender_id !== user.id) {
    return apiError('Geçersiz istek.', 403, 'sender_mismatch');
  }

  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', ADMIN_EMAIL)
    .single();

  const adminId = admin?.id || 'admin-1';

  await cleanupExpiredNotifications(supabase);

  const activeAction = await findActiveModerationAction(
    supabase,
    adminId,
    parsed.data.sender_id,
  );

  if (activeAction?.action === 'block') {
    return apiError(
      'Mesaj gönderim hakkınız kaldırıldı.',
      403,
      'support_blocked',
    );
  }

  if (activeAction?.action === 'mute') {
    return apiError(
      'Geçici olarak mesaj gönderemezsiniz.',
      403,
      'support_muted',
    );
  }

  try {
    const payload = buildSupportNotificationPayload(parsed.data, request);

    await notifyAdminForSupportMessage(supabase, adminId, payload);

    try {
      await sendSupportEmail(parsed.data);
    } catch (emailError) {
      log.warn('Destek e-postası gönderilemedi', { error: String(emailError) });
    }

    return apiOk({ ok: true });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : 'Mesaj gönderilemedi.',
      500,
      'support_message_failed',
    );
  }
}
