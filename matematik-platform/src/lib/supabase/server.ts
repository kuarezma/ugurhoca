import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicEnv, getSupabaseServiceEnv } from '@/lib/env.server';

type LooseSupabaseClient = SupabaseClient;

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
  createServerSupabaseClient(undefined, (input, init) =>
    fetch(input, {
      ...init,
      next: { revalidate: 60, tags: [tag] },
    }),
  );

export const createServiceRoleClient = (): LooseSupabaseClient => {
  const { url, serviceRoleKey } = getSupabaseServiceEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as LooseSupabaseClient;
};
