import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import {
  exchangeGoogleDriveCode,
  fetchGoogleUserInfo,
  getGoogleDriveOAuthConfig,
  getGoogleTokenExpiry,
} from '@/lib/google-drive-oauth';
import {
  GOOGLE_DRIVE_OAUTH_STATE_COOKIE,
  requireGoogleDriveAdmin,
} from '@/app/api/admin-google-drive/_shared';

const log = createLogger('google-drive-callback');

const redirectToAdmin = (request: Request, status: string) =>
  NextResponse.redirect(new URL(`/admin?drive=${status}`, request.url));

export async function GET(request: Request) {
  const auth = await requireGoogleDriveAdmin(request);

  if ('error' in auth) {
    return redirectToAdmin(request, 'auth_required');
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code')?.trim() || '';
  const state = url.searchParams.get('state')?.trim() || '';
  const cookieStore = await cookies();
  const storedState = cookieStore.get(GOOGLE_DRIVE_OAUTH_STATE_COOKIE)?.value || '';
  const redirect = redirectToAdmin(request, 'connected');

  redirect.cookies.delete(GOOGLE_DRIVE_OAUTH_STATE_COOKIE);

  if (!code || !state || state !== storedState) {
    return redirectToAdmin(request, 'state_error');
  }

  try {
    const token = await exchangeGoogleDriveCode({
      code,
      config: getGoogleDriveOAuthConfig(),
    });

    if (!token.refresh_token) {
      return redirectToAdmin(request, 'missing_refresh_token');
    }

    const userInfo = await fetchGoogleUserInfo(token.access_token);

    const { error } = await auth.serviceRole
      .from('google_drive_connections')
      .upsert(
        {
          admin_user_id: auth.user.id,
          connected_at: new Date().toISOString(),
          expires_at: getGoogleTokenExpiry(token.expires_in),
          google_email: userInfo?.email ?? null,
          refresh_token: token.refresh_token,
          scope: token.scope ?? null,
          token_type: token.token_type ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'admin_user_id' },
      );

    if (error) {
      throw error;
    }

    return redirect;
  } catch (error) {
    log.error('Google Drive callback failed', error);
    return redirectToAdmin(request, 'error');
  }
}
