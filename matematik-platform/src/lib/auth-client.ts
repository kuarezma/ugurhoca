import type { Session } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/admin';
import {
  AUTH_ACCESS_TOKEN_COOKIE_NAME,
  AUTH_SNAPSHOT_COOKIE_NAME,
  serializeAuthSnapshot,
  type AuthSnapshot,
} from '@/lib/auth-snapshot';
import { supabase } from '@/lib/supabase/client';
import type { AppUser } from '@/types';

type RouterLike = {
  push: (href: string) => void;
  replace?: (href: string) => void;
};

type AuthOptions = {
  forceRefresh?: boolean;
  redirectToLogin?: boolean;
  router?: RouterLike;
};

const INVALID_REFRESH_TOKEN_PATTERN = /Invalid Refresh Token/i;
const AUTH_SNAPSHOT_MAX_AGE = 60 * 60 * 24 * 30;

const isInvalidRefreshTokenError = (error: unknown) =>
  error instanceof Error && INVALID_REFRESH_TOKEN_PATTERN.test(error.message);

const getSecureCookieFlag = () => {
  if (typeof window === 'undefined') return '';
  return window.location.protocol === 'https:' ? '; secure' : '';
};

const writeAuthSnapshotCookie = (snapshot: AuthSnapshot | null) => {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = getSecureCookieFlag();

  if (!snapshot) {
    document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=; path=/; max-age=0; samesite=lax${secure}`;
    return;
  }

  document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=${serializeAuthSnapshot(snapshot)}; path=/; max-age=${AUTH_SNAPSHOT_MAX_AGE}; samesite=lax${secure}`;
};

const writeAccessTokenCookie = (accessToken: string | null) => {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = getSecureCookieFlag();

  if (!accessToken) {
    document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax${secure}`;
    return;
  }

  document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(accessToken)}; path=/; max-age=${AUTH_SNAPSHOT_MAX_AGE}; samesite=lax${secure}`;
};

const createAuthSnapshot = (profile: AppUser): AuthSnapshot => ({
  email: profile.email,
  grade: profile.grade,
  id: profile.id,
  isAdmin: profile.isAdmin ?? isAdminEmail(profile.email),
  name: profile.name,
});

const redirectToPath = (href: string, router?: RouterLike) => {
  if (router?.replace) {
    router.replace(href);
    return;
  }

  if (router) {
    router.push(href);
    return;
  }

  if (typeof window !== 'undefined') {
    window.location.assign(href);
  }
};

export const redirectToLogin = (router?: RouterLike) => {
  redirectToPath('/giris', router);
};

export const redirectToHome = (router?: RouterLike) => {
  redirectToPath('/', router);
};

type CachedProfileEntry = {
  expiresAt: number;
  result: { profile: AppUser; session: Session } | null;
  userId: string;
};

type AuthGlobalStore = {
  cachedSession: { session: Session | null; expiresAt: number } | null;
  inFlightProfilePromise: Promise<{ profile: AppUser; session: Session } | null> | null;
  inFlightSessionPromise: Promise<Session | null> | null;
  profileCache: CachedProfileEntry | null;
};

const getGlobalAuthStore = (): AuthGlobalStore => {
  const g = globalThis as unknown as { __ugurhoca_auth_store__?: AuthGlobalStore };
  if (!g.__ugurhoca_auth_store__) {
    g.__ugurhoca_auth_store__ = {
      cachedSession: null,
      inFlightProfilePromise: null,
      inFlightSessionPromise: null,
      profileCache: null,
    };
  }
  return g.__ugurhoca_auth_store__;
};

export const clearUserProfileCache = () => {
  const store = getGlobalAuthStore();
  store.profileCache = null;
  store.inFlightProfilePromise = null;
  store.cachedSession = null;
  store.inFlightSessionPromise = null;
};

export const getClientSession = async (options: { forceRefresh?: boolean } = {}) => {
  const store = getGlobalAuthStore();

  if (!options.forceRefresh && store.cachedSession && store.cachedSession.expiresAt > Date.now()) {
    return store.cachedSession.session;
  }

  if (!options.forceRefresh && store.inFlightSessionPromise) {
    return await store.inFlightSessionPromise;
  }

  const sessionPromise = (async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (!session) {
        writeAccessTokenCookie(null);
        writeAuthSnapshotCookie(null);
      } else {
        writeAccessTokenCookie(session.access_token);
      }

      store.cachedSession = {
        expiresAt: Date.now() + 5_000,
        session,
      };

      return session;
    } catch (error) {
      if (isInvalidRefreshTokenError(error)) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
        writeAccessTokenCookie(null);
        writeAuthSnapshotCookie(null);
        store.cachedSession = null;
        return null;
      }

      throw error;
    } finally {
      store.inFlightSessionPromise = null;
    }
  })();

  store.inFlightSessionPromise = sessionPromise;
  return await sessionPromise;
};

