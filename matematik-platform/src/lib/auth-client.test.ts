import type { Session } from '@supabase/supabase-js';
import {
  AUTH_ACCESS_TOKEN_COOKIE_NAME,
  AUTH_SNAPSHOT_COOKIE_NAME,
  parseAuthSnapshot,
} from '@/lib/auth-snapshot';

const mockGetSession = vi.fn();
const mockSignOut = vi.fn();
const mockProfileSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import {
  clearClientAuthSnapshotCookie,
  clearUserProfileCache,
  getClientSession,
  getCurrentUserProfile,
  redirectToHome,
  redirectToLogin,
  requireClientSession,
  signOutClient,
  PENDING_COOKIE_CLEANUP_KEY,
  syncCurrentUserSnapshotCookie,
  writeAccessTokenCookie,
} from '@/lib/auth-client';

const createSession = () =>
  ({
    access_token: 'token-123',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    refresh_token: 'refresh-token-123',
    token_type: 'bearer',
    user: {
      email: 'ogrenci@example.com',
      id: 'user-1',
      user_metadata: {
        grade: 7,
        name: 'Ada Öğrenci',
      },
    },
  }) as unknown as Session;

const mockFetch = vi.fn();

const sessionCalls = () =>
  mockFetch.mock.calls.filter(([url]) => url === '/api/auth/session');

const sessionCallMethods = () =>
  sessionCalls().map(([, init]) => (init as RequestInit | undefined)?.method);

const getCookieValue = (name: string) =>
  document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');

