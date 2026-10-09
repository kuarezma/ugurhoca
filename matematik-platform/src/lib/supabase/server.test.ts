import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import {
  createCachedPublicSupabaseClient,
  createServerSupabaseClient,
  createServiceRoleClient,
} from './server';

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/env.server', () => ({
  getSupabasePublicEnv: () => ({
    url: 'https://example.test',
    anonKey: 'public-key',
  }),
  getSupabaseServiceEnv: () => ({
    url: 'https://example.test',
    serviceRoleKey: 'service-key',
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
          signal: expect.any(AbortSignal),
          next: { revalidate: 60, tags: ['content-documents'] },
        },
      );
    }
  });

  it('yanıtsız public sorguyu 10 saniye sonra iptal eder', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const timeout = vi
      .spyOn(AbortSignal, 'timeout')
      .mockImplementation((ms) => {
        setTimeout(
          () => controller.abort(new DOMException('Timed out', 'TimeoutError')),
          ms,
        );
        return controller.signal;
      });
    const fetchMock = vi.fn(
      (_input: unknown, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(init.signal?.reason),
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    try {
      createCachedPublicSupabaseClient('home-announcements');
      const fetcher = vi.mocked(createClient).mock.calls[0][2]!.global!.fetch!;
      const request = fetcher('https://example.test/rest/v1/announcements');
      const rejection = expect(request).rejects.toMatchObject({
        name: 'AbortError',
      });
      await vi.advanceTimersByTimeAsync(10_000);
      await rejection;
      expect(timeout).toHaveBeenCalledWith(10_000);
    } finally {
      timeout.mockRestore();
      vi.useRealTimers();
    }
  });

  it('gerçek PostgREST istemcisi zaman aşımında sorguyu yeniden denemez', async () => {
    const actual = await vi.importActual<
      typeof import('@supabase/supabase-js')
    >('@supabase/supabase-js');
    vi.mocked(createClient).mockImplementationOnce(actual.createClient);
    vi.useFakeTimers();
    const controller = new AbortController();
    const timeout = vi
      .spyOn(AbortSignal, 'timeout')
      .mockImplementation((ms) => {
        setTimeout(
          () => controller.abort(new DOMException('Timed out', 'TimeoutError')),
          ms,
        );
        return controller.signal;
      });
    const fetchMock = vi.fn(
      (_input: unknown, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(init.signal?.reason),
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    try {
      const client = createCachedPublicSupabaseClient('home-announcements');
      const request = Promise.resolve(
        client.from('announcements').select('*').limit(4),
      );
      await vi.advanceTimersByTimeAsync(10_000);
      const response = await request;
      expect(response.error?.message).toContain('AbortError');
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      timeout.mockRestore();
      vi.useRealTimers();
    }
  });

  it('isteği yapanın iptal sinyalini korur', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal('fetch', fetchMock);
    createCachedPublicSupabaseClient('content-documents');
    const fetcher = vi.mocked(createClient).mock.calls[0][2]!.global!.fetch!;
    await fetcher('https://example.test/rest/v1/documents', {
      signal: controller.signal,
    });
    const combinedSignal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    expect(combinedSignal.aborted).toBe(false);
    controller.abort();
    expect(combinedSignal.aborted).toBe(true);
  });

  it('kişisel sunucu istemcisine önbellek eklemez', () => {
    createServerSupabaseClient('user-token');
    const options = vi.mocked(createClient).mock.calls[0][2]!;
    expect(options.global?.headers).toEqual({
      Authorization: 'Bearer user-token',
    });
    expect(options.global?.fetch).toBeUndefined();
  });

  it('creates service role client with service role key and no session persistence', () => {
    createServiceRoleClient();
    expect(createClient).toHaveBeenLastCalledWith(
      'https://example.test',
      'service-key',
      expect.objectContaining({
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }),
    );
  });
});
