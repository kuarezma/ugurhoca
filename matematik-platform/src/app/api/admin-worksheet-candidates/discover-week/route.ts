import { apiError, apiOk } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import { createLogger } from '@/lib/logger';
import { scanCurrentWeekWorksheetCandidates } from '@/lib/worksheet-candidate-scan';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';

const log = createLogger('admin-worksheet-candidates-discover-week');

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
    return {
      error: apiError('Oturum açmanız gerekiyor.', 401, 'missing_access_token'),
    };
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

  return { serviceRole: createServiceRoleClient() };
};

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
