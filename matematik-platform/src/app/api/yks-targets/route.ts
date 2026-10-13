import { apiError, apiOk } from '@/lib/api-response';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { loadYksProgramPageData } from '@/features/programs/server';

export async function GET(request: Request) {
  const limited = await enforceRateLimit(
    'yks-targets',
    getClientIp(request),
    { limit: 60, windowSeconds: 60 },
  );
  if (limited) {
    return limited;
  }

  const yearParam = new URL(request.url).searchParams.get('year');
  const year = yearParam === null ? 2026 : Number(yearParam);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return apiError('Geçerli bir veri yılı seçin.', 400, 'invalid_year');
  }

  const data = await loadYksProgramPageData(year);
  // Yalnızca herkese açık üniversite katalogları; kullanıcı verisi yoktur.
  return apiOk(data, {
    headers: {
      'Cache-Control': data.error
        ? 'no-store'
        : 'public, max-age=300, s-maxage=3600',
    },
  });
}
