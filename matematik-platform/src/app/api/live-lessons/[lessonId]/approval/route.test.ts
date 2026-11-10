import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('server-only', () => ({}));

const {
  mockRequireLiveLessonUser,
  mockIsLiveLessonAdmin,
  mockEnforceRateLimit,
  mockSupabaseFrom,
  mockUpdateParticipant,
} = vi.hoisted(() => {
  const updateParticipantFn = vi.fn();
  return {
    mockRequireLiveLessonUser: vi.fn(),
    mockIsLiveLessonAdmin: vi.fn(),
    mockEnforceRateLimit: vi.fn(),
    mockSupabaseFrom: vi.fn(),
    mockUpdateParticipant: updateParticipantFn,
  };
});

vi.mock('livekit-server-sdk', () => ({
  RoomServiceClient: class {
    updateParticipant = mockUpdateParticipant;
  },
}));

vi.mock('@/features/live-lessons/server/liveLessons', () => ({
  requireLiveLessonUser: mockRequireLiveLessonUser,
  isLiveLessonAdmin: mockIsLiveLessonAdmin,
}));

vi.mock('@/features/live-lessons/lib/lesson-auth', () => ({
  getLiveKitServiceHost: vi.fn(() => 'https://livekit.example.com'),
}));

vi.mock('@/features/live-lessons/lib/lesson-identity', () => ({
  deriveLiveKitIdentity: vi.fn((role: string, id: string) => `${role}_${id}`),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: mockEnforceRateLimit,
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

import { GET, POST } from './route';

describe('/api/live-lessons/[lessonId]/approval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(null);
  });

  describe('GET', () => {
    it('oturum açmamış kullanıcı için 401 döner', async () => {
      mockRequireLiveLessonUser.mockResolvedValue({
        ok: false,
        response: NextResponse.json(
          { error: 'Oturum açmanız gerekiyor.' },
          { status: 401 },
        ),
      });

      const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
      const response = await GET(
        new Request(
          'https://ugurhoca.com/api/live-lessons/lesson-123/approval',
        ),
        context,
      );

      expect(response.status).toBe(401);
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
      const response = await GET(
        new Request(
          'https://ugurhoca.com/api/live-lessons/lesson-123/approval',
        ),
        context,
      );

      expect(response.status).toBe(429);
    });

    it('öğretmen sorguladığında doğrudan approved: true döner', async () => {
      mockRequireLiveLessonUser.mockResolvedValue({
        ok: true,
        user: {
          id: 'teacher-1',
          name: 'Uğur Hoca',
          email: 'admin@ugurhoca.com',
        },
      });
      mockIsLiveLessonAdmin.mockReturnValue(true);

      const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
      const response = await GET(
        new Request(
          'https://ugurhoca.com/api/live-lessons/lesson-123/approval',
        ),
        context,
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ approved: true });
    });

    it('öğrenci henüz onaylanmamışsa approved: false döner', async () => {
      mockRequireLiveLessonUser.mockResolvedValue({
        ok: true,
        user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
      });
      mockIsLiveLessonAdmin.mockReturnValue(false);

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
      const response = await GET(
        new Request(
          'https://ugurhoca.com/api/live-lessons/lesson-123/approval',
        ),
        context,
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ approved: false });
    });

    it('öğrenci onay olayı mevcutsa approved: true döner', async () => {
      mockRequireLiveLessonUser.mockResolvedValue({
        ok: true,
        user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
      });
      mockIsLiveLessonAdmin.mockReturnValue(false);

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [{ payload: { target_identity: 'student_stu-1' } }],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
      const response = await GET(
        new Request(
          'https://ugurhoca.com/api/live-lessons/lesson-123/approval',
        ),
        context,
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ approved: true });
    });
  });

  describe('POST', () => {
    it('öğrenci erişmeye çalıştığında 403 hatası döner', async () => {
      mockRequireLiveLessonUser.mockResolvedValue({
        ok: true,
        user: { id: 'stu-1', name: 'Ahmet', email: 'stu@example.com' },
      });
      mockIsLiveLessonAdmin.mockReturnValue(false);

      const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
      const req = new Request(
        'https://ugurhoca.com/api/live-lessons/lesson-123/approval',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetIdentity: 'student_123' }),
        },
      );

      const response = await POST(req, context);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Bu işlem için admin yetkisi gerekir.');
    });

    it('geçersiz veya student_ ile başlamayan hedef kimlik gönderilirse 400 döner', async () => {
      mockRequireLiveLessonUser.mockResolvedValue({
        ok: true,
        user: {
          id: 'teacher-1',
          name: 'Uğur Hoca',
          email: 'admin@ugurhoca.com',
        },
      });
      mockIsLiveLessonAdmin.mockReturnValue(true);

      const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
      const req = new Request(
        'https://ugurhoca.com/api/live-lessons/lesson-123/approval',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetIdentity: 'invalid_identity' }),
        },
      );

      const response = await POST(req, context);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Öğrenci kimliği geçersiz.');
    });

    it('veritabanı olay kaydı hata verirse 400 döner', async () => {
      mockRequireLiveLessonUser.mockResolvedValue({
        ok: true,
        user: {
          id: 'teacher-1',
          name: 'Uğur Hoca',
          email: 'admin@ugurhoca.com',
        },
      });
      mockIsLiveLessonAdmin.mockReturnValue(true);

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'live_lessons') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { room_id: 'room-123' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'live_lesson_events') {
          return {
            insert: vi
              .fn()
              .mockResolvedValue({ error: new Error('DB insert failed') }),
          };
        }
        return {};
      });

      const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
      const req = new Request(
        'https://ugurhoca.com/api/live-lessons/lesson-123/approval',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetIdentity: 'student_stu-99' }),
        },
      );

      const response = await POST(req, context);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Öğrenci onayı kaydedilemedi.');
    });

    it('öğretmen geçerli öğrenciyi onayladığında olayı kaydeder, LiveKit izinlerini yükseltir ve 200 döner', async () => {
      process.env.LIVEKIT_API_KEY = 'test-key';
      process.env.LIVEKIT_API_SECRET = 'test-secret';

      mockRequireLiveLessonUser.mockResolvedValue({
        ok: true,
        user: {
          id: 'teacher-1',
          name: 'Uğur Hoca',
          email: 'admin@ugurhoca.com',
        },
      });
      mockIsLiveLessonAdmin.mockReturnValue(true);

      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'live_lessons') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { room_id: 'room-123' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'live_lesson_events') {
          return {
            insert: insertMock,
          };
        }
        return {};
      });

      const context = { params: Promise.resolve({ lessonId: 'lesson-123' }) };
      const req = new Request(
        'https://ugurhoca.com/api/live-lessons/lesson-123/approval',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetIdentity: 'student_stu-99' }),
        },
      );

      const response = await POST(req, context);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ approved: true });

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'join_approved',
          lesson_id: 'lesson-123',
          payload: expect.objectContaining({
            target_identity: 'student_stu-99',
          }),
        }),
      );
      expect(mockUpdateParticipant).toHaveBeenCalledWith(
        'room-123',
        'student_stu-99',
        undefined,
        expect.objectContaining({
          canPublish: true,
          canPublishData: true,
          canSubscribe: true,
        }),
      );
    });
  });
});
