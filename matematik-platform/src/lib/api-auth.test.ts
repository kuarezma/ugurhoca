import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

const {
  mockGetServerAccessToken,
  mockGetUser,
  mockCreateServerSupabaseClient,
  mockCreateServiceRoleClient,
} = vi.hoisted(() => {
  const mockGetUserFn = vi.fn();
  return {
    mockGetServerAccessToken: vi.fn(),
    mockGetUser: mockGetUserFn,
    mockCreateServerSupabaseClient: vi.fn(() => ({
      auth: { getUser: mockGetUserFn },
    })),
    mockCreateServiceRoleClient: vi.fn(() => ({
      from: vi.fn(),
    })),
  };
});

vi.mock('@/lib/auth-snapshot.server', () => ({
  getServerAccessToken: mockGetServerAccessToken,
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: mockCreateServerSupabaseClient,
  createServiceRoleClient: mockCreateServiceRoleClient,
}));

import { getBearerOrCookieAccessToken, requireAdmin } from './api-auth';
import { isAuthorizedCronRequest } from './cron-auth';

describe('api-auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBearerOrCookieAccessToken', () => {
    it('istek başlığında Bearer token varsa doğrudan onu döndürür', async () => {
      const request = new Request('https://ugurhoca.com/api/test', {
        headers: {
          authorization: 'Bearer header-secret-token',
        },
      });

      const token = await getBearerOrCookieAccessToken(request);

      expect(token).toBe('header-secret-token');
      expect(mockGetServerAccessToken).not.toHaveBeenCalled();
    });

    it('başlık yoksa çerezden (getServerAccessToken) token alır', async () => {
      mockGetServerAccessToken.mockResolvedValue('cookie-token');
      const request = new Request('https://ugurhoca.com/api/test');

      const token = await getBearerOrCookieAccessToken(request);

      expect(token).toBe('cookie-token');
      expect(mockGetServerAccessToken).toHaveBeenCalledTimes(1);
    });

    it('başlık Bearer ile başlamıyorsa çerez tokenını dener', async () => {
      mockGetServerAccessToken.mockResolvedValue('cookie-fallback');
      const request = new Request('https://ugurhoca.com/api/test', {
        headers: {
          authorization: 'Basic dXNlcjpwYXNz',
        },
      });

      const token = await getBearerOrCookieAccessToken(request);

      expect(token).toBe('cookie-fallback');
    });

    it('hiçbir token yoksa boş string döndürür', async () => {
      mockGetServerAccessToken.mockResolvedValue(null);
      const request = new Request('https://ugurhoca.com/api/test');

      const token = await getBearerOrCookieAccessToken(request);

      expect(token).toBe('');
    });
  });

  describe('requireAdmin', () => {
    it('oturum/token yokken 401 missing_access_token hatası döndürür', async () => {
      mockGetServerAccessToken.mockResolvedValue(null);
      const request = new Request('https://ugurhoca.com/api/admin/action');

      const result = await requireAdmin(request);

      expect('error' in result && result.error).toBeTruthy();
      if ('error' in result && result.error) {
        expect(result.error.status).toBe(401);
        const data = await result.error.json();
        expect(data).toMatchObject({
          error: {
            code: 'missing_access_token',
            message: 'Oturum açmanız gerekiyor.',
          },
        });
      }
    });

    it('token geçersiz veya auth.getUser hata döndüğünde 401 invalid_session döner', async () => {
      mockGetServerAccessToken.mockResolvedValue('expired-token');
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('JWT expired'),
      });
      const request = new Request('https://ugurhoca.com/api/admin/action');

      const result = await requireAdmin(request);

      expect('error' in result && result.error).toBeTruthy();
      if ('error' in result && result.error) {
        expect(result.error.status).toBe(401);
        const data = await result.error.json();
        expect(data).toMatchObject({
          error: {
            code: 'invalid_session',
            message: 'Oturum açmanız gerekiyor.',
          },
        });
      }
    });

    it('kullanıcı admin değilse 403 not_admin döner', async () => {
      const request = new Request('https://ugurhoca.com/api/admin/action', {
        headers: { authorization: 'Bearer student-token' },
      });
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'stu-1',
            email: 'ogrenci@example.com',
          },
        },
        error: null,
      });

      const result = await requireAdmin(request);

      expect('error' in result && result.error).toBeTruthy();
      if ('error' in result && result.error) {
        expect(result.error.status).toBe(403);
        const data = await result.error.json();
        expect(data).toMatchObject({
          error: {
            code: 'not_admin',
            message: 'Bu işlem için yetkiniz yok.',
          },
        });
      }
    });

    it('admin e-postası ile istek yapıldığında yetkiyi onaylar ve serviceRole client döner', async () => {
      const request = new Request('https://ugurhoca.com/api/admin/action', {
        headers: { authorization: 'Bearer admin-token' },
      });
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@ugurhoca.com',
          },
        },
        error: null,
      });

      const result = await requireAdmin(request);

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.user.email).toBe('admin@ugurhoca.com');
        expect(result.serviceRole).toBeDefined();
      }
    });
  });

  describe('cron yetkilendirme (isAuthorizedCronRequest)', () => {
    const originalSecret = process.env.CRON_SECRET;

    beforeEach(() => {
      process.env.CRON_SECRET = 'super-secret-cron-key-123';
    });

    it('CRON_SECRET tanımlı değilse fail-closed davranır (false döner)', () => {
      delete process.env.CRON_SECRET;

      const request = new Request('https://ugurhoca.com/api/cron/dispatch', {
        headers: { authorization: 'Bearer super-secret-cron-key-123' },
      });

      expect(isAuthorizedCronRequest(request)).toBe(false);
      process.env.CRON_SECRET = originalSecret;
    });

    it('yanlış veya eksik Bearer token ile istek reddedilir', () => {
      const requestWithoutAuth = new Request(
        'https://ugurhoca.com/api/cron/dispatch',
      );
      const requestWrongToken = new Request(
        'https://ugurhoca.com/api/cron/dispatch',
        {
          headers: { authorization: 'Bearer wrong-key' },
        },
      );

      expect(isAuthorizedCronRequest(requestWithoutAuth)).toBe(false);
      expect(isAuthorizedCronRequest(requestWrongToken)).toBe(false);
    });

    it('doğru Bearer token ile istek onaylanır', () => {
      const request = new Request('https://ugurhoca.com/api/cron/dispatch', {
        headers: { authorization: 'Bearer super-secret-cron-key-123' },
      });

      expect(isAuthorizedCronRequest(request)).toBe(true);
      process.env.CRON_SECRET = originalSecret;
    });
  });
});
