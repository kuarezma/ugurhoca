import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { AccessToken } from 'livekit-server-sdk';
import { POST } from './route';
import { deriveLiveKitIdentity } from '@/features/live-lessons/lib/lesson-identity';

const { getUser, from } = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
}));
vi.mock('@/lib/auth-verify.server', () => ({ getVerifiedServerUser: getUser }));
vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({ from }),
}));
vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('livekit-server-sdk', () => ({
  AccessToken: vi.fn(function () {
    return { addGrant: vi.fn(), toJwt: async () => 'token' };
  }),
}));
const student = {
  id: 'student-a',
  name: 'Ada Gerçek',
  email: 'ada@example.com',
  accessGrade: '8',
  grade: 8,
  isAdmin: false,
};
const request = (role = 'student') =>
  new Request('http://localhost/api/livekit/token', {
    method: 'POST',
    body: JSON.stringify({
      lessonId: 'lesson',
      roomName: 'room1234',
      identity: 'client-id',
      role,
    }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('LIVEKIT_API_KEY', 'test-key');
  vi.stubEnv('LIVEKIT_API_SECRET', 'test-secret');
  vi.stubEnv('LESSON_PERSIST_SIGNING_SECRET', 'test-persist-secret-12345');
  getUser.mockResolvedValue(student);
  from.mockImplementation((table: string) => {
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      order: vi.fn(() => query),
      limit: async () => ({ data: [] }),
      single: async () => ({
        data:
          table === 'live_lessons'
            ? { id: 'lesson', target_grade: '8', status: 'active' }
            : null,
      }),
    };
    return query;
  });
});
afterEach(() => vi.unstubAllEnvs());

describe('LiveKit token ad gizliliği', () => {
  it('öğrencinin gerçek adını veya e-postasını token adına yazmaz', async () => {
    expect((await POST(request())).status).toBe(200);
    expect(AccessToken).toHaveBeenCalledWith('test-key', 'test-secret', {
      identity: deriveLiveKitIdentity('student', student.id),
      name: 'Öğrenci',
      ttl: '2h',
    });
  });
  it.each(['Uğur Öğretmen', ''])(
    'öğretmenin adı korunur veya güvenli yedek kullanılır (%s)',
    async (name) => {
      getUser.mockResolvedValue({
        ...student,
        email: 'admin@ugurhoca.com',
        name,
      });
      expect((await POST(request('teacher'))).status).toBe(200);
      expect(AccessToken).toHaveBeenCalledWith(
        'test-key',
        'test-secret',
        expect.objectContaining({ name: name || 'Öğretmen' }),
      );
    },
  );
  it('öğrencinin öğretmen rolü istemesini reddeder', async () => {
    expect((await POST(request('teacher'))).status).toBe(403);
    expect(AccessToken).not.toHaveBeenCalled();
  });
});
