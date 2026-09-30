import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import {
  createCachedPublicSupabaseClient,
  createServerSupabaseClient,
} from './server';

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/env.server', () => ({
  getSupabasePublicEnv: () => ({
    url: 'https://example.test',
    anonKey: 'public-key',
  }),
}));

describe('server Supabase caching', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('herkese açık GET ve HEAD sorgularını 60 saniye aynı etiketle önbellekler', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal('fetch', fetchMock);
    createCachedPublicSupabaseClient('content-documents');
    const options = vi.mocked(createClient).mock.calls[0][2]!;
    expect(options.auth?.persistSession).toBe(false);
    expect(options.global?.headers).toBeUndefined();
    for (const method of ['GET', 'HEAD']) {
      await options.global!.fetch!('https://example.test/rest/v1/documents', {
        method,
        headers: { apikey: 'public-key' },
      });
      expect(fetchMock).toHaveBeenLastCalledWith(
        'https://example.test/rest/v1/documents',
        {
          method,
          headers: { apikey: 'public-key' },
          next: { revalidate: 60, tags: ['content-documents'] },
        },
      );
    }
  });

  it('kişisel sunucu istemcisine önbellek eklemez', () => {
    createServerSupabaseClient('user-token');
    const options = vi.mocked(createClient).mock.calls[0][2]!;
    expect(options.global?.headers).toEqual({
      Authorization: 'Bearer user-token',
    });
    expect(options.global?.fetch).toBeUndefined();
  });
});
