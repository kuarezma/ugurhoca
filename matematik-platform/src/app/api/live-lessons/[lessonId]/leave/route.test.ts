import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('server-only', () => ({}));

const { mockRequireLiveLessonUser, mockEnforceRateLimit, mockSupabaseFrom } =
  vi.hoisted(() => ({
    mockRequireLiveLessonUser: vi.fn(),
    mockEnforceRateLimit: vi.fn(),
    mockSupabaseFrom: vi.fn(),
  }));

vi.mock('@/features/live-lessons/server/liveLessons', () => ({
  requireLiveLessonUser: mockRequireLiveLessonUser,
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: mockEnforceRateLimit,
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}));

import { POST } from './route';

describe('POST /api/live-lessons/[lessonId]/leave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(null);
  });

  it('oturumsuz istekte 401 döner', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: false,
      response: NextResponse.json(
        { error: 'Oturum açmanız gerekiyor.' },
        { status: 401 },
      ),
    });

    const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/lesson-123/leave', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Oturum açmanız gerekiyor.');
  });

  it('rate limit aşıldığında 429 döner', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
    });
    mockEnforceRateLimit.mockResolvedValue(
      NextResponse.json({ error: 'Çok fazla istek.' }, { status: 429 }),
    );

    const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/lesson-123/leave', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(429);
  });

  it('ders kimliği geçersiz veya boşsa 400 döner', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
    });

    const context = { params: Promise.resolve({ lessonId: '' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/leave', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Geçersiz ders kimliği.');
  });

  it('aktif katılım kaydı bulunamadığında veritabanı güncellemesi yapmadan 200 döner', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
    });

    const updateMock = vi.fn();
    const insertMock = vi.fn();

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'live_lesson_participants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      maybeSingle: vi
                        .fn()
                        .mockResolvedValue({ data: null, error: null }),
                    }),
                  }),
                }),
              }),
            }),
          }),
          update: updateMock,
        };
      }
      if (table === 'live_lesson_events') {
        return { insert: insertMock };
      }
      return {};
    });

    const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/lesson-123/leave', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(updateMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('aktif katılım kaydı varsa ayrılma saatini günceller, olayı kaydeder ve 200 döner', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
    });

    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });
    const insertMock = vi.fn().mockResolvedValue({ error: null });

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'live_lesson_participants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      maybeSingle: vi.fn().mockResolvedValue({
                        data: { id: 'participant-row-99' },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
          update: updateMock,
        };
      }
      if (table === 'live_lesson_events') {
        return { insert: insertMock };
      }
      return {};
    });

    const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/lesson-123/leave', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ left_at: expect.any(String) }),
    );
    expect(updateEqMock).toHaveBeenCalledWith('id', 'participant-row-99');

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'leave',
        lesson_id: 'lesson-123',
        user_id: 'stu-1',
        user_name: 'Ahmet',
        payload: expect.objectContaining({ left_at: expect.any(String) }),
      }),
    );
  });
});
