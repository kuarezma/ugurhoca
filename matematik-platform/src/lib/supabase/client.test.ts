import { beforeEach, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  setSession: vi.fn(),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ auth })),
}));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://testref.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-public-key');
  localStorage.clear();
  vi.clearAllMocks();
});

it('eski localStorage oturumunu SSR çerez istemcisine taşır ve eski tokenı siler', async () => {
  const legacy = { access_token: 'access-1', refresh_token: 'refresh-1' };
  localStorage.setItem('sb-testref-auth-token', JSON.stringify(legacy));
  auth.getSession.mockResolvedValue({ data: { session: null } });
  auth.setSession.mockResolvedValue({ data: { session: legacy }, error: null });

  const { migrateLegacySupabaseSession } = await import('./client');
  await migrateLegacySupabaseSession();

  expect(auth.setSession).toHaveBeenCalledWith(legacy);
  expect(localStorage.getItem('sb-testref-auth-token')).toBeNull();
});

it('eski oturum anahtarı SDK varsayılanıyla aynı kalır', async () => {
  const { getSupabaseAuthStorageKey } = await import('./client');
  const url = 'https://abcdefghijklmnop.supabase.co';
  const client = createClient(url, 'anon-key', {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  expect(getSupabaseAuthStorageKey(url)).toBe(
    (client.auth as unknown as { storageKey: string }).storageKey,
  );
  expect(getSupabaseAuthStorageKey(url)).toBe('sb-abcdefghijklmnop-auth-token');
});

it('kullanılabilir URL yoksa eski oturum anahtarı üretmez', async () => {
  const { getSupabaseAuthStorageKey } = await import('./client');
  expect(getSupabaseAuthStorageKey('')).toBeNull();
  expect(getSupabaseAuthStorageKey('not a url')).toBeNull();
});
