import { describe, expect, it, vi, beforeEach } from 'vitest';
import { loadInitialProgressPageData } from './server';
import {
  getServerAccessToken,
  getServerAuthSnapshot,
} from '@/lib/auth-snapshot.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

vi.mock('@/lib/auth-snapshot.server', () => ({
  getServerAccessToken: vi.fn(),
  getServerAuthSnapshot: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

const snapshot = {
  id: 'student',
  name: 'Öğrenci',
  email: 'student@example.test',
  grade: 7,
  isAdmin: false,
};

describe('Progress SSR query concurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerAuthSnapshot).mockResolvedValue(snapshot);
    vi.mocked(getServerAccessToken).mockResolvedValue('test-token');
  });

  it('auth bilgisi gelmeden sorgulamaz; profil beklerken dört koleksiyonu da başlatır', async () => {
    const auth = Promise.withResolvers<typeof snapshot>();
    const profile = Promise.withResolvers<{ data: typeof snapshot | null }>();
    const verification = Promise.withResolvers<{
      data: { user: { id: string } };
      error: null;
    }>();
    const getUser = vi.fn(() => verification.promise);
    vi.mocked(getServerAuthSnapshot).mockReturnValue(auth.promise);
    const filters: string[][] = [];
    const started: string[] = [];
    const from = vi.fn((table: string) => {
      const query = {
        select: vi.fn(() => query),
        eq: vi.fn((column: string, id: string) => {
          filters.push([column, id]);
          return query;
        }),
        order: vi.fn(() => query),
        single: vi.fn(() => {
          started.push(table);
          return profile.promise;
        }),
        then: (resolve: (value: { data: [] }) => void) => {
          started.push(table);
          return Promise.resolve({ data: [] as [] }).then(resolve);
        },
      };
      return query;
    });
    vi.mocked(createServerSupabaseClient).mockReturnValue({
      from,
      auth: { getUser },
    } as unknown as ReturnType<typeof createServerSupabaseClient>);

    const pending = loadInitialProgressPageData();
    await Promise.resolve();
    expect(from).not.toHaveBeenCalled();
    auth.resolve(snapshot);
    await vi.waitFor(() => expect(getUser).toHaveBeenCalledWith('test-token'));
    expect(from).not.toHaveBeenCalled();
    verification.resolve({ data: { user: { id: snapshot.id } }, error: null });
    // PostgREST sorguları Promise.all tarafından başlatılan thenable nesnelerdir.
    await vi.waitFor(() => expect(started).toHaveLength(5));
    expect(filters).toEqual([
      ['id', 'student'],
      ['user_id', 'student'],
      ['user_id', 'student'],
      ['user_id', 'student'],
      ['user_id', 'student'],
    ]);
    expect(createServerSupabaseClient).toHaveBeenCalledWith('test-token');
    profile.resolve({ data: snapshot });
    expect(await pending).toMatchObject({
      isHydrated: true,
      user: snapshot,
      sessions: [],
      progressData: [],
      badges: [],
    });
  });

  it.each(['snapshot', 'token'])(
    'eksik %s varken veri sorgusu açmaz',
    async (missing) => {
      if (missing === 'snapshot')
        vi.mocked(getServerAuthSnapshot).mockResolvedValue(null);
      else vi.mocked(getServerAccessToken).mockResolvedValue(null);
      expect((await loadInitialProgressPageData()).isHydrated).toBe(false);
      expect(createServerSupabaseClient).not.toHaveBeenCalled();
    },
  );

  it.each(['other-user', null])(
    'token kimliği snapshot ile eşleşmezse sorgulamaz: %s',
    async (id) => {
      const from = vi.fn();
      const getUser = vi
        .fn()
        .mockResolvedValue({ data: { user: id ? { id } : null }, error: null });
      vi.mocked(createServerSupabaseClient).mockReturnValue({
        from,
        auth: { getUser },
      } as unknown as ReturnType<typeof createServerSupabaseClient>);
      expect(await loadInitialProgressPageData()).toMatchObject({
        isHydrated: false,
        user: null,
      });
      expect(from).not.toHaveBeenCalled();
    },
  );
});
