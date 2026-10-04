import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { trackRecoverySession } from '@/lib/auth-recovery';

/**
 * supabase-js'in oturumu tuttuğu localStorage anahtarı. Değer SDK varsayılanıyla
 * aynıdır (`sb-<proje-ref>-auth-token`), böylece mevcut oturumlar korunur; burada
 * açıkça yapılandırılır ki SDK atlanarak yerel oturum silinmesi gerektiğinde
 * (bkz. auth-client signOutClient) aynı anahtar kullanılsın.
 */
export const getSupabaseAuthStorageKey = (
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
) => {
  if (!supabaseUrl) {
    return null;
  }

  try {
    return `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  } catch {
    return null;
  }
};

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

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { storageKey: getSupabaseAuthStorageKey(supabaseUrl) ?? undefined },
  }) as SupabaseClient;

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
