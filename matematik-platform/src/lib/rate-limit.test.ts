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
    const resOther = await enforceRateLimit(
      'test-prod-no-upstash',
      'user-prod-2',
      {
        limit: 2,
        windowSeconds: 60,
      },
    );
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
    const mockLimit = vi
      .fn()
      .mockRejectedValue(new Error('Redis connection timeout'));
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
      expect.objectContaining({
        name: 'test-upstash-err',
        identifier: 'user-err-1',
      }),
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

  it('production modunda Upstash yokken failClosed: true ise 503 vermeden bellek-içi sınırlayıcıya geçer ve limiti aşınca 429 döner', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('NODE_ENV', 'production');

    vi.resetModules();

    const { logger } = await import('@/lib/logger');
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    const { enforceRateLimit } = await import('./rate-limit');

    const res1 = await enforceRateLimit('test-failclosed', 'ip-1', {
      limit: 1,
      windowSeconds: 60,
      failClosed: true,
    });

    expect(res1).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Hassas rota için Upstash yapılandırılmamış; servis kesintisini (503) önlemek için bellek-içi sınırlayıcıya geçildi',
      ),
      expect.objectContaining({ name: 'test-failclosed' }),
    );

    const res2 = await enforceRateLimit('test-failclosed', 'ip-1', {
      limit: 1,
      windowSeconds: 60,
      failClosed: true,
    });
    expect(res2?.status).toBe(429);
  });

  it('development modunda Upstash yokken failClosed: true olsa bile null döner (serbest geçer)', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('NODE_ENV', 'development');

    vi.resetModules();
    const { enforceRateLimit } = await import('./rate-limit');

    const res = await enforceRateLimit('test-dev-failclosed', 'ip-1', {
      limit: 5,
      windowSeconds: 60,
      failClosed: true,
    });
    expect(res).toBeNull();
  });

  it('production modunda Upstash yapılandırılmış ama limit çağrısı hata verirse failClosed: true olsa bile 503 değil bellek yedeği çalışır', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake-redis.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');
    vi.stubEnv('NODE_ENV', 'production');

    vi.resetModules();

    const mockLimit = vi
      .fn()
      .mockRejectedValue(new Error('Redis connection timeout'));
    vi.doMock('@upstash/ratelimit', () => {
      class MockRatelimit {
        limit = mockLimit;
        static slidingWindow = vi.fn();
      }
      return { Ratelimit: MockRatelimit };
    });

    const { logger } = await import('@/lib/logger');
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    const { enforceRateLimit } = await import('./rate-limit');

    // failClosed: true verildiğinde bile Upstash geçici hatasında 503 dönmemeli, bellek yedeği devreye girmeli!
    const res1 = await enforceRateLimit('test-upstash-err-failclosed', 'ip-1', {
      limit: 1,
      windowSeconds: 60,
      failClosed: true,
    });
    expect(res1).toBeNull(); // 1. istek bellek sınırlayıcısından geçer
    expect(errorSpy).not.toHaveBeenCalled();

    // 2. istek bellek sınırlayıcısında limiti aşınca 429 döner (503 DEĞİL!)
    const res2 = await enforceRateLimit('test-upstash-err-failclosed', 'ip-1', {
      limit: 1,
      windowSeconds: 60,
      failClosed: true,
    });
    expect(res2?.status).toBe(429);
  });

  it('Upstash limit çağrısı reason: "timeout" döndürdüğünde bellek-içi sınırlayıcıya geçer ve limiti aşınca 429 döner', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake-redis.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');
    vi.stubEnv('NODE_ENV', 'production');

    vi.resetModules();

    const mockLimit = vi.fn().mockResolvedValue({
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      reason: 'timeout',
    });
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

    // limit: 1 iken ilk çağrı bellek içi sınırlayıcıdan geçer (null)
    const res1 = await enforceRateLimit(
      'test-upstash-timeout',
      'user-timeout-1',
      {
        limit: 1,
        windowSeconds: 60,
      },
    );
    expect(res1).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('timeout'),
      expect.objectContaining({
        name: 'test-upstash-timeout',
        identifier: 'user-timeout-1',
      }),
    );

    // 2. çağrı bellek-içi sayacı 1 olduğu için limiti aşar ve 429 döner
    const res2 = await enforceRateLimit(
      'test-upstash-timeout',
      'user-timeout-1',
      {
        limit: 1,
        windowSeconds: 60,
      },
    );
    expect(res2).not.toBeNull();
    expect(res2?.status).toBe(429);
  });
});
