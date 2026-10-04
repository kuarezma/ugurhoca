import { NextResponse } from 'next/server';
import { AUTH_ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth-snapshot';
import { createLogger } from '@/lib/logger';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const log = createLogger('api:auth:session');

export const runtime = 'nodejs';

/**
 * Erişim token'ını yalnızca HttpOnly çerezde tutar; istemci JS'i bu çerezi
 * okuyamaz ve yazamaz. Proxy (src/proxy.ts) ve sunucu doğrulaması
 * (getServerAccessToken) çerezi aynı adla okumaya devam eder.
 *
 * Geriye dönük uyum: önceki sürüm aynı adlı çerezi document.cookie ile
 * (HttpOnly olmadan) yazıyordu. Çerez kimliği ad + alan + yol olduğundan, bu
 * rotanın ilk başarılı POST'u eski çerezin üzerine HttpOnly olarak yazar; o
 * zamana kadar eski çerez sunucuda aynı adla okunmaya devam eder.
 */

// Önceki istemci çereziyle aynı ömür: süresi dolmuş token ile dönen kullanıcı
// proxy'den geçer, istemci oturumu yenileyince TOKEN_REFRESHED yeni token'ı yazar.
const ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
// Tarayıcılar ~4096 bayttan büyük çerezi sessizce düşürür.
const MAX_ACCESS_TOKEN_LENGTH = 3800;
// Okul ağlarında bir sınıf tek NAT IP'sini paylaşır; limit yalnız toplu
// token denemesini (Supabase getUser kahini olarak kötüye kullanımı) keser.
const RATE_LIMIT = { limit: 60, windowSeconds: 60 };

const noStore = { 'Cache-Control': 'no-store' };

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
});

/**
 * SameSite=Lax çapraz siteden gelen fetch POST'una çerez göndermez ama bu rota
 * çerezi okumaz, yazar: saldırgan kendi token'ını kurbanın tarayıcısına
 * yazdırabilirdi (login CSRF). Bu yüzden yalnız aynı kaynaktan gelen tarayıcı
 * isteği kabul edilir; Origin başlığı tarayıcıların POST/DELETE'te her zaman
 * gönderdiği başlıktır.
 */
const isSameOriginRequest = (request: Request) => {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') {
    return false;
  }

  const origin = request.headers.get('origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
};

const forbidden = () =>
  NextResponse.json(
    { error: 'İstek kaynağı doğrulanamadı.' },
    { status: 403, headers: noStore },
  );

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return forbidden();
  }

  const rateLimited = await enforceRateLimit(
    'auth-session',
    getClientIp(request),
    RATE_LIMIT,
  );
  if (rateLimited) {
    return rateLimited;
  }

  const body = (await request.json().catch(() => null)) as {
    access_token?: unknown;
  } | null;
  const accessToken = body?.access_token;

  if (
    typeof accessToken !== 'string' ||
    accessToken.length === 0 ||
    accessToken.length > MAX_ACCESS_TOKEN_LENGTH
  ) {
    return NextResponse.json(
      { error: 'Geçersiz istek.' },
      { status: 400, headers: noStore },
    );
  }

  try {
    const supabase = createServerSupabaseClient(accessToken);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user?.id) {
      return NextResponse.json(
        { error: 'Oturum doğrulanamadı.' },
        { status: 401, headers: noStore },
      );
    }
  } catch (error) {
    log.error('Session token verification failed', error);
    return NextResponse.json(
      { error: 'Oturum şu anda doğrulanamıyor.' },
      { status: 503, headers: noStore },
    );
  }

  const response = NextResponse.json({ ok: true }, { headers: noStore });
  response.cookies.set(
    AUTH_ACCESS_TOKEN_COOKIE_NAME,
    accessToken,
    cookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE),
  );
  return response;
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) {
    return forbidden();
  }

  const response = NextResponse.json({ ok: true }, { headers: noStore });
  response.cookies.set(AUTH_ACCESS_TOKEN_COOKIE_NAME, '', cookieOptions(0));
  return response;
}
