import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { apiError, apiOk } from '@/lib/api-response';
import {
  buildGoogleDriveAuthUrl,
  getGoogleDriveOAuthConfig,
} from '@/lib/google-drive-oauth';
import {
  GOOGLE_DRIVE_OAUTH_STATE_COOKIE,
  requireGoogleDriveAdmin,
} from '@/app/api/admin-google-drive/_shared';

export async function GET(request: Request) {
  const auth = await requireGoogleDriveAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  try {
    const state = randomUUID();
    const url = buildGoogleDriveAuthUrl({
      config: getGoogleDriveOAuthConfig(),
      state,
    });
    const response = apiOk({ url }) as NextResponse;
    response.cookies.set(GOOGLE_DRIVE_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : 'Google Drive bağlantı ayarları eksik.',
      500,
      'google_drive_oauth_config_missing',
    );
  }
}
