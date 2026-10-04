import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { trackRecoverySession } from '@/lib/auth-recovery';

let browserClient:
  | SupabaseClient
  | undefined;

const createBrowserSupabaseClient = () => {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.',
    );
  }

  browserClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
  ) as SupabaseClient;

  // Sayfa mount olmadan gelen recovery olayını da yakala (SDK hash'i temizler).
  browserClient.auth.onAuthStateChange(trackRecoverySession);
  return browserClient;
};

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = createBrowserSupabaseClient();
    const value = client[property as keyof SupabaseClient];

    return typeof value === 'function' ? value.bind(client) : value;
  },
});
