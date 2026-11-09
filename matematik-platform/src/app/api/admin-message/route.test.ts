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

describe('POST /api/admin-message', () => {
  const mockAdminUser = { id: 'admin-1', email: 'admin@ugurhoca.com' };
  const mockSingle = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockFrom = vi.fn();
  const mockChannelSend = vi.fn();
  const mockChannel = vi.fn();

  const mockAdminClient = {
    from: mockFrom,
    channel: mockChannel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimit).mockResolvedValue(null);
    vi.mocked(requireAdmin).mockResolvedValue({
      user: mockAdminUser,
      serviceRole: mockAdminClient,
    } as unknown as Awaited<ReturnType<typeof requireAdmin>>);

    mockFrom.mockReturnValue({ insert: mockInsert });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockChannel.mockReturnValue({ send: mockChannelSend });
    mockChannelSend.mockResolvedValue('ok');
    mockSingle.mockResolvedValue({
      data: { id: 'notif-1', user_id: 'stu-1' },
      error: null,
    });
  });

  it('admin yetkisi yoksa auth.error yanıtı döndürür', async () => {
    vi.mocked(requireAdmin).mockResolvedValueOnce({
      error: NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 }),
    } as unknown as Awaited<ReturnType<typeof requireAdmin>>);

    const req = new Request('https://ugurhoca.com/api/admin-message', {
      method: 'POST',
      body: JSON.stringify({
        student_id: 'stu-1',
        student_name: 'Ahmet Yılmaz',
        message: 'Tebrikler!',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(401);
  });

  it('rate limit aşıldığında 429 döndürür', async () => {
    vi.mocked(enforceRateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 }),
    );

    const req = new Request('https://ugurhoca.com/api/admin-message', {
      method: 'POST',
      body: JSON.stringify({
        student_id: 'stu-1',
        student_name: 'Ahmet Yılmaz',
        message: 'Tebrikler!',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(429);
  });

  it('eksik alanlar gönderildiğinde 400 döner', async () => {
    const req = new Request('https://ugurhoca.com/api/admin-message', {
      method: 'POST',
      body: JSON.stringify({
        student_id: '',
        message: '',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  it('bildirim veritabanına eklenirken hata oluşursa 500 döner', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Insert constraint error' },
    });

    const req = new Request('https://ugurhoca.com/api/admin-message', {
      method: 'POST',
      body: JSON.stringify({
        student_id: 'stu-1',
        student_name: 'Ahmet Yılmaz',
        title: 'Özel Mesaj',
        message: 'Deneme sınavındaki başarın harika!',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Mesaj gönderilemedi.');
  });

  it('başarılı gönderimde bildirimi kaydeder, realtime kanala iletir ve 200 döner', async () => {
    const req = new Request('https://ugurhoca.com/api/admin-message', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.1',
        'user-agent': 'AdminBrowser/1.0',
      },
      body: JSON.stringify({
        student_id: 'stu-1',
        student_name: 'Ahmet Yılmaz',
        title: 'Özel Mesaj',
        message: 'Deneme sınavındaki başarın harika!',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean };
    expect(body.success).toBe(true);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'stu-1',
        type: 'admin-message',
        message: 'Deneme sınavındaki başarın harika!',
        metadata: expect.objectContaining({
          student_name: 'Ahmet Yılmaz',
          ip: '198.51.100.1',
          user_agent: 'AdminBrowser/1.0',
        }),
      }),
    );
    expect(mockChannelSend).toHaveBeenCalledTimes(1);
  });

  it('realtime broadcast hata verse bile bildirim kaydedilmişse 200 döner (graceful degradation)', async () => {
    mockChannelSend.mockRejectedValueOnce(
      new Error('WebSocket broadcast failed'),
    );

    const req = new Request('https://ugurhoca.com/api/admin-message', {
      method: 'POST',
      body: JSON.stringify({
        student_id: 'stu-1',
        student_name: 'Ahmet Yılmaz',
        message: 'Harika gidiyorsun!',
      }),
    });

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean };
    expect(body.success).toBe(true);
  });
});
