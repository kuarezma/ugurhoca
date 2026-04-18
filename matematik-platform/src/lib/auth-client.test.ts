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
  getClientSession,
  getCurrentUserProfile,
  redirectToHome,
  redirectToLogin,
  requireClientSession,
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

  it('stores the access token cookie when a session exists', async () => {
    const session = createSession();
    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });

    await expect(getClientSession()).resolves.toBe(session);
    expect(getCookieValue(AUTH_ACCESS_TOKEN_COOKIE_NAME)).toBe('token-123');
  });

  it('signs out locally and clears cookies for invalid refresh tokens', async () => {
    document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE_NAME}=stale-token; path=/`;
    document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=stale-snapshot; path=/`;

    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid Refresh Token'),
    });
    mockSignOut.mockResolvedValue(undefined);

    await expect(getClientSession()).resolves.toBeNull();
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(getCookieValue(AUTH_ACCESS_TOKEN_COOKIE_NAME)).toBeUndefined();
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
});
