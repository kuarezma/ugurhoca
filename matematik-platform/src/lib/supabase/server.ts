import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicEnv, getSupabaseServiceEnv } from '@/lib/env.server';

type LooseSupabaseClient = SupabaseClient;

const PUBLIC_QUERY_TIMEOUT_MS = 10_000;

export const createServerSupabaseClient = (
  accessToken?: string,
  fetcher?: typeof fetch,
): LooseSupabaseClient => {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      ...(accessToken
        ? {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        : {}),
      ...(fetcher ? { fetch: fetcher } : {}),
    },
  }) as LooseSupabaseClient;
};

// Yalnızca herkese açık veriler: kullanıcı token'ı bu önbelleğe girmez.
export const createCachedPublicSupabaseClient = (tag: string) =>
  createServerSupabaseClient(undefined, (input, init) => {
    // Ana sayfa ve içerik ISR üretimi, yanıtsız veri kaynağını sınırsız beklemesin.
    const timeoutSignal = AbortSignal.timeout(PUBLIC_QUERY_TIMEOUT_MS);
    const signal = init?.signal
      ? AbortSignal.any([init.signal, timeoutSignal])
      : timeoutSignal;
    return fetch(input, {
      ...init,
      signal,
      next: { revalidate: 60, tags: [tag] },
    }).catch((error: unknown) => {
      // PostgREST TimeoutError'i ağ hatası sayıp yeniden dener; AbortError'i denemez.
      if (signal.aborted) {
        throw new DOMException('Public query timed out', 'AbortError');
      }
      throw error;
    });
  });

export const createServiceRoleClient = (): LooseSupabaseClient => {
  const { url, serviceRoleKey } = getSupabaseServiceEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as LooseSupabaseClient;
};
