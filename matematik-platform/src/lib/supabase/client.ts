import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient:
  | SupabaseClient
  | undefined;

const missingPublicEnvMessage =
  'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.';

// Public pages (and CI) render without Supabase. Production still fails loud.
// In development, a no-op client keeps the shell interactive instead of
// crashing the root error boundary on the first auth listener.
const createUnavailableSupabaseClient = (): SupabaseClient => {
  const subscription = { unsubscribe() {} };
  const emptyAuthResult = { data: { session: null, user: null }, error: null };

  const builder = (): unknown => {
    const chain: unknown = new Proxy(() => chain, {
      apply: () => chain,
      get: (_target, prop) => {
        if (prop === 'then') {
          return (
            resolve: (value: { data: null; error: null; count: null }) => void,
          ) => resolve({ data: null, error: null, count: null });
        }
        return () => chain;
      },
    });
    return chain;
  };

  return {
    auth: {
      getSession: async () => emptyAuthResult,
      getUser: async () => emptyAuthResult,
      onAuthStateChange: () => ({ data: { subscription } }),
      signInWithPassword: async () => ({
        data: { session: null, user: null },
        error: { message: missingPublicEnvMessage },
      }),
      signOut: async () => ({ error: null }),
      signUp: async () => ({
        data: { session: null, user: null },
        error: { message: missingPublicEnvMessage },
      }),
    },
    channel: builder,
    from: builder,
    removeChannel: async () => 'ok',
    storage: { from: builder },
  } as unknown as SupabaseClient;
};

const createBrowserSupabaseClient = () => {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(missingPublicEnvMessage);
    }

    browserClient = createUnavailableSupabaseClient();
    return browserClient;
  }

  browserClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
  ) as SupabaseClient;

  return browserClient;
};

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = createBrowserSupabaseClient();
    const value = client[property as keyof SupabaseClient];

    return typeof value === 'function' ? value.bind(client) : value;
  },
});
