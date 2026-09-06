import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rate-limit';

const log = createLogger('admin-broadcast');

const adminBroadcastSchema = z.object({
  target_grade: z.union([z.string().trim().min(1), z.number()]),
  title: z.string().trim().min(1, 'Bildirim başlığı zorunludur.').max(120, 'Başlık çok uzun.'),
  message: z.string().trim().min(1, 'Bildirim mesajı zorunludur.').max(1000, 'Mesaj çok uzun.'),
  image_url: z.string().trim().url('Geçerli bir görsel bağlantısı giriniz.').optional().or(z.literal('')),
  link_url: z.string().trim().url('Geçerli bir bağlantı adresi giriniz.').optional().or(z.literal('')),
});

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

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  const limited = await enforceRateLimit('admin-broadcast', auth.user.id, {
    limit: 10,
    windowSeconds: 60,
  });
  if (limited) {
    return limited;
  }

  const body = await request.json().catch(() => null);
  const parsed = adminBroadcastSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message || 'Geçersiz toplu bildirim isteği.',
      400,
      'invalid_admin_broadcast',
    );
  }

  const { target_grade, title, message, image_url, link_url } = parsed.data;

  try {
    let query = auth.serviceRole.from('profiles').select('id, grade');
    const normalizedGrade = String(target_grade).trim();

    if (normalizedGrade !== 'all') {
      const num = Number(normalizedGrade);
      query = query.eq('grade', Number.isFinite(num) ? num : normalizedGrade);
    }

    const { data: students, error: queryError } = await query;

    if (queryError) {
      log.error('Failed to query students for broadcast', queryError);
      return apiError('Öğrenci listesi alınamadı.', 500, 'students_query_failed');
    }

    const eligibleStudents = (students || []).filter(
      (s: { id?: string | null }) => Boolean(s.id),
    );

    if (eligibleStudents.length === 0) {
      return apiOk({
        recipient_count: 0,
        target_grade: normalizedGrade,
        message: 'Seçilen sınıfta öğrenci bulunamadı.',
      });
    }

    const metadataPayload = {
      image_url: image_url?.trim() || null,
      link_url: link_url?.trim() || null,
      sender_name: 'Uğur Hoca',
      target_grade: normalizedGrade,
    };

    const notificationRows = eligibleStudents.map((student: { id: string }) => ({
      user_id: student.id,
      title,
      message,
      type: 'general',
      metadata: metadataPayload,
    }));

    // Insert notifications in batches of 250 rows
    const BATCH_SIZE = 250;
    for (let i = 0; i < notificationRows.length; i += BATCH_SIZE) {
      const chunk = notificationRows.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await auth.serviceRole
        .from('notifications')
        .insert(chunk);

      if (insertError) {
        log.error('Broadcast notification batch insertion failed', insertError);
        return apiError(
          'Bildirimler kaydedilirken bir hata oluştu.',
          500,
          'notification_insert_failed',
        );
      }
    }

    log.info('Admin broadcast successfully sent', {
      recipientCount: notificationRows.length,
      targetGrade: normalizedGrade,
    });

    return apiOk({
      recipient_count: notificationRows.length,
      target_grade: normalizedGrade,
    });
  } catch (error) {
    log.error('Unexpected error in admin broadcast', error);
    return apiError('Beklenmeyen bir sunucu hatası oluştu.', 500, 'server_error');
  }
}
