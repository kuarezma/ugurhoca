import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetVerifiedServerUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/auth-verify.server', () => ({
  getVerifiedServerUser: () => mockGetVerifiedServerUser(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({ from: mockFrom }),
  createServerSupabaseClient: () => ({ from: mockFrom }),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

type QueryCall = {
  table: string;
  eq: Array<[string, unknown]>;
  limit: number | null;
};

let calls: QueryCall[] = [];

const buildQueryStub = (table: string, rows: unknown[]) => {
  const call: QueryCall = { table, eq: [], limit: null };
  calls.push(call);

  const stub = {
    eq: (column: string, value: unknown) => {
      call.eq.push([column, value]);
      return stub;
    },
    order: () => stub,
    limit: (value: number) => {
      call.limit = value;
      return stub;
    },
    or: () => Promise.resolve({ data: rows, error: null }),
    then: (
      resolve: (value: { data: unknown[]; error: null }) => unknown,
    ) => Promise.resolve({ data: rows, error: null }).then(resolve),
  };

  return stub;
};

const activeLesson = {
  id: 'lesson-1',
  room_id: 'room-1',
  status: 'active',
  starts_at: '2026-01-01T10:00:00.000Z',
  target_grade: 'all',
  teacher_proof: 'gizli-imza',
  title: 'Canlı ders',
};

describe('loadActiveLiveLessonForCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    calls = [];
    mockFrom.mockImplementation((table: string) => ({
      select: () => buildQueryStub(table, [activeLesson]),
    }));
  });

  it('oturum yoksa sorgu çalıştırmadan null döner', async () => {
    mockGetVerifiedServerUser.mockResolvedValue(null);

    const { loadActiveLiveLessonForCurrentUser } = await import('./liveLessons');

    await expect(loadActiveLiveLessonForCurrentUser()).resolves.toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('yalnızca aktif dersi tek satırla çeker ve teacher_proof sızdırmaz', async () => {
    // Regresyon: ana sayfa eskiden scheduled + active + ended durumundaki tüm
    // dersleri limitsiz çekip istemcide aktif olanı arıyordu; tablo büyüdükçe
    // sorgu maliyeti ana sayfanın TTFB'sine ekleniyordu.
    mockGetVerifiedServerUser.mockResolvedValue({
      email: 'ogrenci@example.com',
      grade: 8,
      id: 'user-1',
      isAdmin: false,
      name: 'Öğrenci',
    });

    const { loadActiveLiveLessonForCurrentUser } = await import('./liveLessons');
    const lesson = await loadActiveLiveLessonForCurrentUser();

    expect(lesson?.id).toBe('lesson-1');
    expect(lesson?.teacher_proof).toBeUndefined();

    expect(calls).toHaveLength(1);
    expect(calls[0].table).toBe('live_lessons');
    expect(calls[0].eq).toContainEqual(['status', 'active']);
    expect(calls[0].limit).toBe(1);
  });
});
