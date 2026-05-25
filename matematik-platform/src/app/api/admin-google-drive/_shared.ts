import { apiError } from '@/lib/api-response';
import { isAdminEmail } from '@/lib/admin';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';

export const GOOGLE_DRIVE_OAUTH_STATE_COOKIE = 'ugur_google_drive_oauth_state';

export async function requireGoogleDriveAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : ((await getServerAccessToken()) ?? '');

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

  return { serviceRole: createServiceRoleClient(), user };
}
