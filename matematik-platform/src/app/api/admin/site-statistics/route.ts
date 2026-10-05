import { apiError, apiOk } from '@/lib/api-response';
import { requireAdmin } from '@/lib/api-auth';
import { getAdminEmailAllowlist } from '@/lib/admin';
import { createLogger } from '@/lib/logger';

const log = createLogger('api:admin:site-statistics');

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth && auth.error) return auth.error;

  const range = new URL(request.url).searchParams.get('range') ?? 'all';
  if (range !== 'week' && range !== 'month' && range !== 'all') {
    return apiError('Geçersiz tarih aralığı.', 400, 'invalid_statistics_range');
  }

  const days = range === 'week' ? 7 : range === 'month' ? 30 : null;
  const since = days === null ? null : new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await auth.serviceRole.rpc('admin_site_statistics', {
    p_since: since,
    p_admin_emails: getAdminEmailAllowlist(),
  });

  if (error || !data) {
    log.error('Site istatistikleri yüklenemedi', error);
    return apiError('İstatistikler yüklenemedi.', 500, 'statistics_load_failed');
  }

  return apiOk(data, { headers: { 'Cache-Control': 'private, no-store' } });
}
