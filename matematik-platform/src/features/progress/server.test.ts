import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createRecordingSupabase,
  serializedCalls,
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
  }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: mockCreateClient,
}));

import { loadInitialProgressPageData } from '@/features/progress/server';

describe('loadInitialProgressPageData — SSR kimlik sınırı', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Saldırgan kendi geçerli token'ını taşır ama istemcide yazılabilen
    // snapshot çerezini kurbanın kimliği + admin bayrağıyla değiştirir.
    cookieJar.clear();
    cookieJar.set(AUTH_SNAPSHOT_COOKIE_NAME, serializeAuthSnapshot(VICTIM_SNAPSHOT));
    cookieJar.set(AUTH_ACCESS_TOKEN_COOKIE_NAME, 'attacker-token');
  });

  it('sahte snapshot çereziyle başka kullanıcının ilerleme verisini sorgulamaz', async () => {
    const { calls, client } = createRecordingSupabase();
    mockCreateClient.mockReturnValue(client);
    mockGetVerifiedServerUser.mockResolvedValue(VERIFIED_ATTACKER);

    const result = await loadInitialProgressPageData();

    const serialized = serializedCalls(calls);
    expect(serialized).not.toContain(VICTIM_SNAPSHOT.id);
    for (const table of ['study_sessions', 'user_progress', 'study_goals', 'user_badges']) {
      expect(calls).toContainEqual({
        table,
        method: 'eq',
        args: ['user_id', VERIFIED_ATTACKER.id],
      });
    }
    expect(calls).toContainEqual({
      table: 'profiles',
      method: 'eq',
      args: ['id', VERIFIED_ATTACKER.id],
    });
    expect(result.user?.id).toBe(VERIFIED_ATTACKER.id);
    expect(result.user?.isAdmin).toBe(false);
    expect(result.isHydrated).toBe(true);
  });

  it('doğrulama başarısızsa veri sorgusu yapmaz; snapshot yalnız yetkisiz iskelet olur', async () => {
    const { calls, client } = createRecordingSupabase();
    mockCreateClient.mockReturnValue(client);
    mockGetVerifiedServerUser.mockResolvedValue(null);

    const result = await loadInitialProgressPageData();

    expect(calls).toHaveLength(0);
    expect(result.isHydrated).toBe(false);
    expect(result.sessions).toEqual([]);
    expect(result.user?.isAdmin).toBe(false);
  });
});
