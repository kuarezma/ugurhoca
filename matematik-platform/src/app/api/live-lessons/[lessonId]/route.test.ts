import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from './route';
import { LiveLessonInputError } from '@/features/live-lessons/server/liveLessons';
import type { VerifiedServerUser } from '@/lib/auth-verify.server';

const {
  mockRequireLiveLessonUser,
  mockIsLiveLessonAdmin,
  mockUpdateLiveLesson,
  mockLoggerError,
} = vi.hoisted(() => ({
  mockRequireLiveLessonUser: vi.fn(),
  mockIsLiveLessonAdmin: vi.fn(),
  mockUpdateLiveLesson: vi.fn(),
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
      updateLiveLesson: mockUpdateLiveLesson,
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

const context = {
  params: Promise.resolve({ lessonId: 'lesson-456' }),
};

describe('PATCH /api/live-lessons/[lessonId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireLiveLessonUser.mockResolvedValue({ ok: true, user: adminUser });
    mockIsLiveLessonAdmin.mockReturnValue(true);
  });

  it('LiveLessonInputError fırlatıldığında doğrulama mesajı aynen döner ve loglanmaz', async () => {
    mockUpdateLiveLesson.mockRejectedValue(
      new LiveLessonInputError('Geçerli bir ders hedefi seçin.'),
    );

    const request = new Request(
      'http://localhost/api/live-lessons/lesson-456',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetGrade: 'invalid-grade' }),
      },
    );

    const response = await PATCH(request, context);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toEqual({ error: 'Geçerli bir ders hedefi seçin.' });
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it.each([
    new Error('PGRST116 row not found or database lock timeout'),
    {
      code: 'XX000',
      message: 'PGRST116 row not found or database lock timeout',
      details: 'internal database details',
    },
  ])(
    'beklenmeyen hatada ham mesaj sızmaz ve logger ile loglanır (%j)',
    async (rawError) => {
      mockUpdateLiveLesson.mockRejectedValue(rawError);

      const request = new Request(
        'http://localhost/api/live-lessons/lesson-456',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Yeni Başlık' }),
        },
      );

      const response = await PATCH(request, context);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toEqual({ error: 'Ders güncellenemedi.' });
      expect(body.error).not.toContain('PGRST116');
      expect(body.error).not.toContain('database lock timeout');

      expect(mockLoggerError).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Canlı ders güncelleme hatası',
        rawError,
      );
    },
  );

  it('başarılı güncellemede güncellenen dersi döner', async () => {
    const updatedLesson = { id: 'lesson-456', title: 'Güncel Başlık' };
    mockUpdateLiveLesson.mockResolvedValue(updatedLesson);

    const request = new Request(
      'http://localhost/api/live-lessons/lesson-456',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Güncel Başlık' }),
      },
    );

    const response = await PATCH(request, context);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ lesson: updatedLesson });
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});
