import { apiOk } from '@/lib/api-response';
import { loadLgsSchoolPageData } from '@/features/programs/server';

export async function GET() {
  const data = await loadLgsSchoolPageData(2026);
  return apiOk(data);
}
