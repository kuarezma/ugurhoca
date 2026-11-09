// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/app/api/admin-google-drive/_shared', () => ({
  GOOGLE_DRIVE_OAUTH_STATE_COOKIE: 'google_drive_oauth_state',
  requireGoogleDriveAdmin: vi.fn(),
}));

vi.mock('@/lib/google-drive-oauth', () => ({
  getGoogleDriveOAuthConfig: vi.fn(),
  buildGoogleDriveAuthUrl: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

import { requireGoogleDriveAdmin } from '@/app/api/admin-google-drive/_shared';
import {
  getGoogleDriveOAuthConfig,
  buildGoogleDriveAuthUrl,
} from '@/lib/google-drive-oauth';
import { GET } from './route';

describe('GET /api/admin-google-drive/auth-url', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.mocked(requireGoogleDriveAdmin).mockResolvedValue({
      user: { id: 'admin-1', email: 'admin@ugurhoca.com' },
      serviceRole: {} as never,
    } as unknown as Awaited<ReturnType<typeof requireGoogleDriveAdmin>>);
  });

  it('admin yetkisi yoksa auth.error yanıtını döndürür', async () => {
    vi.mocked(requireGoogleDriveAdmin).mockResolvedValueOnce({
      error: NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 }),
    } as unknown as Awaited<ReturnType<typeof requireGoogleDriveAdmin>>);

    const req = new Request(
      'https://ugurhoca.com/api/admin-google-drive/auth-url',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(401);
  });

  it('OAuth yapılandırması eksikse 500 google_drive_oauth_config_missing döner', async () => {
    vi.mocked(getGoogleDriveOAuthConfig).mockImplementationOnce(() => {
      throw new Error('Missing client_id');
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-google-drive/auth-url',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('google_drive_oauth_config_missing');
  });

  it('başarılı durumda 200 döner, yetkilendirme linkini ve state çerezini ayarlar', async () => {
    vi.mocked(getGoogleDriveOAuthConfig).mockReturnValueOnce({
      clientId: 'google-client-id',
      clientSecret: 'google-client-secret',
      redirectUri: 'https://ugurhoca.com/api/admin-google-drive/callback',
    });

    vi.mocked(buildGoogleDriveAuthUrl).mockReturnValueOnce(
      'https://accounts.google.com/o/oauth2/v2/auth?client_id=google-client-id',
    );

    const req = new Request(
      'https://ugurhoca.com/api/admin-google-drive/auth-url',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(200);

    const body = (await res.json()) as { data: { url: string } };
    expect(body.data.url).toContain(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );

    const cookieHeader = res.headers.get('set-cookie');
    expect(cookieHeader).toBeTruthy();
    expect(cookieHeader).toContain('google_drive_oauth_state=');
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toMatch(/SameSite=lax/i);
  });

  it('production modunda state çerezi Secure olarak işaretlenir', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    vi.mocked(getGoogleDriveOAuthConfig).mockReturnValueOnce({
      clientId: 'google-client-id',
      clientSecret: 'google-client-secret',
      redirectUri: 'https://ugurhoca.com/api/admin-google-drive/callback',
    });

    vi.mocked(buildGoogleDriveAuthUrl).mockReturnValueOnce(
      'https://accounts.google.com',
    );

    const req = new Request(
      'https://ugurhoca.com/api/admin-google-drive/auth-url',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(200);

    const cookieHeader = res.headers.get('set-cookie');
    expect(cookieHeader).toContain('Secure');
  });
});
