import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { trackRecoverySession } from '@/lib/auth-recovery';

/** Önceki sürümün localStorage anahtarı; tek seferlik oturum geçişinde kullanılır. */
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

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey) as SupabaseClient;

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

let legacyMigration: Promise<void> | null = null;

/** Eski localStorage oturumunu bir kez SSR çerezlerine taşır. */
export const migrateLegacySupabaseSession = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (legacyMigration) return legacyMigration;

  legacyMigration = (async () => {
    const key = getSupabaseAuthStorageKey();
    if (!key) return;
    let raw: string | null;
    try { raw = localStorage.getItem(key); } catch { return; }
    if (!raw) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      try {
        const legacy = JSON.parse(raw) as { access_token?: unknown; refresh_token?: unknown };
        if (typeof legacy.access_token === 'string' && typeof legacy.refresh_token === 'string') {
          const { error } = await supabase.auth.setSession({
            access_token: legacy.access_token,
            refresh_token: legacy.refresh_token,
          });
          if (error) return;
        } else {
          return;
        }
      } catch { return; }
    }

    try {
      for (const suffix of ['', '-code-verifier', '-user']) localStorage.removeItem(`${key}${suffix}`);
    } catch { /* Çerez oturumu çalışır; eski kayıt daha sonra temizlenebilir. */ }
  })().finally(() => { legacyMigration = null; });
  return legacyMigration;
};
