// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/api-auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

import { requireAdmin } from '@/lib/api-auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { POST } from './route';

describe('POST /api/admin-broadcast', () => {
  const mockAdminUser = { id: 'admin-uuid-1', email: 'admin@ugurhoca.com' };
  const mockInsert = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockFrom = vi.fn();

  const mockServiceRole = {
    from: mockFrom,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimit).mockResolvedValue(null);
    vi.mocked(requireAdmin).mockResolvedValue({
      user: mockAdminUser,
      serviceRole: mockServiceRole,
    } as unknown as Awaited<ReturnType<typeof requireAdmin>>);

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq,
            then: (resolve: (arg: unknown) => void) =>
              resolve({ data: [{ id: 'stu-1', grade: '5' }], error: null }),
          }),
        };
      }
      if (table === 'notifications') {
        return {
          insert: mockInsert.mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
  });

  it('admin yetkisi yoksa auth.error yanıtını döndürür', async () => {
    vi.mocked(requireAdmin).mockResolvedValueOnce({
      error: NextResponse.json({ error: 'Yetkisiz' }, { status: 401 }),
    } as unknown as Awaited<ReturnType<typeof requireAdmin>>);

    const req = new Request('https://ugurhoca.com/api/admin-broadcast', {
      method: 'POST',
      body: JSON.stringify({
        target_grade: '5',
        title: 'Ödev Hatırlatması',
        message: 'Lütfen ödevlerinizi tamamlayınız.',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(401);
  });

  it('rate limit aşıldığında 429 yanıtı döndürür', async () => {
    vi.mocked(enforceRateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 }),
    );

    const req = new Request('https://ugurhoca.com/api/admin-broadcast', {
      method: 'POST',
      body: JSON.stringify({
        target_grade: '5',
        title: 'Ödev Hatırlatması',
        message: 'Lütfen ödevlerinizi tamamlayınız.',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(429);
  });

  it('eksik veya geçersiz alanlar için 400 invalid_admin_broadcast döner', async () => {
    const req = new Request('https://ugurhoca.com/api/admin-broadcast', {
      method: 'POST',
      body: JSON.stringify({
        target_grade: '',
        title: '',
        message: '',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('invalid_admin_broadcast');
  });

  it('öğrenci sorgusu hata verirse 500 students_query_failed döner', async () => {
    mockSelect.mockReturnValueOnce({
      eq: vi.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'DB connection error' },
      }),
    });

    const req = new Request('https://ugurhoca.com/api/admin-broadcast', {
      method: 'POST',
      body: JSON.stringify({
        target_grade: '8',
        title: 'LGS Denemesi',
        message: 'Yarın deneme sınavı var.',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('students_query_failed');
  });

  it('hedef sınıfta hiç öğrenci yoksa recipient_count: 0 ile 200 döner', async () => {
    mockSelect.mockReturnValueOnce({
      eq: vi.fn().mockResolvedValueOnce({
        data: [],
        error: null,
      }),
    });

    const req = new Request('https://ugurhoca.com/api/admin-broadcast', {
      method: 'POST',
      body: JSON.stringify({
        target_grade: '7',
        title: 'Duyuru',
        message: 'Yeni test eklendi.',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: { recipient_count: number; message: string };
    };
    expect(body.data.recipient_count).toBe(0);
    expect(body.data.message).toBe('Seçilen sınıfta öğrenci bulunamadı.');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('öğrencilere başarıyla bildirim gönderildiğinde 200 döner', async () => {
    mockSelect.mockReturnValueOnce({
      eq: vi.fn().mockResolvedValueOnce({
        data: [{ id: 'stu-1' }, { id: 'stu-2' }],
        error: null,
      }),
    });

    const req = new Request('https://ugurhoca.com/api/admin-broadcast', {
      method: 'POST',
      body: JSON.stringify({
        target_grade: '6',
        title: 'Ödev Duyurusu',
        message: 'Kesirler konusu tamamlandı.',
        image_url: 'https://example.com/banner.png',
        link_url: 'https://ugurhoca.com/odevler',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: { recipient_count: number; target_grade: string };
    };
    expect(body.data.recipient_count).toBe(2);
    expect(body.data.target_grade).toBe('6');
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('tüm sınıflar seçildiğinde (all) grade filtresi uygulamadan bildirimleri gönderir', async () => {
    const mockStudents = Array.from({ length: 300 }, (_, i) => ({
      id: `stu-${i + 1}`,
      grade: '5',
    }));

    mockSelect.mockReturnValueOnce(
      Promise.resolve({
        data: mockStudents,
        error: null,
      }),
    );

    const req = new Request('https://ugurhoca.com/api/admin-broadcast', {
      method: 'POST',
      body: JSON.stringify({
        target_grade: 'all',
        title: 'Genel Tatil Duyurusu',
        message: 'Yarın ders yapılmayacaktır.',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: { recipient_count: number };
    };
    expect(body.data.recipient_count).toBe(300);
    // 300 kayıt 250'şerli batch ile 2 kez insert edilmeli
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it('bildirim kaydı sırasında DB hatası olursa 500 notification_insert_failed döner', async () => {
    mockSelect.mockReturnValueOnce({
      eq: vi.fn().mockResolvedValueOnce({
        data: [{ id: 'stu-1' }],
        error: null,
      }),
    });

    mockInsert.mockResolvedValueOnce({
      error: { message: 'Insert failed' },
    });

    const req = new Request('https://ugurhoca.com/api/admin-broadcast', {
      method: 'POST',
      body: JSON.stringify({
        target_grade: '5',
        title: 'Duyuru',
        message: 'Örnek mesaj',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('notification_insert_failed');
  });
});
