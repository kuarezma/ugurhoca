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
};

type AuthOptions = {
  redirectToLogin?: boolean;
  router?: RouterLike;
};

const INVALID_REFRESH_TOKEN_PATTERN = /Invalid Refresh Token/i;
const AUTH_SNAPSHOT_MAX_AGE = 60 * 60 * 24 * 30;

const isInvalidRefreshTokenError = (error: unknown) =>
  error instanceof Error && INVALID_REFRESH_TOKEN_PATTERN.test(error.message);

const writeAuthSnapshotCookie = (snapshot: AuthSnapshot | null) => {
  if (typeof document === 'undefined') {
    return;
  }

  if (!snapshot) {
    document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    return;
  }

  document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=${serializeAuthSnapshot(snapshot)}; path=/; max-age=${AUTH_SNAPSHOT_MAX_AGE}; samesite=lax`;
};

const writeAccessTokenCookie = (accessToken: string | null) => {
  if (typeof document === 'undefined') {
    return;
  }

  if (!accessToken) {
    document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    return;
  }

  document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(accessToken)}; path=/; max-age=${AUTH_SNAPSHOT_MAX_AGE}; samesite=lax`;
};

const createAuthSnapshot = (profile: AppUser): AuthSnapshot => ({
  email: profile.email,
  grade: profile.grade,
  id: profile.id,
  isAdmin: profile.isAdmin ?? isAdminEmail(profile.email),
  name: profile.name,
});

export const redirectToLogin = (router?: RouterLike) => {
  if (router) {
    router.push('/giris');
    return;
  }

  window.location.href = '/giris';
};

export const getClientSession = async () => {
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

    return session;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
      writeAccessTokenCookie(null);
      writeAuthSnapshotCookie(null);
      return null;
    }

    throw error;
  }
};

export const requireClientSession = async (options: AuthOptions = {}) => {
  const session = await getClientSession();

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
  const session = await requireClientSession(options);

  if (!session) {
    writeAuthSnapshotCookie(null);
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profile) {
    const resolvedProfile = {
      ...(profile as Record<string, unknown>),
      email: session.user.email ?? '',
      isAdmin:
        typeof profile.isAdmin === 'boolean'
          ? profile.isAdmin
          : isAdminEmail(session.user.email),
    } as TProfile;

    writeAuthSnapshotCookie(createAuthSnapshot(resolvedProfile));

    return {
      profile: resolvedProfile,
      session,
    };
  }

  const fallbackProfile = {
    email: session.user.email ?? '',
    grade: session.user.user_metadata?.grade ?? 5,
    id: session.user.id,
    isAdmin: isAdminEmail(session.user.email),
    name: session.user.user_metadata?.name ?? 'Öğrenci',
  } as TProfile;

  writeAuthSnapshotCookie(createAuthSnapshot(fallbackProfile));

  return {
    profile: fallbackProfile,
    session,
  };
};

export const clearClientAuthSnapshotCookie = () => {
  writeAccessTokenCookie(null);
  writeAuthSnapshotCookie(null);
};

export const signOutClient = async () => {
  await supabase.auth.signOut();
  clearClientAuthSnapshotCookie();
};

export const syncCurrentUserSnapshotCookie = async () => {
  const result = await getCurrentUserProfile({ redirectToLogin: false });
  return result?.profile ?? null;
};
