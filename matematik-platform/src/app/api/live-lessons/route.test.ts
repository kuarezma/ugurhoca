import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { LiveLessonInputError } from '@/features/live-lessons/server/liveLessons';
import type { VerifiedServerUser } from '@/lib/auth-verify.server';

const {
  mockRequireLiveLessonUser,
  mockIsLiveLessonAdmin,
  mockCreateLiveLessons,
  mockLoggerError,
} = vi.hoisted(() => ({
  mockRequireLiveLessonUser: vi.fn(),
  mockIsLiveLessonAdmin: vi.fn(),
  mockCreateLiveLessons: vi.fn(),
  mockLoggerError: vi.fn(),
}));

vi.mock(
  '@/features/live-lessons/server/liveLessons',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/features/live-lessons/server/liveLessons')
      >();
    return {
      ...actual,
      requireLiveLessonUser: mockRequireLiveLessonUser,
      isLiveLessonAdmin: mockIsLiveLessonAdmin,
      createLiveLessons: mockCreateLiveLessons,
    };
  },
);

vi.mock('@/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  createLogger: () => ({
    error: mockLoggerError,
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

const adminUser: VerifiedServerUser = {
  accessGrade: null,
  email: 'admin@ugurhoca.com',
  grade: 5,
  id: 'admin-1',
  isAdmin: true,
  name: 'Admin Öğretmen',
};

describe('POST /api/live-lessons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireLiveLessonUser.mockResolvedValue({ ok: true, user: adminUser });
    mockIsLiveLessonAdmin.mockReturnValue(true);
  });

  it('LiveLessonInputError fırlatıldığında doğrulama mesajı aynen döner ve loglanmaz', async () => {
    mockCreateLiveLessons.mockRejectedValue(
      new LiveLessonInputError('Ders başlığı gerekli.'),
    );

    const request = new Request('http://localhost/api/live-lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toEqual({ error: 'Ders başlığı gerekli.' });
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it.each([
    new Error('Supabase database connection timeout on insert'),
    {
      code: 'XX000',
      message: 'Supabase database connection timeout on insert',
      details: 'internal database details',
    },
  ])(
    'beklenmeyen hatada ham mesaj istemciye sızmaz ve logger ile loglanır (%j)',
    async (rawError) => {
      mockCreateLiveLessons.mockRejectedValue(rawError);

      const request = new Request('http://localhost/api/live-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Geometri Soru Çözümü' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toEqual({ error: 'Ders planlanamadı.' });
      expect(body.error).not.toContain('Supabase');
      expect(body.error).not.toContain('connection timeout');

      expect(mockLoggerError).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Canlı ders planlama hatası',
        rawError,
      );
    },
  );

  it('başarılı planlamada ders listesini döner', async () => {
    const mockLesson = { id: 'lesson-123', title: 'Geometri Soru Çözümü' };
    mockCreateLiveLessons.mockResolvedValue([mockLesson]);

    const request = new Request('http://localhost/api/live-lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Geometri Soru Çözümü',
        startsAt: '2026-10-10T10:00:00Z',
        targetGrade: '8',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ lesson: mockLesson, lessons: [mockLesson] });
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});
