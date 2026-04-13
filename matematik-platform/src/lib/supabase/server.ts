import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicEnv, getSupabaseServiceEnv } from '@/lib/env.server';

type LooseSupabaseClient = SupabaseClient;

export const createServerSupabaseClient = (
  accessToken?: string,
): LooseSupabaseClient => {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  }) as LooseSupabaseClient;
};

export const createServiceRoleClient = (): LooseSupabaseClient => {
  const { url, serviceRoleKey } = getSupabaseServiceEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as LooseSupabaseClient;
};
