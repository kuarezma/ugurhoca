import type { Session } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/admin';
import {
  AUTH_ACCESS_TOKEN_COOKIE_NAME,
  AUTH_SNAPSHOT_COOKIE_NAME,
  serializeAuthSnapshot,
  type AuthSnapshot,
} from '@/lib/auth-snapshot';
import { supabase } from '@/lib/supabase/client';
import { clearLegacyUserStorage, getStorageUserId, migrateLegacyUserStorage } from '@/lib/userScopedStorage';
import type { AppUser } from '@/types';
import { safeRedirectPath } from '@/lib/safe-redirect-path';

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

  const previousUserId = getStorageUserId();
  const secure = getSecureCookieFlag();

  if (!snapshot) {
    document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=; path=/; max-age=0; samesite=lax${secure}`;
    if (previousUserId) window.dispatchEvent(new Event('ugurhoca:daily-goal-updated'));
    return;
  }

  document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=${serializeAuthSnapshot(snapshot)}; path=/; max-age=${AUTH_SNAPSHOT_MAX_AGE}; samesite=lax${secure}`;
  migrateLegacyUserStorage(snapshot.id);
  if (previousUserId !== snapshot.id) window.dispatchEvent(new Event('ugurhoca:daily-goal-updated'));
};

const AUTH_SESSION_ROUTE = '/api/auth/session';
const AUTH_SESSION_LOCK = 'ugurhoca-auth-session';
const AUTH_SESSION_REQUEST_TIMEOUT_MS = 10_000;
// Token içermez; yalnız "sunucu çerezi silinemedi, yeniden dene" işaretidir.
export const PENDING_COOKIE_CLEANUP_KEY = 'ugurhoca_auth_cookie_cleanup_pending';

const setPendingCookieCleanup = (pending: boolean) => {
  try {
    if (pending) {
      localStorage.setItem(PENDING_COOKIE_CLEANUP_KEY, '1');
    } else {
      localStorage.removeItem(PENDING_COOKIE_CLEANUP_KEY);
    }
  } catch {
    // Depolama kapalıysa yeniden deneme yalnız bu sayfa ömrüyle sınırlı kalır.
  }
};

const hasPendingCookieCleanup = () => {
  try {
    return localStorage.getItem(PENDING_COOKIE_CLEANUP_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * Web Locks ile sekmeler arası sıralama: bir sekmenin bekleyen POST'u, başka
 * sekmedeki çıkışın DELETE'inden sonra çalışıp çerezi geri yazamasın. Kilit
 * yoksa (eski tarayıcı) yalnız sekme içi kuyruk geçerlidir.
 */
const withAuthSessionLock = <T>(task: () => Promise<T>): Promise<T> => {
  const locks = (typeof navigator !== 'undefined' ? navigator.locks : undefined) as
    | LockManager
    | undefined;
  return typeof locks?.request === 'function'
    ? (locks.request(AUTH_SESSION_LOCK, task) as Promise<T>)
    : task();
};

const sendSessionRequest = async (token: string | null) => {
  const signal =
    typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(AUTH_SESSION_REQUEST_TIMEOUT_MS)
      : undefined;
  const response = await fetch(
    AUTH_SESSION_ROUTE,
    token
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: token }),
          credentials: 'same-origin',
          cache: 'no-store',
          signal,
        }
      : { method: 'DELETE', credentials: 'same-origin', cache: 'no-store', signal },
  );
  return response.ok;
};

const deleteServerSession = async () => {
  setPendingCookieCleanup(true);
  const ok = await sendSessionRequest(null);
  if (ok) {
    setPendingCookieCleanup(false);
  }
  return ok;
};

// Kilit içinde çalışır. POST'tan hemen önce güncel Supabase oturumu yeniden
// okunur (localStorage sekmeler arası ortaktır): oturum bu arada kapandıysa
// çerez yazılmaz, silinir; token yenilendiyse yeni token kendi isteğini atar.
const syncServerSession = async (token: string | null, store: AuthGlobalStore) => {
  if (!token) {
    return deleteServerSession();
  }

  if (token === store.signedOutAccessToken) {
    return false;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    await deleteServerSession();
    return false;
  }

  if (session.access_token !== token) {
    return false;
  }

  const ok = await sendSessionRequest(token);
  // Ardından bir DELETE kuyruğa girdiyse temizlik işareti onun sonucuna kalır.
  if (ok && store.serverSessionSync?.token === token) {
    setPendingCookieCleanup(false);
  }
  return ok;
};

