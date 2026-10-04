import 'server-only';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

let missingConfigWarned = false;

/** Upstash Redis yapılandırılmış mı? Health-check / admin teşhis için. */
export function isRateLimitConfigured(): boolean {
  return redis !== null;
}

function warnIfUnconfigured() {
  if (redis || missingConfigWarned) {
    return;
  }
  missingConfigWarned = true;
  if (process.env.NODE_ENV === 'production') {
    logger.warn(
      '[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN tanımsız: API rate limiting bellek-içi yedek sınırlayıcıya geçti. ' +
        'Kötüye kullanıma karşı koruma aktif ancak süreçler arası paylaşılmaz — https://console.upstash.com adresinden ücretsiz Redis oluşturup env ekleyin.',
    );
  }
}

const limiters = new Map<string, Ratelimit>();

function getLimiter(
  name: string,
  limit: number,
  windowSeconds: number,
): Ratelimit | null {
  if (!redis) {
    return null;
  }

  const cacheKey = `${name}:${limit}:${windowSeconds}`;
  const existing = limiters.get(cacheKey);
  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      limit,
      `${windowSeconds} s` as `${number} s`,
    ),
    prefix: `rl:${name}`,
    analytics: false,
  });
  limiters.set(cacheKey, limiter);
  return limiter;
}

// Vercel arkasında istemci IP'si x-forwarded-for'un ilk girdisidir.
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

type RateLimitOptions = { limit: number; windowSeconds: number };

interface MemoryRateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryRateLimitEntry>();

/** Bellek sızıntısını önlemek için süresi dolmuş veya aşırı birikmiş kayıtları temizler. */
function cleanupExpiredMemoryEntries(now: number) {
  for (const [key, entry] of memoryStore.entries()) {
    if (now >= entry.resetAt) {
      memoryStore.delete(key);
    }
  }
}

/** Süreç içi bellek-içi sabit pencere sınırlayıcı (Upstash yokluğunda veya hata durumunda) */
function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  now: number = Date.now(),
): { success: boolean; reset: number } {
  // Bellek sızıntısını önleme: mağaza büyüdükçe süresi dolanları temizle
  if (memoryStore.size > 200) {
    cleanupExpiredMemoryEntries(now);
  }

  const entry = memoryStore.get(key);
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowSeconds * 1000;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, reset: resetAt };
  }

  if (entry.count >= limit) {
    return { success: false, reset: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, reset: entry.resetAt };
}

function buildRateLimitResponse(reset: number): NextResponse {
  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
  );
}

/**
 * İstek limiti aşıldıysa hazır 429 yanıtı, aksi halde null döndürür.
 * Production modunda Upstash yoksa veya çalışma anında hata verirse bellek-içi sınırlayıcıya düşer.
 * Geliştirmede Upstash yoksa istekler serbest geçer (null).
 */
export async function enforceRateLimit(
  name: string,
  identifier: string,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  const isProd = process.env.NODE_ENV === 'production';
  const limiter = getLimiter(name, options.limit, options.windowSeconds);

  if (!limiter) {
    warnIfUnconfigured();
    if (!isProd) {
      return null;
    }
    const memoryResult = checkMemoryRateLimit(
      `${name}:${identifier}`,
      options.limit,
      options.windowSeconds,
    );
    if (!memoryResult.success) {
      return buildRateLimitResponse(memoryResult.reset);
    }
    return null;
  }

  try {
    const { success, reset } = await limiter.limit(identifier);
    if (!success) {
      return buildRateLimitResponse(reset);
    }
    return null;
  } catch (error) {
    logger.warn(
      '[rate-limit] Upstash çağrısı başarısız oldu, bellek-içi sınırlayıcıya geçiliyor',
      { error, name, identifier },
    );
    const memoryResult = checkMemoryRateLimit(
      `${name}:${identifier}`,
      options.limit,
      options.windowSeconds,
    );
    if (!memoryResult.success) {
      return buildRateLimitResponse(memoryResult.reset);
    }
    return null;
  }
}
