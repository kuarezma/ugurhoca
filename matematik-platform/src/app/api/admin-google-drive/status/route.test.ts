import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, DELETE } from './route';
import { requireGoogleDriveAdmin } from '@/app/api/admin-google-drive/_shared';
import { apiError } from '@/lib/api-response';
import { enforceRateLimit } from '@/lib/rate-limit';

vi.mock('@/app/api/admin-google-drive/_shared', () => ({
  requireGoogleDriveAdmin: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('@/lib/google-drive-oauth', () => ({
  getGoogleDriveOAuthConfigStatus: vi.fn().mockReturnValue({ configured: true }),
}));

describe('admin-google-drive/status route', () => {
  const maybeSingle = vi.fn();
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const deleteEq = vi.fn().mockResolvedValue({ error: null });
  const deleteMock = vi.fn().mockReturnValue({ eq: deleteEq });
  const from = vi.fn().mockImplementation((table: string) => {
    if (table === 'google_drive_connections') {
      return {
        select,
        delete: deleteMock,
      };
    }
    return {};
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireGoogleDriveAdmin).mockResolvedValue({
      serviceRole: { from } as never,
      user: { id: 'admin-id' } as never,
    });
  });

  describe('GET', () => {
    it('yetkisiz istekte veritabanını sorgulamaz', async () => {
      vi.mocked(requireGoogleDriveAdmin).mockResolvedValueOnce({
        error: apiError('Yetkiniz yok.', 403) as never,
      });

      const response = await GET(new Request('http://localhost/api/admin-google-drive/status'));
      expect(response!.status).toBe(403);
      expect(from).not.toHaveBeenCalled();
    });

    it('rate limit aşıldığında 429 döner ve sorgu yapmaz', async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({ error: 'Çok fazla istek.' }),
        { status: 429, headers: { 'content-type': 'application/json' } },
      );
      vi.mocked(enforceRateLimit).mockResolvedValueOnce(rateLimitResponse as never);

      const response = await GET(new Request('http://localhost/api/admin-google-drive/status'));
      expect(response!.status).toBe(429);
      expect(from).not.toHaveBeenCalled();
      expect(enforceRateLimit).toHaveBeenCalledWith(
        'admin-google-drive-status',
        '127.0.0.1',
        { limit: 60, windowSeconds: 60 },
      );
    });

    it('başarılı istekte bağlantı durumunu döner', async () => {
      maybeSingle.mockResolvedValueOnce({
        data: {
          admin_user_id: 'admin-id',
          google_email: 'admin@gmail.com',
          connected_at: '2026-10-01T00:00:00Z',
          updated_at: '2026-10-01T00:00:00Z',
        },
      });

      const response = await GET(new Request('http://localhost/api/admin-google-drive/status'));
      expect(response!.status).toBe(200);
      const data = await response!.json();
      expect(data).toEqual({
        data: {
          configured: true,
          connected: true,
          connected_at: '2026-10-01T00:00:00Z',
          google_email: 'admin@gmail.com',
          updated_at: '2026-10-01T00:00:00Z',
        },
      });
    });
  });

  describe('DELETE', () => {
    it('yetkisiz istekte silme yapmaz', async () => {
      vi.mocked(requireGoogleDriveAdmin).mockResolvedValueOnce({
        error: apiError('Yetkiniz yok.', 403) as never,
      });

      const response = await DELETE(new Request('http://localhost/api/admin-google-drive/status', { method: 'DELETE' }));
      expect(response!.status).toBe(403);
      expect(from).not.toHaveBeenCalled();
    });

    it('rate limit aşıldığında 429 döner ve silme yapmaz', async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({ error: 'Çok fazla istek.' }),
        { status: 429, headers: { 'content-type': 'application/json' } },
      );
      vi.mocked(enforceRateLimit).mockResolvedValueOnce(rateLimitResponse as never);

      const response = await DELETE(new Request('http://localhost/api/admin-google-drive/status', { method: 'DELETE' }));
      expect(response!.status).toBe(429);
      expect(from).not.toHaveBeenCalled();
      expect(enforceRateLimit).toHaveBeenCalledWith(
        'admin-google-drive-status',
        '127.0.0.1',
        { limit: 60, windowSeconds: 60 },
      );
    });

    it('başarılı istekte bağlantıyı siler', async () => {
      const response = await DELETE(new Request('http://localhost/api/admin-google-drive/status', { method: 'DELETE' }));
      expect(response!.status).toBe(200);
      expect(deleteMock).toHaveBeenCalled();
      expect(deleteEq).toHaveBeenCalledWith('admin_user_id', 'admin-id');
      const data = await response!.json();
      expect(data).toEqual({ data: { connected: false } });
    });
  });
});
