import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadInitialTestsPageData } from './server';

const mocks = vi.hoisted(() => ({ snapshot: vi.fn(), eq: vi.fn() }));
vi.mock('@/lib/auth-snapshot.server', () => ({
  getServerAuthSnapshot: mocks.snapshot,
  getServerAccessToken: async () => 'test-token',
}));
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      select: () => {
        const query = {
          eq: mocks.eq,
          order: () => query,
          then: (resolve: (data: unknown) => unknown) =>
            Promise.resolve({ data: [] }).then(resolve),
        };
        mocks.eq.mockReturnValue(query);
        return query;
      },
    }),
  }),
}));

describe('Mezun sunucu test filtresi', () => {
  beforeEach(() => vi.clearAllMocks());
  it.each([0, 'Mezun'])(
    '%s görünümünü integer 0 ile sorgular',
    async (grade) => {
      mocks.snapshot.mockResolvedValue({
        id: 'graduate',
        name: 'Ada',
        email: 'a@example.com',
        grade,
        isAdmin: false,
      });
      await loadInitialTestsPageData();
      expect(mocks.eq).toHaveBeenCalledWith('grade', 0);
    },
  );
});
