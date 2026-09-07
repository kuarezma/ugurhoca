import { apiError, apiOk } from '@/lib/api-response';
import { requireAdmin } from '@/lib/api-auth';
import { createLogger } from '@/lib/logger';
import { scanCurrentWeekWorksheetCandidates } from '@/lib/worksheet-candidate-scan';

const log = createLogger('admin-worksheet-candidates-discover-week');

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  try {
    return apiOk(await scanCurrentWeekWorksheetCandidates(auth.serviceRole));
  } catch (error) {
    log.error('Haftalık aday tarama hatası', error);
    return apiError(
      error instanceof Error
        ? error.message
        : 'Haftalık test adayı taraması yapılamadı.',
      500,
      'worksheet_candidate_week_scan_failed',
    );
  }
}
