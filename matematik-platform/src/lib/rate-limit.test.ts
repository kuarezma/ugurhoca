import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('rate-limit module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('development modunda Upstash yokken istek sınırsız geçer (null döner)', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('NODE_ENV', 'development');

    vi.resetModules();
    const { enforceRateLimit } = await import('./rate-limit');

    for (let i = 0; i < 10; i++) {
      const res = await enforceRateLimit('test-dev', 'user-1', {
        limit: 3,
        windowSeconds: 60,
      });
      expect(res).toBeNull();
    }
  });

  it('production modunda Upstash yoksa bellek-içi sınırlayıcı devreye girer ve limiti aşınca 429 döner', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('NODE_ENV', 'production');

    vi.resetModules();
    const { enforceRateLimit } = await import('./rate-limit');

    // limit: 2, window: 60s
    const res1 = await enforceRateLimit('test-prod-no-upstash', 'user-prod-1', {
      limit: 2,
      windowSeconds: 60,
    });
    expect(res1).toBeNull();

    const res2 = await enforceRateLimit('test-prod-no-upstash', 'user-prod-1', {
      limit: 2,
      windowSeconds: 60,
    });
    expect(res2).toBeNull();

    // 3. istek limiti aşar
    const res3 = await enforceRateLimit('test-prod-no-upstash', 'user-prod-1', {
      limit: 2,
      windowSeconds: 60,
    });
    expect(res3).not.toBeNull();
    expect(res3?.status).toBe(429);
    expect(res3?.headers.get('Retry-After')).toBeTruthy();
    const body = await res3?.json();
    expect(body.error).toMatch(/Çok fazla istek/);

    // Başka bir kullanıcı etkilenmemeli
    const resOther = await enforceRateLimit('test-prod-no-upstash', 'user-prod-2', {
      limit: 2,
      windowSeconds: 60,
    });
    expect(resOther).toBeNull();
  });

  it('bellek-içi sınırlayıcıda pencere süresi dolunca sayaç sıfırlanır', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('NODE_ENV', 'production');

    vi.resetModules();
    vi.useFakeTimers();

    const { enforceRateLimit } = await import('./rate-limit');

    // 1 saniyelik pencere, limit 1
    const res1 = await enforceRateLimit('test-expiry', 'user-exp', {
      limit: 1,
      windowSeconds: 1,
    });
    expect(res1).toBeNull();

    // Limit doldu
    const res2 = await enforceRateLimit('test-expiry', 'user-exp', {
      limit: 1,
      windowSeconds: 1,
    });
    expect(res2?.status).toBe(429);

    // 1.5 saniye ileri al
    vi.advanceTimersByTime(1500);

    // Yeni pencerede istek kabul edilmeli
    const res3 = await enforceRateLimit('test-expiry', 'user-exp', {
      limit: 1,
      windowSeconds: 1,
    });
    expect(res3).toBeNull();

    vi.useRealTimers();
  });

  it('Upstash çalışma anında hata verirse bellek-içi sınırlayıcıya düşer ve logger.warn ile kaydeder', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake-redis.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');
    vi.stubEnv('NODE_ENV', 'production');

    vi.resetModules();

    // Ratelimit constructor mock
    const mockLimit = vi.fn().mockRejectedValue(new Error('Redis connection timeout'));
    vi.doMock('@upstash/ratelimit', () => {
      class MockRatelimit {
        limit = mockLimit;
        static slidingWindow = vi.fn();
      }
      return { Ratelimit: MockRatelimit };
    });

    const { logger } = await import('@/lib/logger');
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    const { enforceRateLimit } = await import('./rate-limit');

    // 1. istek: Upstash hata verecek -> logger.warn çağrılacak -> bellek-içi fallback (1/2 kabul)
    const res1 = await enforceRateLimit('test-upstash-err', 'user-err-1', {
      limit: 2,
      windowSeconds: 60,
    });
    expect(res1).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Upstash çağrısı başarısız'),
      expect.objectContaining({ name: 'test-upstash-err', identifier: 'user-err-1' }),
    );

    // 2. istek: kabul
    const res2 = await enforceRateLimit('test-upstash-err', 'user-err-1', {
      limit: 2,
      windowSeconds: 60,
    });
    expect(res2).toBeNull();

    // 3. istek: reddedilir (429)
    const res3 = await enforceRateLimit('test-upstash-err', 'user-err-1', {
      limit: 2,
      windowSeconds: 60,
    });
    expect(res3).not.toBeNull();
    expect(res3?.status).toBe(429);
  });
});
