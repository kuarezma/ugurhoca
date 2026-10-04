import { apiOk } from '@/lib/api-response';
import { loadLgsSchoolPageData } from '@/features/programs/server';

export async function GET() {
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
