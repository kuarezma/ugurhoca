const liveKitSdkMock = vi.hoisted(() => {
  const addGrant = vi.fn();
  const toJwt = vi.fn().mockResolvedValue('mock-livekit-jwt');
  return {
    AccessToken: vi.fn().mockImplementation(function MockAccessToken() {
      return { addGrant, toJwt };
    }),
    addGrant,
    toJwt,
  };
});

vi.mock('livekit-server-sdk', async () => {
  const actual = await vi.importActual<typeof import('livekit-server-sdk')>('livekit-server-sdk');
  return {
    ...actual,
    AccessToken: liveKitSdkMock.AccessToken,
  };
});

import { POST } from '@/app/api/livekit/token/route';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  requireLiveLessonUser,
} from '@/features/live-lessons/server/liveLessons';
import { buildLiveLessonIdentity } from '@/features/live-lessons/lib/participant-identity';

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock('@/features/live-lessons/server/liveLessons', () => ({
  canUserAccessLiveLesson: vi.fn(),
  isLiveLessonAdmin: vi.fn(),
  requireLiveLessonUser: vi.fn(),
}));

const studentUser = {
  email: 'ogrenci@example.com',
  grade: 7,
  id: 'a9862dcf-93c8-4927-8e0a-9c48c7dc3d49',
  isAdmin: false,
  name: 'Öğrenci',
};

function mockLessonQuery() {
  vi.mocked(createServiceRoleClient).mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'lesson-1',
                room_id: 'room1234',
                status: 'active',
                target_grade: '7',
              },
            }),
          }),
        }),
      }),
    }),
  } as never);
}

describe('POST /api/livekit/token', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LIVEKIT_API_KEY = 'devkey';
    process.env.LIVEKIT_API_SECRET = 'devsecretdevsecretdevsecret';
    process.env.LESSON_TEACHER_SECRET = 'teacher-secret-teacher-secret';
  });

  it('rejects a student trying to request a teacher token', async () => {
    mockLessonQuery();
    vi.mocked(requireLiveLessonUser).mockResolvedValue({
      accessToken: 'token',
      ok: true,
      user: studentUser,
    });
    vi.mocked(isLiveLessonAdmin).mockReturnValue(false);
    vi.mocked(canUserAccessLiveLesson).mockReturnValue(true);

    const response = await POST(
      new Request('http://localhost/api/livekit/token', {
        body: JSON.stringify({
          identity: buildLiveLessonIdentity(studentUser.id, 'teacher'),
          lessonId: 'lesson-1',
          role: 'teacher',
          roomName: 'room1234',
          teacherProof: 'fake',
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Ders rolü doğrulanamadı.',
    });
  });

  it('issues a data-only student token for the expected identity', async () => {
    mockLessonQuery();
    vi.mocked(requireLiveLessonUser).mockResolvedValue({
      accessToken: 'token',
      ok: true,
      user: studentUser,
    });
    vi.mocked(isLiveLessonAdmin).mockReturnValue(false);
    vi.mocked(canUserAccessLiveLesson).mockReturnValue(true);

    const response = await POST(
      new Request('http://localhost/api/livekit/token', {
        body: JSON.stringify({
          identity: buildLiveLessonIdentity(studentUser.id, 'student'),
          lessonId: 'lesson-1',
          role: 'student',
          roomName: 'room1234',
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    );
    const payload = (await response.json()) as { token?: string };

    expect(response.status).toBe(200);
    expect(payload.token).toBe('mock-livekit-jwt');
    expect(liveKitSdkMock.addGrant).toHaveBeenCalledWith(
      expect.objectContaining({
        canPublish: false,
        canPublishData: true,
        canSubscribe: true,
        room: 'room1234',
      }),
    );
  });
});
