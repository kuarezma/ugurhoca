import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { getSupabaseAuthStorageKey } from '@/lib/supabase/client';

describe('getSupabaseAuthStorageKey', () => {
  it('matches the key supabase-js uses by default so existing sessions survive', () => {
    const url = 'https://abcdefghijklmnop.supabase.co';
    const client = createClient(url, 'anon-key', {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    expect(getSupabaseAuthStorageKey(url)).toBe(
      (client.auth as unknown as { storageKey: string }).storageKey,
    );
    expect(getSupabaseAuthStorageKey(url)).toBe('sb-abcdefghijklmnop-auth-token');
  });

  it('returns null without a usable URL', () => {
    expect(getSupabaseAuthStorageKey('')).toBeNull();
    expect(getSupabaseAuthStorageKey('not a url')).toBeNull();
  });
});
