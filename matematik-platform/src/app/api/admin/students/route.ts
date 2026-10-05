import { apiError, apiOk } from '@/lib/api-response';
import { requireAdmin } from '@/lib/api-auth';
import { getAdminEmailAllowlist } from '@/lib/admin';
import { toDisplayGrade } from '@/lib/grade';
import { createLogger } from '@/lib/logger';
import type { AdminUser } from '@/features/admin/types';

const log = createLogger('api:admin:students');
const PAGE_SIZE = 40;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth && auth.error) return auth.error;

  const params = new URL(request.url).searchParams;
  const page = Number(params.get('page') ?? '0');
  const sort = params.get('sort') ?? 'name';
  const grade = params.get('grade') ?? 'all';
  const favorite = params.get('favorite') ?? '0';
  const search = (params.get('search') ?? '').trim();
  if (!Number.isSafeInteger(page) || page < 0 || page > 100_000 ||
      (sort !== 'name' && sort !== 'created_at') ||
      (grade !== 'all' && grade !== 'Mezun' && (!/^\d{1,2}$/.test(grade) || Number(grade) < 1 || Number(grade) > 12)) ||
      (favorite !== '0' && favorite !== '1') || search.length > 80) {
    return apiError('Geçersiz öğrenci listesi filtresi.', 400, 'invalid_student_list_filter');
  }

  let query = auth.serviceRole.from('profiles').select('*', { count: 'exact' });
  for (const email of getAdminEmailAllowlist()) query = query.neq('email', email);
  if (grade !== 'all') query = query.eq('grade', grade === 'Mezun' ? 0 : Number(grade));
  if (favorite === '1') query = query.eq('is_favorite', true);
  if (search) {
    const escaped = search.replace(/[\\%_]/g, '\\$&');
    query = query.ilike('name', `%${escaped}%`);
  }

  query = sort === 'name'
    ? query.order('name', { ascending: true }).order('id', { ascending: true })
    : query.order('created_at', { ascending: false }).order('id', { ascending: false });
  const { data, count, error } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  if (error || count === null) {
    log.error('Öğrenci listesi yüklenemedi', error);
    return apiError('Öğrenciler yüklenemedi.', 500, 'student_list_failed');
  }

  return apiOk({
    items: ((data || []) as AdminUser[]).map((student) => ({
      ...student,
      grade: toDisplayGrade(student.grade),
    })),
    page,
    pageSize: PAGE_SIZE,
    total: count,
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}
