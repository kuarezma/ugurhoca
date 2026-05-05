import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import {
  adminAnnouncementCreateSchema,
  adminAnnouncementDeleteSchema,
  adminAnnouncementUpdateSchema,
} from '@/lib/route-schemas';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('admin-announcements');

const getAccessToken = async (request: Request) => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return (await getServerAccessToken()) ?? '';
  }

  return authHeader.slice(7).trim();
};

const requireAdmin = async (request: Request) => {
  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return { error: apiError('Oturum açmanız gerekiyor.', 401, 'missing_access_token') };
  }

  const supabase = createServerSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user?.id) {
    return { error: apiError('Oturum açmanız gerekiyor.', 401, 'invalid_session') };
  }

  if (!isAdminEmail(user.email)) {
    return { error: apiError('Bu işlem için yetkiniz yok.', 403, 'not_admin') };
  }

  return { serviceRole: createServiceRoleClient(), user };
};

const normalizeAnnouncementPayload = (
  payload: Partial<{
    content: string | null;
    image_url: string;
    image_urls: string[];
    link_url: string;
    title: string;
  }>,
) => ({
  ...(payload.content !== undefined
    ? { content: payload.content?.trim() ? payload.content.trim() : null }
    : {}),
  ...(payload.image_url !== undefined
    ? { image_url: payload.image_url.trim() || null }
    : {}),
  ...(payload.image_urls !== undefined
    ? { image_urls: payload.image_urls.filter(Boolean) }
    : {}),
  ...(payload.link_url !== undefined
    ? { link_url: payload.link_url.trim() || null }
    : {}),
  ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
});

const isNotFoundError = (error: { code?: string | null; message?: string | null }) =>
  error.code === 'PGRST116' || error.message?.toLowerCase().includes('no rows') === true;

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminAnnouncementCreateSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message || 'Geçersiz duyuru isteği.',
      400,
      'invalid_admin_announcement_create',
    );
  }

  const announcementPayload = normalizeAnnouncementPayload(parsed.data.announcement);
  const { data, error } = await auth.serviceRole
    .from('announcements')
    .insert([announcementPayload])
    .select('*')
    .single();

  if (error) {
    log.error('Announcement insert failed', error);
    return apiError('Duyuru kaydedilemedi.', 500, 'announcement_insert_failed');
  }

  if (parsed.data.recipient_user_ids.length > 0) {
    const { error: notificationError } = await auth.serviceRole
      .from('notifications')
      .insert(
        parsed.data.recipient_user_ids.map((userId) => ({
          user_id: userId,
          title: 'Yeni Duyuru',
          message: announcementPayload.title ?? '',
          type: 'general',
        })),
      );

    if (notificationError) {
      log.error('Announcement notification insert failed', notificationError);
      return apiError(
        'Duyuru bildirimi gönderilemedi.',
        500,
        'announcement_notification_failed',
      );
    }
  }

  return apiOk(data);
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminAnnouncementUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message || 'Geçersiz duyuru güncelleme isteği.',
      400,
      'invalid_admin_announcement_update',
    );
  }

  const { data, error } = await auth.serviceRole
    .from('announcements')
    .update(normalizeAnnouncementPayload(parsed.data.updates))
    .eq('id', parsed.data.announcement_id)
    .select('*')
    .single();

  if (error) {
    if (isNotFoundError(error)) {
      return apiError('Duyuru bulunamadı.', 404, 'announcement_not_found');
    }
    log.error('Announcement update failed', error);
    return apiError('Duyuru güncellenemedi.', 500, 'announcement_update_failed');
  }

  return apiOk(data);
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminAnnouncementDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message || 'Geçersiz duyuru silme isteği.',
      400,
      'invalid_admin_announcement_delete',
    );
  }

  const { data, error } = await auth.serviceRole
    .from('announcements')
    .delete()
    .eq('id', parsed.data.announcement_id)
    .select('id');

  if (error) {
    log.error('Announcement delete failed', error);
    return apiError('Duyuru silinemedi.', 500, 'announcement_delete_failed');
  }

  if (!data || data.length === 0) {
    return apiError('Duyuru bulunamadı.', 404, 'announcement_not_found');
  }

  return apiOk({ ok: true });
}
