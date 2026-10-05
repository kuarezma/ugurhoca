import { toDisplayGrade } from '@/lib/grade';
import type { Session } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/admin';
import {
  AUTH_ACCESS_TOKEN_COOKIE_NAME,
  AUTH_SNAPSHOT_COOKIE_NAME,
  serializeAuthSnapshot,
  type AuthSnapshot,
} from '@/lib/auth-snapshot';
import { getSupabaseAuthStorageKey, migrateLegacySupabaseSession, supabase } from '@/lib/supabase/client';
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
// Aşağıdaki üç localStorage anahtarı token içermez ve sekmeler arası ortaktır.
// "Sunucu çerezi silinemedi, yeniden dene."
export const PENDING_COOKIE_CLEANUP_KEY = 'ugurhoca_auth_cookie_cleanup_pending';
// "Kullanıcı çıkış yaptı; yeni bir SIGNED_IN olayına kadar hiçbir oturumu POST etme."
export const SIGNED_OUT_MARKER_KEY = 'ugurhoca_auth_signed_out';
// Sunucu çerezinin son bilinen durumu ('deleted' veya kullanıcı kimliği + oturum
// bitiş zamanı). Başka sekme çerezi değiştirdiyse bu sekmenin önbelleği geçersizdir.
export const COOKIE_STATE_KEY = 'ugurhoca_auth_cookie_state';

const readStorage = (key: string): string | null | undefined => {
  try {
    return localStorage.getItem(key);
  } catch {
    return undefined;
  }
};

const writeStorage = (key: string, value: string | null) => {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Depolama kapalıysa işaretler yalnız bu sayfa ömrüyle sınırlı kalır.
  }
};

const setPendingCookieCleanup = (pending: boolean) =>
  writeStorage(PENDING_COOKIE_CLEANUP_KEY, pending ? '1' : null);

const hasPendingCookieCleanup = () => readStorage(PENDING_COOKIE_CLEANUP_KEY) === '1';

const isSignedOutMarked = () => readStorage(SIGNED_OUT_MARKER_KEY) === '1';

/** Yalnız gerçek bir SIGNED_IN olayında çağrılır (bkz. AuthCookieSync). */
export const clearSignedOutMarker = () => writeStorage(SIGNED_OUT_MARKER_KEY, null);

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

type SyncResult = { ok: boolean; state?: string };

const deleteServerSession = async (): Promise<SyncResult> => {
  setPendingCookieCleanup(true);
  if (!(await sendSessionRequest(null))) {
    return { ok: false };
  }
  setPendingCookieCleanup(false);
  writeStorage(COOKIE_STATE_KEY, 'deleted');
  return { ok: true, state: 'deleted' };
};

const postServerSession = async (session: Session): Promise<SyncResult> => {
  if (!(await sendSessionRequest(session.access_token))) {
    return { ok: false };
  }
  const state = `session:${session.user.id}:${session.expires_at ?? ''}`;
  setPendingCookieCleanup(false);
  writeStorage(COOKIE_STATE_KEY, state);
  return { ok: true, state };
};