describe('auth-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Sunucu oturum senkronu modül/global durumda tekilleştirilir; testler arası sızmasın.
    delete (globalThis as { __ugurhoca_auth_store__?: unknown }).__ugurhoca_auth_store__;
    clearUserProfileCache();
    localStorage.clear();
    // Kilit içindeki ön kontrol güncel oturumu okur; varsayılan: token-123 ile oturum açık.
    mockGetSession.mockResolvedValue({ data: { session: createSession() }, error: null });
    mockFetch.mockImplementation(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE_NAME}=; path=/; max-age=0`;
    document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=; path=/; max-age=0`;

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockProfileSingle,
        }),
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([String.raw`/\evil.com`, '/%5Cevil.com', '//evil.com'])
    ('does not forward an unsafe login return target %s', (target) => {
      const router = { push: vi.fn(), replace: vi.fn() };
      redirectToLogin(router, target);
      expect(router.replace).toHaveBeenCalledWith('/giris');
    });

  it('clears only legacy learning keys on logout and keeps both users scoped data', async () => {
    localStorage.clear();
    mockSignOut.mockResolvedValue({ error: null });
    for (const key of ['favorites', 'matematiklab_completed_docs', 'ugurhoca_daily_goal_v1', 'ugur_hoca_mistakes_bank_v1', 'ugurhoca_pending_quiz_results', 'ugurhoca_active_draft_quiz_id', 'ugurhoca_quiz_draft_quiz-1']) {
      localStorage.setItem(key, 'legacy');
      localStorage.setItem(`${key}:user-a`, 'saved-a');
      localStorage.setItem(`${key}:user-b`, 'saved-b');
    }
    localStorage.setItem('theme', 'dark');
    await signOutClient();
    expect(localStorage.getItem('favorites')).toBeNull();
    expect(localStorage.getItem('ugurhoca_quiz_draft_quiz-1')).toBeNull();
    expect(localStorage.getItem('favorites:user-a')).toBe('saved-a');
    expect(localStorage.getItem('favorites:user-b')).toBe('saved-b');
    expect(localStorage.getItem('ugurhoca_quiz_draft_quiz-1:user-a')).toBe('saved-a');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('assigns legacy data to the first authenticated profile before any learning screen opens', async () => {
    localStorage.clear();
    localStorage.setItem('favorites', '["legacy"]');
    mockGetSession.mockResolvedValue({ data: { session: createSession() }, error: null });
    mockProfileSingle.mockResolvedValue({ data: { id: 'user-1', name: 'Ada', grade: 7 }, error: null });
    await getCurrentUserProfile({ redirectToLogin: false });
    expect(localStorage.getItem('favorites:user-1')).toBe('["legacy"]');
    expect(localStorage.getItem('favorites')).toBeNull();
  });

  it('prefers router.replace for redirects', () => {
    const router = {
      push: vi.fn(),
      replace: vi.fn(),
    };

    redirectToLogin(router);
    redirectToHome(router);

    expect(router.replace).toHaveBeenNthCalledWith(1, '/giris');
    expect(router.replace).toHaveBeenNthCalledWith(2, '/');
    expect(router.push).not.toHaveBeenCalled();
  });

  it('hands the access token to the HttpOnly session route instead of document.cookie', async () => {
    const session = createSession();
    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });

    await expect(getClientSession()).resolves.toBe(session);

    expect(getCookieValue(AUTH_ACCESS_TOKEN_COOKIE_NAME)).toBeUndefined();
    expect(document.cookie).not.toContain('token-123');
    expect(sessionCalls()).toHaveLength(1);
    const [, init] = sessionCalls()[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('same-origin');
    expect(JSON.parse(String(init.body))).toEqual({ access_token: 'token-123' });
  });

  it('posts the same token only once while it is in flight or already synced', async () => {
    mockGetSession.mockResolvedValue({ data: { session: createSession() }, error: null });

    await Promise.all([
      getClientSession({ forceRefresh: true }),
      getClientSession({ forceRefresh: true }),
      writeAccessTokenCookie('token-123'),
    ]);
    await getClientSession({ forceRefresh: true });

    expect(sessionCallMethods()).toEqual(['POST']);
  });

  it('posts again when the token is refreshed', async () => {
    await writeAccessTokenCookie('token-123');
    mockGetSession.mockResolvedValue({
      data: { session: { ...createSession(), access_token: 'token-456' } },
      error: null,
    });
    await writeAccessTokenCookie('token-456');

    expect(sessionCallMethods()).toEqual(['POST', 'POST']);
    expect(JSON.parse(String((sessionCalls()[1][1] as RequestInit).body))).toEqual({
      access_token: 'token-456',
    });
  });

  it('sends DELETE only after an in-flight POST settles so a late POST cannot resurrect the cookie', async () => {
    let finishPost: (response: Response) => void = () => undefined;
    mockFetch.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        finishPost = resolve;
      }),
    );

    const post = writeAccessTokenCookie('token-123');
    const del = writeAccessTokenCookie(null);
    await vi.waitFor(() => expect(sessionCallMethods()).toEqual(['POST']));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(sessionCallMethods()).toEqual(['POST']);
    finishPost(new Response(null, { status: 200 }));
    await Promise.all([post, del]);

    expect(sessionCallMethods()).toEqual(['POST', 'DELETE']);
  });

  it('does not post a token whose Supabase session is already gone (signed out elsewhere)', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    await expect(writeAccessTokenCookie('token-123')).resolves.toBe(false);

    expect(sessionCallMethods()).toEqual(['DELETE']);
  });

  it('skips a stale token when Supabase already holds a newer one', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { ...createSession(), access_token: 'token-456' } },
      error: null,
    });

    await expect(writeAccessTokenCookie('token-123')).resolves.toBe(false);

    expect(sessionCalls()).toHaveLength(0);
  });

  it('serialises session writes across tabs with the Web Locks API', async () => {
    let tail: Promise<unknown> = Promise.resolve();
    const request = vi.fn((_name: string, task: () => Promise<unknown>) => {
      const run = tail.then(task);
      tail = run.catch(() => undefined);
      return run;
    });
    Object.defineProperty(navigator, 'locks', { configurable: true, value: { request } });

    try {
      // Diğer sekme: kilidi tutar, bu sırada çıkış yapar (ortak localStorage oturumu silinir).
      let releaseOtherTab: () => void = () => undefined;
      const otherTab = request(
        'ugurhoca-auth-session',
        () =>
          new Promise<void>((resolve) => {
            releaseOtherTab = resolve;
          }),
      );

      const thisTab = writeAccessTokenCookie('token-123');
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(sessionCalls()).toHaveLength(0);

      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
      releaseOtherTab();
      await otherTab;

      await expect(thisTab).resolves.toBe(false);
      expect(request).toHaveBeenCalledWith('ugurhoca-auth-session', expect.any(Function));
      expect(sessionCallMethods()).toEqual(['DELETE']);
    } finally {
      delete (navigator as { locks?: unknown }).locks;
    }
  });

  it('keeps a token-free cleanup marker when the logout DELETE fails and retries on the next load', async () => {
    mockSignOut.mockResolvedValue({ error: null });
    mockFetch.mockImplementation(async (_url: string, init?: RequestInit) =>
      init?.method === 'DELETE'
        ? Promise.reject(new TypeError('Failed to fetch'))
        : new Response(null, { status: 200 }),
    );

    await signOutClient();

    expect(localStorage.getItem(PENDING_COOKIE_CLEANUP_KEY)).toBe('1');
    expect(JSON.stringify(Object.entries(localStorage))).not.toContain('token-123');

    // Sonraki sayfa yüklemesi: yeni modül durumu, snapshot çerezi yok, oturum yok.
    delete (globalThis as { __ugurhoca_auth_store__?: unknown }).__ugurhoca_auth_store__;
    mockFetch.mockImplementation(async () => new Response(null, { status: 200 }));
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    await getClientSession();
    await writeAccessTokenCookie(null);

    expect(sessionCallMethods()).toEqual(['DELETE', 'DELETE']);
    expect(localStorage.getItem(PENDING_COOKIE_CLEANUP_KEY)).toBeNull();
  });

  it('falls back to a local sign-out when Supabase sign-out returns an error and never re-posts the old token', async () => {
    mockSignOut.mockImplementation(async (options?: { scope?: string }) =>
      options?.scope === 'local' ? { error: null } : { error: new Error('network') },
    );
    await getClientSession();
    await writeAccessTokenCookie('token-123');

    await signOutClient();

    expect(mockSignOut).toHaveBeenNthCalledWith(2, { scope: 'local' });
    // Yerel silme de başarısız kalsa (oturum hâlâ okunuyor) eski token geri yazılmaz.
    await expect(writeAccessTokenCookie('token-123')).resolves.toBe(false);
    expect(sessionCallMethods()).toEqual(['POST', 'DELETE']);
  });

  it('keeps the client session when the session route is unreachable and retries later', async () => {
    const session = createSession();
    mockGetSession.mockResolvedValue({ data: { session }, error: null });
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(writeAccessTokenCookie('token-123')).resolves.toBe(false);
    await expect(getClientSession({ forceRefresh: true })).resolves.toBe(session);

    expect(sessionCallMethods()).toEqual(['POST', 'POST']);
  });

  it('treats a rejected token (non-2xx) as not synced so the next call retries', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(writeAccessTokenCookie('token-123')).resolves.toBe(false);
    await expect(writeAccessTokenCookie('token-123')).resolves.toBe(true);

    expect(sessionCallMethods()).toEqual(['POST', 'POST']);
  });

  it('does not call the session route for an anonymous visitor without auth cookies', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    await expect(getClientSession()).resolves.toBeNull();

    expect(sessionCalls()).toHaveLength(0);
  });

  it('clears the server cookie when the local session is gone but an auth cookie remains', async () => {
    document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=stale-snapshot; path=/`;
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    await expect(getClientSession()).resolves.toBeNull();

    expect(sessionCallMethods()).toEqual(['DELETE']);
    expect(getCookieValue(AUTH_SNAPSHOT_COOKIE_NAME)).toBeUndefined();
  });

  it('signs out locally and clears cookies for invalid refresh tokens', async () => {
    document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=stale-snapshot; path=/`;

    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid Refresh Token'),
    });
    mockSignOut.mockResolvedValue(undefined);

    await expect(getClientSession()).resolves.toBeNull();
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(sessionCallMethods()).toEqual(['DELETE']);
    expect(getCookieValue(AUTH_SNAPSHOT_COOKIE_NAME)).toBeUndefined();
  });

  it('redirects through requireClientSession when the session is missing', async () => {
    const router = {
      push: vi.fn(),
      replace: vi.fn(),
    };

    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(requireClientSession({ router })).resolves.toBeNull();
    expect(router.replace).toHaveBeenCalledWith('/giris');
  });

  it('returns the stored profile and writes an auth snapshot cookie', async () => {
    const session = createSession();
    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({
      data: {
        email: '',
        grade: 8,
        id: 'user-1',
        isAdmin: false,
        name: 'Ada Profil',
      },
    });

    const result = await getCurrentUserProfile({ redirectToLogin: false });

    expect(result?.profile).toMatchObject({
      email: 'ogrenci@example.com',
      grade: 8,
      id: 'user-1',
      name: 'Ada Profil',
    });
    expect(
      parseAuthSnapshot(getCookieValue(AUTH_SNAPSHOT_COOKIE_NAME)),
    ).toMatchObject({
      email: 'ogrenci@example.com',
      grade: 8,
      id: 'user-1',
      isAdmin: false,
      name: 'Ada Profil',
    });
  });

  it('falls back to session metadata when no profile row exists', async () => {
    const session = createSession();
    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({
      data: null,
    });

    const result = await getCurrentUserProfile({ redirectToLogin: false });

    expect(result?.profile).toMatchObject({
      email: 'ogrenci@example.com',
      grade: 7,
      id: 'user-1',
      isAdmin: false,
      name: 'Ada Öğrenci',
    });
  });

  it('deduplicates concurrent calls to getCurrentUserProfile and uses cache', async () => {
    const session = createSession();
    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({
      data: {
        email: 'ogrenci@example.com',
        grade: 8,
        id: 'user-1',
        isAdmin: false,
        name: 'Ada Profil',
      },
    });

    // 3 concurrent calls
    const [r1, r2, r3] = await Promise.all([
      getCurrentUserProfile({ redirectToLogin: false }),
      getCurrentUserProfile({ redirectToLogin: false }),
      getCurrentUserProfile({ redirectToLogin: false }),
    ]);

    expect(r1?.profile.name).toBe('Ada Profil');
    expect(r2?.profile.name).toBe('Ada Profil');
    expect(r3?.profile.name).toBe('Ada Profil');

    // Supabase .from('profiles') should be called only once
    expect(mockProfileSingle).toHaveBeenCalledTimes(1);

    // Subsequent call within cache window also shouldn't trigger another query
    const r4 = await getCurrentUserProfile({ redirectToLogin: false });
    expect(r4?.profile.name).toBe('Ada Profil');
    expect(mockProfileSingle).toHaveBeenCalledTimes(1);
  });

  it('clears client cookies and asks the server to drop the HttpOnly cookie via clearClientAuthSnapshotCookie', async () => {
    document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=test-snapshot; path=/`;

    clearClientAuthSnapshotCookie();
    // Aynı (null) hedef için ikinci çağrı yeni istek açmaz, bekleyen DELETE'i döndürür.
    await writeAccessTokenCookie(null);

    expect(sessionCallMethods()).toEqual(['DELETE']);
    expect(getCookieValue(AUTH_SNAPSHOT_COOKIE_NAME)).toBeUndefined();
  });

  it('signs out user from Supabase and clears the server cookie via signOutClient', async () => {
    document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=test-snapshot; path=/`;
    await writeAccessTokenCookie('token-123');

    await signOutClient();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(sessionCallMethods()).toEqual(['POST', 'DELETE']);
    expect(getCookieValue(AUTH_SNAPSHOT_COOKIE_NAME)).toBeUndefined();
  });

  it('never writes the access token cookie from JavaScript', async () => {
    const cookieSetter = vi.spyOn(document, 'cookie', 'set');

    await writeAccessTokenCookie('token-123');
    await writeAccessTokenCookie(null);

    for (const [value] of cookieSetter.mock.calls) {
      expect(String(value)).not.toContain(AUTH_ACCESS_TOKEN_COOKIE_NAME);
    }
    cookieSetter.mockRestore();
  });

  it('synchronizes current user profile snapshot cookie via syncCurrentUserSnapshotCookie', async () => {
    const session = createSession();
    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({
      data: {
        email: 'ogrenci@example.com',
        grade: 8,
        id: 'user-1',
        isAdmin: false,
        name: 'Ada Profil',
      },
    });

    const profile = await syncCurrentUserSnapshotCookie();
    expect(profile?.id).toBe('user-1');
    expect(profile?.name).toBe('Ada Profil');
    expect(getCookieValue(AUTH_SNAPSHOT_COOKIE_NAME)).toBeDefined();
  });
});
