import {
  AUTH_SNAPSHOT_COOKIE_NAME,
  parseAuthSnapshot,
} from '@/lib/auth-snapshot';

const LEGACY_KEYS = [
  'ugurhoca_active_draft_quiz_id',
  'ugur_hoca_mistakes_bank_v1',
  'favorites',
  'matematiklab_completed_docs',
  'ugurhoca_daily_goal_v1',
  'ugurhoca_pending_quiz_results',
];
const DRAFT_PREFIX = 'ugurhoca_quiz_draft_';
const MIGRATION_KEY = 'ugurhoca_user_storage_migrated_v1';

/** Yalnız yerel veri kapsamı için UX çerezini okur; sunucu yetkilendirmesi değildir. */
export const getStorageUserId = (): string | null => {
  try {
    if (typeof document === 'undefined') return null;
    const value = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${AUTH_SNAPSHOT_COOKIE_NAME}=`))
      ?.slice(AUTH_SNAPSHOT_COOKIE_NAME.length + 1);
    return parseAuthSnapshot(value)?.id ?? null;
  } catch {
    return null;
  }
};

const legacyKeys = (storage: Storage): string[] => {
  const keys = [...LEGACY_KEYS];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith(DRAFT_PREFIX) && !key.includes(':')) keys.push(key);
  }
  return keys;
};

const migrateLegacyStorage = (storage: Storage, userId: string) => {
  const migrationState = storage.getItem(MIGRATION_KEY);
  if (migrationState === 'true') return;
  // Yarım göçte de ilk hesabın sahipliği korunur; sonraki hesap kalan veriyi alamaz.
  if (migrationState && migrationState !== userId) return;
  if (!migrationState) storage.setItem(MIGRATION_KEY, userId);
  // Eski kayıtların sahibi bilinmiyor: hepsi ilk giriş yapan hesaba bir kez atanır.
  // Sonraki hesaplar/anonim kayıtlar yeniden göç edilmez; mevcut hesap verisi ezilmez.
  // Yazma başarısızsa o kaynak silinmez; tamamlanma işareti yerine sahiplik kalır.
  for (const key of legacyKeys(storage)) {
    const value = storage.getItem(key);
    if (value === null) continue;
    const scopedKey = `${key}:${userId}`;
    if (storage.getItem(scopedKey) === null) storage.setItem(scopedKey, value);
    storage.removeItem(key);
  }
  storage.setItem(MIGRATION_KEY, 'true');
};

export const migrateLegacyUserStorage = (userId: string): void => {
  try {
    if (typeof window !== 'undefined')
      migrateLegacyStorage(window.localStorage, userId);
  } catch {
    // Depolama engellenmişse göç sonraki erişimde yeniden denenebilir.
  }
};

export const scopedStorageKey = (
  key: string,
  userId: string | null = getStorageUserId(),
): string => {
  if (userId) migrateLegacyUserStorage(userId);
  return userId ? `${key}:${userId}` : key;
};

export const userScopedStorage = (
  userId: string | null = getStorageUserId(),
) => {
  const keyFor = (key: string) => (userId ? `${key}:${userId}` : key);
  const access = <T>(fallback: T, action: (storage: Storage) => T): T => {
    try {
      if (typeof window === 'undefined') return fallback;
      const storage = window.localStorage;
      if (userId) migrateLegacyStorage(storage, userId);
      return action(storage);
    } catch {
      return fallback;
    }
  };
  return {
    getItem: (key: string): string | null =>
      access(null, (storage) => storage.getItem(keyFor(key))),
    setItem: (key: string, value: string): boolean =>
      access(false, (storage) => {
        storage.setItem(keyFor(key), value);
        return true;
      }),
    removeItem: (key: string): boolean =>
      access(false, (storage) => {
        storage.removeItem(keyFor(key));
        return true;
      }),
  };
};

/** Çıkışta hesap kapsamındaki kalıcı veriler korunur; yalnız sahipsiz eski kayıtlar silinir. */
export const clearLegacyUserStorage = (): void => {
  try {
    if (typeof window === 'undefined') return;
    const storage = window.localStorage;
    for (const key of legacyKeys(storage)) storage.removeItem(key);
  } catch {
    // SSR, gizli sekme veya depolama erişim engeli oturum çıkışını kesmez.
  }
};