const readCurrentSession = async () => {
  if (isSignedOutMarked()) {
    return null;
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

/**
 * Kilit içinde çalışır; istek atılmadan hemen önce güncel Supabase oturumu
 * yeniden okunur (localStorage sekmeler arası ortaktır):
 *  - POST: oturum bu arada kapandıysa (başka sekmede çıkış) çerez silinir;
 *    token yenilendiyse yeni token kendi isteğini atar.
 *  - DELETE: kuyrukta beklerken başka sekmede giriş yapıldıysa yeni oturum
 *    silinmez, yazılır. Sonuç yine `false`dır: istenen silme yapılmadı.
 */
const syncServerSession = async (
  token: string | null,
  store: AuthGlobalStore,
): Promise<SyncResult> => {
  const session = await readCurrentSession();

  if (!token) {
    if (session && session.access_token !== store.signedOutAccessToken) {
      await postServerSession(session);
      return { ok: false };
    }
    return deleteServerSession();
  }

  if (token === store.signedOutAccessToken) {
    return { ok: false };
  }

  if (!session) {
    await deleteServerSession();
    return { ok: false };
  }

  if (session.access_token !== token) {
    return { ok: false };
  }

  return postServerSession(session);
};

// Başarılı bir senkron, başka sekme çerezi değiştirmediyse hâlâ geçerlidir.
// Depolama okunamıyorsa önbellek geçerli sayılır (aksi halde her çağrı istek atar).
const isServerSessionSyncCurrent = (sync: NonNullable<AuthGlobalStore['serverSessionSync']>) => {
  if (sync.state === undefined) {
    return true;
  }
  const current = readStorage(COOKIE_STATE_KEY);
  return current === undefined || current === sync.state;
};

/**
 * Erişim token'ı artık yalnız sunucunun yazdığı HttpOnly çerezde durur
 * (bkz. src/app/api/auth/session/route.ts); bu modül çereze dokunmaz, yalnızca
 * rotayı çağırır. Aynı token için tekrar eden çağrılar (getClientSession her
 * önbellek ıskasında, onAuthStateChange olayları, giriş akışı) tek isteğe
 * indirgenir; başarısız istek ya da başka sekmenin çerezi değiştirmesi
 * önbelleği geçersiz kılar ki sonraki çağrı yeniden denesin.
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
  const current = store.serverSessionSync;

  if (current && current.token === token && isServerSessionSyncCurrent(current)) {
    return current.promise;
  }

  if (!token) {
    // Sayfa, kuyruktaki DELETE çalışmadan kapanırsa da yeniden denensin.
    setPendingCookieCleanup(true);
  }

  // İstekler sıraya alınır: Supabase doğrulaması yüzünden yavaş olan bir POST,
  // ardından gelen çıkış DELETE'inden sonra yanıtlanıp çerezi geri yazmasın.
  const previous = current?.promise ?? Promise.resolve(true);
  const entry: NonNullable<AuthGlobalStore['serverSessionSync']> = {
    promise: Promise.resolve(false),
    token,
  };
  entry.promise = previous
    .then(() => withAuthSessionLock(() => syncServerSession(token, store)))
    .catch((): SyncResult => ({ ok: false }))
    .then(({ ok, state }) => {
      if (!ok && store.serverSessionSync === entry) {
        store.serverSessionSync = null;
      }
      entry.state = state ?? null;
      return ok;
    });

  store.serverSessionSync = entry;
  return entry.promise;
};

type StoredSessionIdentity = {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
};

/**
 * supabase-js'in ortak localStorage'daki oturumunu SDK'yı atlayarak okur.
 * null: depoda oturum yok; undefined: okunamadı/çözümlenemedi (bilinmiyor).
 * Değerler yalnız bellekte karşılaştırılır, hiçbir yere yazılmaz.
 */
const readStoredSupabaseSession = (): StoredSessionIdentity | null | undefined => {
  try {
    const storageKey = getSupabaseAuthStorageKey();
    if (!storageKey) {
      return undefined;
    }
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as {
      access_token?: unknown;
      refresh_token?: unknown;
      user?: { id?: unknown };
    } | null;
    if (!parsed || typeof parsed !== 'object') {
      return undefined;
    }
    return {
      accessToken: typeof parsed.access_token === 'string' ? parsed.access_token : undefined,
      refreshToken: typeof parsed.refresh_token === 'string' ? parsed.refresh_token : undefined,
      userId: typeof parsed.user?.id === 'string' ? parsed.user.id : undefined,
    };
  } catch {
    return undefined;
  }
};

const isSameStoredSession = (
  a: StoredSessionIdentity | null | undefined,
  b: StoredSessionIdentity | null | undefined,
) =>
  Boolean(
    a &&
      b &&
      a.userId &&
      a.userId === b.userId &&
      ((a.accessToken && a.accessToken === b.accessToken) ||
        (a.refreshToken && a.refreshToken === b.refreshToken)),
  );

/**
 * Çıkış işareti yalnız depoda oturum yoksa ya da depodaki oturum çıkış
 * yapılanla aynıysa yazılır: arada başka sekmede açılan yeni oturum (ortak
 * localStorage) işaretle engellenmesin. Depo okunamıyorsa güvenli taraf seçilir.
 */
const canMarkSignedOut = (signedOut: StoredSessionIdentity | null | undefined) => {
  const current = readStoredSupabaseSession();
  return current == null || isSameStoredSession(current, signedOut);
};

const markSignedOutIfSameSession = (signedOut: StoredSessionIdentity | null | undefined) => {
  if (canMarkSignedOut(signedOut)) {
    writeStorage(SIGNED_OUT_MARKER_KEY, '1');
  }
};

// Yalnız depodaki oturum hâlâ çıkış yapılan oturumsa siler; başka sekmede
// açılmış yeni bir oturuma dokunmaz. Silinip silinmediğini döndürür.
const removeLocalSupabaseSession = (signedOut: StoredSessionIdentity | null | undefined) => {
  if (!isSameStoredSession(readStoredSupabaseSession(), signedOut)) {
    return false;
  }
  try {
    const storageKey = getSupabaseAuthStorageKey();
    if (!storageKey) {
      return false;
    }
    for (const suffix of ['', '-code-verifier', '-user']) {
      localStorage.removeItem(`${storageKey}${suffix}`);
    }
    return true;
  } catch {
    // Silinemezse SIGNED_OUT_MARKER_KEY eski oturumun POST edilmesini yine engeller.
    return false;
  }
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
  grade: toDisplayGrade(profile.grade),
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
  serverSessionSync?: {
    promise: Promise<boolean>;
    // undefined: istek sürüyor; null: durum bilinmiyor; string: yazılan çerez durumu.
    state?: string | null;
    token: string | null;
  } | null;
  signedOutAccessToken?: string | null;
  signedOutSession?: StoredSessionIdentity | null;
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
      await migrateLegacySupabaseSession();
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
        grade: toDisplayGrade(profile.grade),
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
        grade: toDisplayGrade(session.user.user_metadata?.grade),
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
  markSignedOutIfSameSession(getGlobalAuthStore().signedOutSession);
  clearLegacyUserStorage();
  clearUserProfileCache();
  void writeAccessTokenCookie(null);
  writeAuthSnapshotCookie(null);
};

export const signOutClient = async () => {
  const store = getGlobalAuthStore();
  // Çıkış yarıda kalsa bile bu sekme eski token'ı sunucu çerezine geri yazmasın.
  const storedSession = readStoredSupabaseSession();
  store.signedOutSession = storedSession;
  store.signedOutAccessToken =
    storedSession?.accessToken ??
    store.cachedSession?.session?.access_token ??
    store.serverSessionSync?.token ??
    null;
  // Kalıcı ve sekmeler arası: yeniden yüklemede de eski oturum POST edilmez;
  // yalnız yeni bir SIGNED_IN olayı kaldırır.
  markSignedOutIfSameSession(storedSession);
  clearUserProfileCache();
  try {
    const result = await supabase.auth.signOut();
    if (result?.error) {
      throw result.error;
    }
  } catch {
    // Sunucu tarafı çıkış başarısız (ör. ağ). SDK'nın 'local' kapsamı da sunucuya
    // gider ve 5xx'te yerel oturumu silmez; o da başarısızsa SDK atlanır.
    const local = await supabase.auth
      .signOut({ scope: 'local' })
      .catch((error: unknown) => ({ error }));
    if ((!local || local.error) && !removeLocalSupabaseSession(storedSession)) {
      // Depoda artık başka bir oturum var (ör. başka sekmede giriş): o geçerli,
      // silinmez ve onu engelleyecek çıkış işareti geri alınır.
      if (!canMarkSignedOut(storedSession)) {
        writeStorage(SIGNED_OUT_MARKER_KEY, null);
      }
    }
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
