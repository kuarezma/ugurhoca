import 'server-only';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

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
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s` as `${number} s`),
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

/**
 * İstek limiti aşıldıysa hazır 429 yanıtı, aksi halde null döndürür.
 * Upstash env (UPSTASH_REDIS_REST_URL/TOKEN) tanımlı değilse limiter devre dışı
 * kalır ve null döner (graceful degradation) — Upstash kurulmadan prod kırılmaz.
 */
export async function enforceRateLimit(
  name: string,
  identifier: string,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  const limiter = getLimiter(name, options.limit, options.windowSeconds);
  if (!limiter) {
    return null;
  }

  const { success, reset } = await limiter.limit(identifier);
  if (success) {
    return null;
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
  );
}
