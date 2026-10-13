import { apiError, apiOk } from '@/lib/api-response';
import { requireAdmin } from '@/lib/api-auth';
import { createLogger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rate-limit';
import { scanCurrentWeekWorksheetCandidates } from '@/lib/worksheet-candidate-scan';

const log = createLogger('admin-worksheet-candidates-discover-week');

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  const limited = await enforceRateLimit(
    'admin-worksheet-discover-week',
    auth.user.id,
    { limit: 10, windowSeconds: 60 },
  );
  if (limited) {
    return limited;
  }

  try {
    return apiOk(await scanCurrentWeekWorksheetCandidates(auth.serviceRole));
  } catch (error) {
    log.error('Haftalık aday tarama hatası', error);
    return apiError(
      'Haftalık test adayı taraması yapılamadı. Lütfen daha sonra tekrar deneyin.',
      500,
      'worksheet_candidate_week_scan_failed',
    );
  }
}
