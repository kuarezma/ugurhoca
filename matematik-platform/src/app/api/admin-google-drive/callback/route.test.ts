// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/app/api/admin-google-drive/_shared', () => ({
  GOOGLE_DRIVE_OAUTH_STATE_COOKIE: 'google_drive_oauth_state',
  requireGoogleDriveAdmin: vi.fn(),
}));

vi.mock('@/lib/google-drive-oauth', () => ({
  exchangeGoogleDriveCode: vi.fn(),
  fetchGoogleUserInfo: vi.fn(),
  getGoogleDriveOAuthConfig: vi.fn(),
  getGoogleTokenExpiry: vi.fn(() =>
    new Date(Date.now() + 3600000).toISOString(),
  ),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

import { cookies } from 'next/headers';
import { requireGoogleDriveAdmin } from '@/app/api/admin-google-drive/_shared';
import {
  exchangeGoogleDriveCode,
  fetchGoogleUserInfo,
} from '@/lib/google-drive-oauth';
import { GET } from './route';

describe('GET /api/admin-google-drive/callback', () => {
  const mockAdminUser = { id: 'admin-1', email: 'admin@ugurhoca.com' };
  const mockUpsert = vi.fn();
  const mockFrom = vi.fn();

  const mockServiceRole = {
    from: mockFrom,
  };

  const mockCookieStore = {
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as never);
    vi.mocked(requireGoogleDriveAdmin).mockResolvedValue({
      user: mockAdminUser,
      serviceRole: mockServiceRole,
    } as unknown as Awaited<ReturnType<typeof requireGoogleDriveAdmin>>);
    mockFrom.mockReturnValue({ upsert: mockUpsert });
    mockUpsert.mockResolvedValue({ error: null });
  });

  it('admin yetkisi yoksa /admin?drive=auth_required yönlendirmesi yapar', async () => {
    vi.mocked(requireGoogleDriveAdmin).mockResolvedValueOnce({
      error: new Response(null, { status: 401 }),
    } as unknown as Awaited<ReturnType<typeof requireGoogleDriveAdmin>>);

    const req = new Request(
      'https://ugurhoca.com/api/admin-google-drive/callback?code=abc&state=xyz',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://ugurhoca.com/admin?drive=auth_required',
    );
  });

  it('state parametresi eksik veya çerezdekiyle eşleşmiyorsa /admin?drive=state_error yönlendirmesi yapar', async () => {
    mockCookieStore.get.mockReturnValueOnce({ value: 'expected-state' });

    const req = new Request(
      'https://ugurhoca.com/api/admin-google-drive/callback?code=abc&state=wrong-state',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://ugurhoca.com/admin?drive=state_error',
    );
  });

  it('kod değişimi sırasında refresh_token dönmezse /admin?drive=missing_refresh_token yönlendirmesi yapar', async () => {
    mockCookieStore.get.mockReturnValueOnce({ value: 'valid-state' });
    vi.mocked(exchangeGoogleDriveCode).mockResolvedValueOnce({
      access_token: 'access-123',
      expires_in: 3600,
      refresh_token: undefined,
    } as never);

    const req = new Request(
      'https://ugurhoca.com/api/admin-google-drive/callback?code=valid-code&state=valid-state',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://ugurhoca.com/admin?drive=missing_refresh_token',
    );
  });

  it('bağlantı veritabanına kaydedilirken hata oluşursa /admin?drive=error yönlendirmesi yapar', async () => {
    mockCookieStore.get.mockReturnValueOnce({ value: 'valid-state' });
    vi.mocked(exchangeGoogleDriveCode).mockResolvedValueOnce({
      access_token: 'access-123',
      refresh_token: 'refresh-123',
      expires_in: 3600,
    } as never);
    vi.mocked(fetchGoogleUserInfo).mockResolvedValueOnce({
      email: 'teacher@gmail.com',
    });
    mockUpsert.mockResolvedValueOnce({
      error: { message: 'Database constraint failure' },
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-google-drive/callback?code=valid-code&state=valid-state',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://ugurhoca.com/admin?drive=error',
    );
  });

  it('başarılı OAuth akışında bağlantıyı kaydeder ve /admin?drive=connected yönlendirmesi yapar', async () => {
    mockCookieStore.get.mockReturnValueOnce({ value: 'valid-state' });
    vi.mocked(exchangeGoogleDriveCode).mockResolvedValueOnce({
      access_token: 'access-123',
      refresh_token: 'refresh-123',
      expires_in: 3600,
      scope: 'https://www.googleapis.com/auth/drive.file',
      token_type: 'Bearer',
    } as never);
    vi.mocked(fetchGoogleUserInfo).mockResolvedValueOnce({
      email: 'teacher@gmail.com',
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-google-drive/callback?code=valid-code&state=valid-state',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://ugurhoca.com/admin?drive=connected',
    );
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        admin_user_id: 'admin-1',
        refresh_token: 'refresh-123',
        google_email: 'teacher@gmail.com',
      }),
      { onConflict: 'admin_user_id' },
    );
  });
});
