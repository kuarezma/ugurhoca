import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { requireAdmin } from '@/lib/api-auth';
import { apiError } from '@/lib/api-response';

vi.mock('@/lib/api-auth', () => ({ requireAdmin: vi.fn() }));

describe('GET /api/admin/site-statistics', () => {
  const rpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({
      serviceRole: { rpc } as never,
      user: { id: 'admin-id' } as never,
    });
  });

  it('yönetici olmayan isteği reddeder', async () => {
    vi.mocked(requireAdmin).mockResolvedValueOnce({
      error: apiError('Yetkiniz yok.', 403),
    });

    const response = await GET(new Request('http://localhost/api/admin/site-statistics'));

    expect(response.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('tarih aralığını doğrular', async () => {
    const response = await GET(new Request('http://localhost/api/admin/site-statistics?range=year'));

    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('yalnız service role RPC sonucunu döndürür', async () => {
    rpc.mockResolvedValueOnce({ data: { totalUsers: 1200 }, error: null });

    const response = await GET(new Request('http://localhost/api/admin/site-statistics?range=all'));

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(rpc).toHaveBeenCalledWith('admin_site_statistics', {
      p_since: null,
      p_admin_emails: ['admin@ugurhoca.com'],
    });
    await expect(response.json()).resolves.toEqual({ data: { totalUsers: 1200 } });
  });
});
