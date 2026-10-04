import { NextResponse, type NextRequest } from 'next/server';
import { safeRedirectPath } from '@/lib/safe-redirect-path';
import { AUTH_ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth-snapshot';

/**
 * Bu rotalar oturum gerektirir. Buraya kadar hiçbiri sunucu tarafında
 * korunmuyordu — anonim bir ziyaretçi (veya bot) tüm sayfa paketini indirir,
 * bazı durumlarda sunucu verisi de çekilir, JavaScript çalışır ve ANCAK
 * ONDAN SONRA istemci tarafında /giris'e yönlendirilirdi. /profil, /odevler
 * ve /ilerleme'de bu yönlendirme hiç yoktu — anonim ziyaretçi boş bir sayfa
 * görürdü (bkz. ProfilePage.tsx: `if (!user) return null;`).
 *
 * Burada yalnızca ÇEREZ VARLIĞI kontrol edilir (imzalı/doğrulanmış bir JWT
 * değil) — Edge middleware'de her istekte Supabase'e gerçek bir doğrulama
 * isteği atmak gereksiz gecikme ekler. Bu, yeni bir yetki sınırı DEĞİL,
 * mevcut istemci tarafı `getClientSession()` kontrolüyle (o da yalnızca
 * yerel oturum varlığına bakar) aynı güven seviyesindeki bir kısayoldur.
 * Gerçek yetkilendirme her zaman olduğu gibi RLS + `getVerifiedServerUser`
 * ile sunucu/veritabanı katmanında yapılır; bu middleware yalnızca anonim
 * ziyaretçiye gereksiz paket/veri göndermeyi önler.
 */
// `config.matcher` zaten hangi rotalarda çalışacağını sınırlar; bu fonksiyon
// yalnızca eşleşen istekler için çağrılır. İkisini senkron tutun.
export function proxy(request: NextRequest) {
  if (/%5c|\\/i.test(request.nextUrl.pathname)) {
    // Bozuk yolu yönlendirmeden normal 404 sayfasına taşı; sayfa çözümleyicisine ulaşmasın.
    return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
  }

  const hasSession = Boolean(
    request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE_NAME)?.value,
  );

  if (!hasSession) {
    const redirectUrl = new URL('/giris', request.url);
    const target = safeRedirectPath(request.nextUrl.pathname + request.nextUrl.search);
    if (target && target !== '/' && target !== '/giris') {
      redirectUrl.searchParams.set('redirect', target);
    }
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/(.*(?:%5[Cc]|\\\\).*)',
    '/profil/:path*',
    '/odevler/:path*',
    '/ilerleme/:path*',
    '/canli-ders/:path*',
    '/testler/:path*',
    '/oyunlar/:path*',
    '/meydan-okuma/:path*',
    '/odak-pomodoro/:path*',
    '/admin/:path*',
  ],
};
