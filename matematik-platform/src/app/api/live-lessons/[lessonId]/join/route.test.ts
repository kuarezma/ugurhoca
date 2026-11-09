import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('server-only', () => ({}));

const {
  mockRequireLiveLessonUser,
  mockIsLiveLessonAdmin,
  mockCanUserAccessLiveLesson,
  mockToClientLiveLesson,
  mockEnforceRateLimit,
  mockSupabaseFrom,
} = vi.hoisted(() => ({
  mockRequireLiveLessonUser: vi.fn(),
  mockIsLiveLessonAdmin: vi.fn(),
  mockCanUserAccessLiveLesson: vi.fn(),
  mockToClientLiveLesson: vi.fn((lesson: unknown) => lesson),
  mockEnforceRateLimit: vi.fn(),
  mockSupabaseFrom: vi.fn(),
}));

vi.mock('@/features/live-lessons/server/liveLessons', () => ({
  requireLiveLessonUser: mockRequireLiveLessonUser,
  isLiveLessonAdmin: mockIsLiveLessonAdmin,
  canUserAccessLiveLesson: mockCanUserAccessLiveLesson,
  toClientLiveLesson: mockToClientLiveLesson,
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

describe('POST /api/live-lessons/[lessonId]/join', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(null);
  });

  it('oturum açmamış kullanıcı için 401 döner', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: false,
      response: NextResponse.json(
        { error: 'Oturum açmanız gerekiyor.' },
        { status: 401 },
      ),
    });

    const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/lesson-123/join', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Oturum açmanız gerekiyor.');
  });

  it('rate limit aşıldığında rate limit yanıtını döndürür', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
    });
    mockEnforceRateLimit.mockResolvedValue(
      NextResponse.json({ error: 'Çok fazla istek.' }, { status: 429 }),
    );

    const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/lesson-123/join', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toBe('Çok fazla istek.');
  });

  it('ders kimliği boş veya geçersiz olduğunda 400 döner', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
    });

    const context = { params: Promise.resolve({ lessonId: '   ' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/join', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Geçersiz ders kimliği.');
  });

  it('ders veritabanında bulunamadığında 404 döner', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
    });
    mockIsLiveLessonAdmin.mockReturnValue(false);

    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      }),
    });

    const context = { params: Promise.resolve({ lessonId: 'not-found-id' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/not-found-id/join', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Ders bulunamadı.');
  });

  it('ders iptal edilmiş veya bitmişse 409 döner', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
    });
    mockIsLiveLessonAdmin.mockReturnValue(false);

    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'lesson-123', status: 'cancelled' },
            error: null,
          }),
        }),
      }),
    });

    const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/lesson-123/join', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toBe('Bu ders artık aktif değil.');
  });

  it('öğrenci ders erişim yetkisine sahip değilse 403 döner', async () => {
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
    });
    mockIsLiveLessonAdmin.mockReturnValue(false);
    mockCanUserAccessLiveLesson.mockReturnValue(false);

    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'lesson-123', status: 'active', grade: 8 },
            error: null,
          }),
        }),
      }),
    });

    const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/lesson-123/join', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Bu ders size açık değil.');
  });

  it('öğrenci için başarılı katılımda katılımcı kaydı ekler ve 200 döner', async () => {
    const studentUser = {
      id: 'stu-1',
      name: 'Ahmet',
      email: 'stu@example.com',
    };
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: studentUser,
    });
    mockIsLiveLessonAdmin.mockReturnValue(false);
    mockCanUserAccessLiveLesson.mockReturnValue(true);

    const lessonData = {
      id: 'lesson-123',
      status: 'active',
      title: 'Üslü Sayılar',
    };
    const insertMock = vi.fn().mockResolvedValue({ error: null });

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'live_lessons') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: lessonData, error: null }),
            }),
          }),
        };
      }
      if (table === 'live_lesson_participants') {
        return { insert: insertMock };
      }
      return {};
    });

    const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/lesson-123/join', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.role).toBe('student');
    expect(data.lesson).toEqual(lessonData);
    expect(insertMock).toHaveBeenCalledWith({
      lesson_id: 'lesson-123',
      microphone_allowed: false,
      role: 'student',
      user_id: 'stu-1',
      user_name: 'Ahmet',
    });
  });

  it('öğretmen katıldığında planlanmış dersi aktife çeker ve mikrofon izni verir', async () => {
    const teacherUser = {
      id: 'teacher-1',
      name: 'Uğur Hoca',
      email: 'admin@ugurhoca.com',
    };
    mockRequireLiveLessonUser.mockResolvedValue({
      ok: true,
      user: teacherUser,
    });
    mockIsLiveLessonAdmin.mockReturnValue(true);

    const lessonData = {
      id: 'lesson-456',
      status: 'scheduled',
      title: 'Canlı Soru Çözümü',
    };
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'live_lessons') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: lessonData, error: null }),
            }),
          }),
          update: updateMock,
        };
      }
      if (table === 'live_lesson_participants') {
        return { insert: insertMock };
      }
      return {};
    });

    const context = { params: Promise.resolve({ lessonId: 'lesson-456' }) };
    const response = await POST(
      new Request('https://ugurhoca.com/api/live-lessons/lesson-456/join', {
        method: 'POST',
      }),
      context,
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.role).toBe('teacher');
    expect(insertMock).toHaveBeenCalledWith({
      lesson_id: 'lesson-456',
      microphone_allowed: true,
      role: 'teacher',
      user_id: 'teacher-1',
      user_name: 'Uğur Hoca',
    });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' }),
    );
    expect(updateEqMock).toHaveBeenCalledWith('id', 'lesson-456');
  });
});
