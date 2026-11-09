import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { GET } from './route';
import { deriveLiveKitIdentity } from '@/features/live-lessons/lib/lesson-identity';

const { getUser, from, eq, limited } = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  eq: vi.fn(),
  limited: vi.fn(),
}));
vi.mock('@/lib/auth-verify.server', () => ({ getVerifiedServerUser: getUser }));
vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({ from }),
}));
vi.mock('@/lib/rate-limit', () => ({ enforceRateLimit: limited }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
const request = () =>
  new Request('http://localhost/api/live-lessons/lesson/participants');
const context = () => ({ params: Promise.resolve({ lessonId: 'lesson' }) });
beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ id: 'teacher', email: 'admin@ugurhoca.com' });
  limited.mockResolvedValue(null);
  from.mockReturnValue({ select: () => ({ eq }) });
  eq.mockResolvedValue({
    data: [
      { user_id: 'student-a', user_name: 'Ada Gerçek', role: 'student' },
      { user_id: 'teacher', user_name: 'Uğur Öğretmen', role: 'teacher' },
    ],
    error: null,
  });
});
describe('Öğretmene özel katılımcı adları', () => {
  it('öğrenci 403 alır; servis sorgusu çalışmaz', async () => {
    getUser.mockResolvedValue({
      id: 'student-a',
      email: 'ada@example.com',
      isAdmin: true,
    });
    const response = await GET(request(), context());
    expect(response.status).toBe(403);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(from).not.toHaveBeenCalled();
  });
  it('admin dersin kimlik-ad eşlemesini alır', async () => {
    const response = await GET(request(), context());
    expect(await response.json()).toEqual({
      participantNames: {
        [deriveLiveKitIdentity('student', 'student-a')]: 'Ada Gerçek',
        [deriveLiveKitIdentity('teacher', 'teacher')]: 'Uğur Öğretmen',
      },
    });
    expect(eq).toHaveBeenCalledWith('lesson_id', 'lesson');
    expect(limited).toHaveBeenCalledWith(
      'live-lesson-participants',
      'teacher',
      { limit: 60, windowSeconds: 60 },
    );
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });
  it('oturumsuz isteği reddeder', async () => {
    getUser.mockResolvedValue(null);
    expect((await GET(request(), context())).status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });
  it('oran sınırında sorgu çalışmaz', async () => {
    limited.mockResolvedValue(
      NextResponse.json({ error: 'Sınır' }, { status: 429 }),
    );
    expect((await GET(request(), context())).status).toBe(429);
    expect(from).not.toHaveBeenCalled();
  });
  it('sorgu hatasında ad döndürmez', async () => {
    eq.mockResolvedValue({ data: null, error: { message: 'db detail' } });
    const response = await GET(request(), context());
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('db detail');
  });
});
