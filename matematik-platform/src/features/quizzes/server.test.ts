import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createRecordingSupabase,
  VERIFIED_ATTACKER,
  VICTIM_SNAPSHOT,
} from '@/test/ssr-auth-fixtures';
import {
  AUTH_ACCESS_TOKEN_COOKIE_NAME,
  AUTH_SNAPSHOT_COOKIE_NAME,
  serializeAuthSnapshot,
} from '@/lib/auth-snapshot';

const { mockGetVerifiedServerUser, mockCreateClient, cookieJar } = vi.hoisted(() => ({
  mockGetVerifiedServerUser: vi.fn(),
  mockCreateClient: vi.fn(),
  cookieJar: new Map<string, string>(),
}));

vi.mock('@/lib/auth-verify.server', () => ({
  getVerifiedServerUser: mockGetVerifiedServerUser,
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.has(name) ? { name, value: cookieJar.get(name) } : undefined,
    getAll: () => [...cookieJar].map(([name, value]) => ({ name, value })),
  }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: mockCreateClient,
}));

import { loadInitialTestsPageData } from '@/features/quizzes/server';

describe('loadInitialTestsPageData — SSR kimlik sınırı', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Saldırgan kendi geçerli token'ını taşır ama istemcide yazılabilen
    // snapshot çerezini kurbanın kimliği + admin bayrağıyla değiştirir.
    cookieJar.clear();
    cookieJar.set(AUTH_SNAPSHOT_COOKIE_NAME, serializeAuthSnapshot(VICTIM_SNAPSHOT));
    cookieJar.set(AUTH_ACCESS_TOKEN_COOKIE_NAME, 'attacker-token');
  });

  it('sınıf filtresini ve admin bayrağını sahte snapshot yerine doğrulanmış kullanıcıdan alır', async () => {
    const { calls, client } = createRecordingSupabase();
    mockCreateClient.mockReturnValue(client);
    mockGetVerifiedServerUser.mockResolvedValue(VERIFIED_ATTACKER);

    const result = await loadInitialTestsPageData();

    expect(calls).toContainEqual({
      table: 'quizzes',
      method: 'eq',
      args: ['grade', VERIFIED_ATTACKER.grade],
    });
    expect(calls).not.toContainEqual({
      table: 'quizzes',
      method: 'eq',
      args: ['grade', VICTIM_SNAPSHOT.grade],
    });
    expect(result.initialUser?.id).toBe(VERIFIED_ATTACKER.id);
    expect(result.initialUser?.isAdmin).toBe(false);
    expect(result.isHydrated).toBe(true);
  });

  it('doğrulama başarısızsa veri sorgusu yapmaz; snapshot yalnız yetkisiz iskelet olur', async () => {
    const { calls, client } = createRecordingSupabase();
    mockCreateClient.mockReturnValue(client);
    mockGetVerifiedServerUser.mockResolvedValue(null);

    const result = await loadInitialTestsPageData();

    expect(calls).toHaveLength(0);
    expect(result.isHydrated).toBe(false);
    expect(result.initialQuizzes).toEqual([]);
    expect(result.initialUser?.isAdmin).toBe(false);
  });
});

describe('Mezun sunucu test filtresi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieJar.clear();
    cookieJar.set(AUTH_SNAPSHOT_COOKIE_NAME, serializeAuthSnapshot(VICTIM_SNAPSHOT));
    cookieJar.set(AUTH_ACCESS_TOKEN_COOKIE_NAME, 'graduate-token');
  });
  it.each([0, 'Mezun'])(
    '%s görünümünü integer 0 ile sorgular',
    async (grade) => {
      const { calls, client } = createRecordingSupabase();
      mockCreateClient.mockReturnValue(client);
      mockGetVerifiedServerUser.mockResolvedValue({
        ...VERIFIED_ATTACKER,
        id: 'graduate',
        name: 'Ada',
        email: 'a@example.com',
        grade,
        accessGrade: 'Mezun',
        isAdmin: false,
      });
      await loadInitialTestsPageData();
      expect(calls).toContainEqual({
        table: 'quizzes',
        method: 'eq',
        args: ['grade', 0],
      });
    },
  );
});
