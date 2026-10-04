import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { LiveLessonInputError } from '@/features/live-lessons/server/liveLessons';
import type { VerifiedServerUser } from '@/lib/auth-verify.server';

const {
  mockRequireLiveLessonUser,
  mockIsLiveLessonAdmin,
  mockUpdateLiveLessonStatus,
  mockDeleteRoom,
  mockLoggerError,
} = vi.hoisted(() => ({
  mockRequireLiveLessonUser: vi.fn(),
  mockIsLiveLessonAdmin: vi.fn(),
  mockUpdateLiveLessonStatus: vi.fn(),
  mockDeleteRoom: vi.fn(),
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
      updateLiveLessonStatus: mockUpdateLiveLessonStatus,
    };
  },
);

vi.mock('livekit-server-sdk', () => ({
  RoomServiceClient: vi.fn().mockImplementation(() => ({
    deleteRoom: mockDeleteRoom,
  })),
}));

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
  params: Promise.resolve({ lessonId: 'lesson-789' }),
};

describe('POST /api/live-lessons/[lessonId]/end', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireLiveLessonUser.mockResolvedValue({ ok: true, user: adminUser });
    mockIsLiveLessonAdmin.mockReturnValue(true);
    mockDeleteRoom.mockResolvedValue({});
  });

  it('LiveLessonInputError fırlatıldığında hata mesajı aynen döner ve loglanmaz', async () => {
    mockUpdateLiveLessonStatus.mockRejectedValue(
      new LiveLessonInputError('İptal edilmiş ders düzenlenemez.'),
    );

    const request = new Request(
      'http://localhost/api/live-lessons/lesson-789/end',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended' }),
      },
    );

    const response = await POST(request, context);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toEqual({ error: 'İptal edilmiş ders düzenlenemez.' });
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it.each([
    new Error('Database connection reset by peer'),
    {
      code: 'XX000',
      message: 'Database connection reset by peer',
      details: 'internal database details',
    },
  ])(
    'beklenmeyen hatada ham mesaj sızmaz ve logger ile loglanır (%j)',
    async (rawError) => {
      mockUpdateLiveLessonStatus.mockRejectedValue(rawError);

      const request = new Request(
        'http://localhost/api/live-lessons/lesson-789/end',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ended' }),
        },
      );

      const response = await POST(request, context);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toEqual({ error: 'Ders güncellenemedi.' });
      expect(body.error).not.toContain('Database connection reset');

      expect(mockLoggerError).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Canlı ders sonlandırma hatası',
        rawError,
      );
    },
  );

  it('başarılı sonlandırmada güncellenen dersi döner', async () => {
    const endedLesson = {
      id: 'lesson-789',
      status: 'ended',
      room_id: 'room-abc',
    };
    mockUpdateLiveLessonStatus.mockResolvedValue(endedLesson);

    const request = new Request(
      'http://localhost/api/live-lessons/lesson-789/end',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended' }),
      },
    );

    const response = await POST(request, context);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ lesson: endedLesson });
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});
