import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('üretimde Upstash yokken degraded döner ve HTTP 200 kalır', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');

    vi.resetModules();
    const { GET } = await import('./route');

    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      status: 'degraded',
      checks: { rateLimit: 'degraded' },
    });
  });

  it('üretimde Upstash yapılandırılmışsa ok döner', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake-redis.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');

    vi.resetModules();
    const { GET } = await import('./route');

    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      status: 'ok',
      checks: { rateLimit: 'ok' },
    });
  });

  it('geliştirme modunda Upstash olmasa bile ok döner', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');

    vi.resetModules();
    const { GET } = await import('./route');

    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      status: 'ok',
      checks: { rateLimit: 'ok' },
    });
  });
});
