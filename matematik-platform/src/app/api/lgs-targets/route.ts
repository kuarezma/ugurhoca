import { apiOk } from '@/lib/api-response';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { loadLgsSchoolPageData } from '@/features/programs/server';

export async function GET(request?: Request) {
  const limited = await enforceRateLimit(
    'lgs-targets',
    request ? getClientIp(request) : 'unknown',
    { limit: 60, windowSeconds: 60 },
  );
  if (limited) {
    return limited;
  }

  const data = await loadLgsSchoolPageData(2026);
  // Okul katalogları herkese açıktır; hata sonucu önbelleğe alınmaz.
  return apiOk(data, {
    headers: {
      'Cache-Control': data.error
        ? 'no-store'
        : 'public, max-age=300, s-maxage=3600',
    },
  });
}
