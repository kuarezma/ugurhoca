import { NextResponse } from 'next/server';
import { isRateLimitConfigured } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Uptime izleyicileri için hafif uç: veritabanına dokunmaz, yalnız fonksiyonun ayakta olduğunu söyler.
export function GET() {
  const isProd = process.env.NODE_ENV === 'production';
  const rateLimitStatus = isProd && !isRateLimitConfigured() ? 'degraded' : 'ok';
  const status = rateLimitStatus === 'ok' ? 'ok' : 'degraded';

  return NextResponse.json(
    { status, checks: { rateLimit: rateLimitStatus } },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
