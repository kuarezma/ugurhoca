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

vi.mock('@/features/messages/supportChatUtils', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@/features/messages/supportChatUtils')
    >();
  return {
    ...actual,
    parseSupportPayload: vi.fn((message: string) => {
      try {
        return JSON.parse(message);
      } catch {
        return null;
      }
    }),
  };
});

import { requireAdmin } from '@/lib/api-auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { GET } from './route';

describe('GET /api/admin-conversation-thread', () => {
  const mockAdminUser = { id: 'admin-uuid-1', email: 'admin@ugurhoca.com' };
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
  });

  it('admin yetkisi yoksa auth.error döner', async () => {
    vi.mocked(requireAdmin).mockResolvedValueOnce({
      error: NextResponse.json({ error: 'Yetkisiz' }, { status: 401 }),
    } as unknown as Awaited<ReturnType<typeof requireAdmin>>);

    const req = new Request(
      'https://ugurhoca.com/api/admin-conversation-thread?student_id=stu-1',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(401);
  });

  it('requireAdmin hata fırlatırsa 500 service_unavailable döner', async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(
      new Error('Supabase client error'),
    );

    const req = new Request(
      'https://ugurhoca.com/api/admin-conversation-thread?student_id=stu-1',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('service_unavailable');
  });

  it('rate limit aşıldığında 429 yanıtı döndürür', async () => {
    vi.mocked(enforceRateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 }),
    );

    const req = new Request(
      'https://ugurhoca.com/api/admin-conversation-thread?student_id=stu-1',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(429);
  });

  it('student_id parametresi verilmediğinde 400 missing_student_id döner', async () => {
    const req = new Request(
      'https://ugurhoca.com/api/admin-conversation-thread',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('missing_student_id');
  });

  it('admin gelen kutusu sorgusu hata verirse 500 inbox_fetch_failed döner', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValueOnce({
                data: null,
                error: { message: 'Inbox query failed' },
              }),
            }),
          }),
        }),
      }),
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-conversation-thread?student_id=stu-1',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('inbox_fetch_failed');
  });

  it('yanıtlar sorgusu hata verirse 500 replies_fetch_failed döner', async () => {
    let callCount = 0;
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                  return Promise.resolve({ data: [], error: null });
                }
                return Promise.resolve({
                  data: null,
                  error: { message: 'Replies query failed' },
                });
              }),
            }),
          }),
        }),
      }),
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-conversation-thread?student_id=stu-1',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('replies_fetch_failed');
  });

  it('başarılı konuşma geçmişi sorgulandığında 200 döner ve birleştirilmiş mesajları iletir', async () => {
    let callCount = 0;
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                  // Admin inbox
                  return Promise.resolve({
                    data: [
                      {
                        id: 'msg-1',
                        created_at: '2026-11-10T10:00:00Z',
                        message: JSON.stringify({
                          sender_id: 'stu-1',
                          content: 'Hocam soruya bakabilir misiniz?',
                        }),
                        is_read: true,
                      },
                    ],
                    error: null,
                  });
                }
                // Admin replies
                return Promise.resolve({
                  data: [
                    {
                      id: 'reply-1',
                      created_at: '2026-11-10T10:05:00Z',
                      message: 'Tabii, çözümü gönderiyorum.',
                      metadata: null,
                      is_read: false,
                    },
                  ],
                  error: null,
                });
              }),
            }),
          }),
        }),
      }),
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-conversation-thread?student_id=stu-1',
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { messages: unknown[] } };
    expect(Array.isArray(body.data.messages)).toBe(true);
    expect(body.data.messages.length).toBe(2);
  });
});