export const requireClientSession = async (options: AuthOptions = {}) => {
  const session = await getClientSession({ forceRefresh: options.forceRefresh });

  if (!session) {
    if (options.redirectToLogin !== false) {
      redirectToLogin(options.router);
    }
    return null;
  }

  return session;
};

export const getCurrentUserProfile = async <TProfile extends AppUser = AppUser>(
  options: AuthOptions = {},
): Promise<{ profile: TProfile; session: Session } | null> => {
  const store = getGlobalAuthStore();

  if (!options.forceRefresh && store.profileCache && store.profileCache.expiresAt > Date.now()) {
    return store.profileCache.result as { profile: TProfile; session: Session } | null;
  }

  if (store.inFlightProfilePromise && !options.forceRefresh) {
    return (await store.inFlightProfilePromise) as { profile: TProfile; session: Session } | null;
  }

  const fetchPromise = (async () => {
    const session = await requireClientSession(options);

    if (!session) {
      writeAuthSnapshotCookie(null);
      store.profileCache = null;
      return null;
    }

    if (
      !options.forceRefresh &&
      store.profileCache &&
      store.profileCache.userId === session.user.id &&
      store.profileCache.expiresAt > Date.now()
    ) {
      return store.profileCache.result;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    let result: { profile: AppUser; session: Session };

    if (profile) {
      const resolvedProfile = {
        ...(profile as Record<string, unknown>),
        email: session.user.email ?? '',
        isAdmin:
          typeof profile.isAdmin === 'boolean'
            ? profile.isAdmin
            : isAdminEmail(session.user.email),
      } as AppUser;

      writeAuthSnapshotCookie(createAuthSnapshot(resolvedProfile));

      result = {
        profile: resolvedProfile,
        session,
      };
    } else {
      const fallbackProfile = {
        email: session.user.email ?? '',
        grade: session.user.user_metadata?.grade ?? 5,
        id: session.user.id,
        isAdmin: isAdminEmail(session.user.email),
        name: session.user.user_metadata?.name ?? 'Öğrenci',
      } as AppUser;

      writeAuthSnapshotCookie(createAuthSnapshot(fallbackProfile));

      result = {
        profile: fallbackProfile,
        session,
      };
    }

    store.profileCache = {
      expiresAt: Date.now() + 30_000,
      result,
      userId: session.user.id,
    };

    return result;
  })();

  store.inFlightProfilePromise = fetchPromise;

  try {
    const res = await fetchPromise;
    return res as { profile: TProfile; session: Session } | null;
  } finally {
    if (store.inFlightProfilePromise === fetchPromise) {
      store.inFlightProfilePromise = null;
    }
  }
};

export const clearClientAuthSnapshotCookie = () => {
  clearUserProfileCache();
  writeAccessTokenCookie(null);
  writeAuthSnapshotCookie(null);
};

export const signOutClient = async () => {
  clearUserProfileCache();
  await supabase.auth.signOut();
  clearClientAuthSnapshotCookie();
};

export const syncCurrentUserSnapshotCookie = async () => {
  const result = await getCurrentUserProfile({ redirectToLogin: false });
  return result?.profile ?? null;
};
