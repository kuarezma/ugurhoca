import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { requireAdmin } from '@/lib/api-auth';
import { apiError } from '@/lib/api-response';
import { enforceRateLimit } from '@/lib/rate-limit';

vi.mock('@/lib/api-auth', () => ({ requireAdmin: vi.fn() }));
vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

describe('GET /api/admin/students', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn(),
  };
  const from = vi.fn().mockReturnValue(query);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({
      serviceRole: { from } as never,
      user: { id: 'admin-id' } as never,
    });
  });

  it('yetkisiz istekte veritabanını sorgulamaz', async () => {
    vi.mocked(requireAdmin).mockResolvedValueOnce({ error: apiError('Yetkiniz yok.', 403) });
    const response = await GET(new Request('http://localhost/api/admin/students'));
    expect(response.status).toBe(403);
    expect(from).not.toHaveBeenCalled();
  });

  it('rate limit aşıldığında 429 döner ve veritabanını sorgulamaz', async () => {
    const rateLimitResponse = new Response(
      JSON.stringify({ error: 'Çok fazla istek.' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    );
    vi.mocked(enforceRateLimit).mockResolvedValueOnce(rateLimitResponse as never);

    const response = await GET(new Request('http://localhost/api/admin/students'));
    expect(response.status).toBe(429);
    expect(from).not.toHaveBeenCalled();
    expect(enforceRateLimit).toHaveBeenCalledWith(
      'admin-students',
      '127.0.0.1',
      { limit: 60, windowSeconds: 60 },
    );
  });

  it('geçersiz sayfayı reddeder', async () => {
    const response = await GET(new Request('http://localhost/api/admin/students?page=-1'));
    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it('arama ve filtreyi sorguda uygular, 40 satırlık sayfa ve gerçek toplamı döndürür', async () => {
    query.range.mockResolvedValueOnce({
      data: [{ id: 'student-41', name: 'Ayşe', grade: 0 }],
      count: 1201,
      error: null,
    });
    const response = await GET(new Request(
      'http://localhost/api/admin/students?page=1&search=Ay%C5%9Fe&favorite=1&grade=Mezun&sort=created_at',
    ));

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(from).toHaveBeenCalledWith('profiles');
    expect(query.neq).toHaveBeenCalledWith('email', 'admin@ugurhoca.com');
    expect(query.eq).toHaveBeenCalledWith('grade', 0);
    expect(query.eq).toHaveBeenCalledWith('is_favorite', true);
    expect(query.ilike).toHaveBeenCalledWith('name', '%Ayşe%');
    expect(query.range).toHaveBeenCalledWith(40, 79);
    await expect(response.json()).resolves.toEqual({
      data: {
        items: [{ id: 'student-41', name: 'Ayşe', grade: 'Mezun' }],
        page: 1,
        pageSize: 40,
        total: 1201,
      },
    });
  });
});
