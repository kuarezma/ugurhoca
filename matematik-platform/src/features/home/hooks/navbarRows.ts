'use client';

import { supabase } from '@/lib/supabase/client';
import type { DashboardNotification } from '@/types/dashboard';

// Navbar'daki zil ve mesaj butonu aynı tablodan okur. İki ayrı sorgu yerine
// tek sorgu atılır; sonuç her iki hook'un kendi store'una dağıtılır.
const NAVBAR_ROWS_LIMIT = 80;
const ROWS_TTL_MS = 30_000;

type RowsCache = {
  fetchedAt: number;
  promise: Promise<DashboardNotification[]> | null;
  rows: DashboardNotification[];
};

const getRowsCaches = (): Map<string, RowsCache> => {
  const g = globalThis as unknown as {
    __ugurhoca_navbar_rows__?: Map<string, RowsCache>;
  };
  if (!g.__ugurhoca_navbar_rows__) {
    g.__ugurhoca_navbar_rows__ = new Map();
  }
  return g.__ugurhoca_navbar_rows__;
};

/**
 * Kullanıcının en yeni bildirimlerini (tüm türler, azalan tarih sırasıyla) döner.
 * Eşzamanlı çağrılar tek istekte birleşir; 30 sn içindeki tekrar çağrılar önbellekten
 * karşılanır. `force` önbelleği atlayıp yeniden çeker.
 */
export const loadNavbarRows = (
  userId: string,
  force = false,
): Promise<DashboardNotification[]> => {
  const caches = getRowsCaches();
  let cache = caches.get(userId);
  if (!cache) {
    cache = { fetchedAt: 0, promise: null, rows: [] };
    caches.set(userId, cache);
  }

  if (cache.promise) {
    return cache.promise;
  }
  if (!force && Date.now() - cache.fetchedAt <= ROWS_TTL_MS) {
    return Promise.resolve(cache.rows);
  }

  const entry = cache;
  entry.promise = (async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(NAVBAR_ROWS_LIMIT);

      entry.rows = (data ?? []) as DashboardNotification[];
      entry.fetchedAt = Date.now();
      return entry.rows;
    } finally {
      entry.promise = null;
    }
  })();

  return entry.promise;
};