/**
 * Erişim token'ı artık yalnız sunucunun yazdığı HttpOnly çerezde durur
 * (bkz. src/app/api/auth/session/route.ts); bu modül çereze dokunmaz, yalnızca
 * rotayı çağırır. Aynı token için tekrar eden çağrılar (getClientSession her
 * önbellek ıskasında, onAuthStateChange olayları, giriş akışı) tek isteğe
 * indirgenir; başarısız istek durumu sıfırlar ki sonraki çağrı yeniden denesin.
 *
 * Hiçbir zaman reddetmez: ağ hatası istemci oturumunu bozmaz. `false` dönerse
 * çerez yazılamamış/silinememiştir; başarısız silme kalıcı bir işaretle
 * (PENDING_COOKIE_CLEANUP_KEY) sonraki sayfa yüklemesinde yeniden denenir.
 */
export const writeAccessTokenCookie = (accessToken: string | null): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  const token = accessToken || null;
  const store = getGlobalAuthStore();

  if (store.serverSessionSync && store.serverSessionSync.token === token) {
    return store.serverSessionSync.promise;
  }

  if (!token) {
    // Sayfa, kuyruktaki DELETE çalışmadan kapanırsa da yeniden denensin.
    setPendingCookieCleanup(true);
  }

  // İstekler sıraya alınır: Supabase doğrulaması yüzünden yavaş olan bir POST,
  // ardından gelen çıkış DELETE'inden sonra yanıtlanıp çerezi geri yazmasın.
  const previous = store.serverSessionSync?.promise ?? Promise.resolve(true);
  const promise = previous
    .then(() => withAuthSessionLock(() => syncServerSession(token, store)))
    .catch(() => false)
    .then((ok) => {
      if (!ok && store.serverSessionSync?.promise === promise) {
        store.serverSessionSync = null;
      }
      return ok;
    });

  store.serverSessionSync = { promise, token };
  return promise;
};

// Yerel Supabase oturumu yokken sunucu çerezini silmek için yalnızca bir iz
// varsa istek atılır; aksi halde her anonim sayfa görüntüleme bir DELETE olurdu.
// HttpOnly çerez görünmez; snapshot çerezi onunla birlikte yazılıp silinir,
// eski sürümün JS ile yazdığı token çerezi hâlâ görünür olabilir, başarısız
// bir silme ise kalıcı işaret bırakır.
const hasClientAuthCookieHint = () =>
  hasPendingCookieCleanup() ||
  (typeof document !== 'undefined' &&
    document.cookie
      .split(';')
      .some((entry) => {
        const name = entry.trim().split('=')[0];
        return name === AUTH_SNAPSHOT_COOKIE_NAME || name === AUTH_ACCESS_TOKEN_COOKIE_NAME;
      }));

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

export const redirectToLogin = (router?: RouterLike, redirectTarget?: string) => {
  const target = safeRedirectPath(
    redirectTarget ||
      (typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : ''),
  );
  const isValidTarget = target !== '/' && !target.startsWith('/giris');
  const loginPath = isValidTarget
    ? `/giris?redirect=${encodeURIComponent(target)}`
    : '/giris';
  redirectToPath(loginPath, router);
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
  serverSessionSync?: { promise: Promise<boolean>; token: string | null } | null;
  signedOutAccessToken?: string | null;
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
        if (hasClientAuthCookieHint()) {
          void writeAccessTokenCookie(null);
        }
        writeAuthSnapshotCookie(null);
      } else {
        void writeAccessTokenCookie(session.access_token);
      }

      store.cachedSession = {
        expiresAt: Date.now() + 5_000,
        session,
      };

      return session;
    } catch (error) {
      if (isInvalidRefreshTokenError(error)) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
        void writeAccessTokenCookie(null);
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
  clearLegacyUserStorage();
  clearUserProfileCache();
  void writeAccessTokenCookie(null);
  writeAuthSnapshotCookie(null);
};

export const signOutClient = async () => {
  const store = getGlobalAuthStore();
  // Çıkış yarıda kalsa bile bu sekme eski token'ı sunucu çerezine geri yazmasın.
  store.signedOutAccessToken =
    store.cachedSession?.session?.access_token ?? store.serverSessionSync?.token ?? null;
  clearUserProfileCache();
  try {
    const result = await supabase.auth.signOut();
    if (result?.error) {
      throw result.error;
    }
  } catch {
    // Sunucu tarafı çıkış başarısız (ör. ağ): yerel oturum yine de silinsin ki
    // getSession kontrolü kuyruktaki/sonraki POST'ları durdursun.
    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
  } finally {
    clearClientAuthSnapshotCookie();
    // Çıkıştan hemen sonraki yönlendirme silinmiş HttpOnly çerezi görsün.
    await writeAccessTokenCookie(null);
  }
};

export const syncCurrentUserSnapshotCookie = async () => {
  const result = await getCurrentUserProfile({ redirectToLogin: false });
  return result?.profile ?? null;
};
