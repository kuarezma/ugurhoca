import { NextResponse, type NextRequest } from 'next/server';
import { safeRedirectPath } from '@/lib/safe-redirect-path';
import { AUTH_ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth-snapshot';
import { createServerClient } from '@supabase/ssr';
import { hasSupabaseSessionCookie } from '@/lib/supabase/session-cookie';

/**
 * Bu rotalar oturum gerektirir. Buraya kadar hiçbiri sunucu tarafında
 * korunmuyordu — anonim bir ziyaretçi (veya bot) tüm sayfa paketini indirir,
 * bazı durumlarda sunucu verisi de çekilir, JavaScript çalışır ve ANCAK
 * ONDAN SONRA istemci tarafında /giris'e yönlendirilirdi. /profil, /odevler
 * ve /ilerleme'de bu yönlendirme hiç yoktu — anonim ziyaretçi boş bir sayfa
 * görürdü (bkz. ProfilePage.tsx: `if (!user) return null;`).
 *
 * SSR oturumunda Supabase kimliği doğrulanır ve yenilenen çerezler yanıta
 * yazılır. Geçiş süresindeki eski HttpOnly çerez için yalnız varlık kontrolü
 * yapılır. Bu, yeni bir yetki sınırı değildir.
 * Gerçek yetkilendirme her zaman olduğu gibi RLS + `getVerifiedServerUser`
 * ile sunucu/veritabanı katmanında yapılır; proxy yalnızca anonim
 * ziyaretçiye gereksiz paket/veri göndermeyi önler.
 */
// `config.matcher` zaten hangi rotalarda çalışacağını sınırlar; bu fonksiyon
// yalnızca eşleşen istekler için çağrılır. İkisini senkron tutun.
export async function proxy(request: NextRequest) {
  if (/%5c|\\/i.test(request.nextUrl.pathname)) {
    // Bozuk yolu yönlendirmeden normal 404 sayfasına taşı; sayfa çözümleyicisine ulaşmasın.
    return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSsrSession = Boolean(url && hasSupabaseSessionCookie(request.cookies.getAll(), url));
  let response = NextResponse.next();
  let hasSession = Boolean(request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE_NAME)?.value);

  if (hasSsrSession && url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet, headers) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          for (const [name, value] of Object.entries(headers ?? {})) response.headers.set(name, value);
          response.headers.set('Cache-Control', 'private, no-store');
        },
      },
    });
    try {
      // getClaims asimetrik anahtarlarda JWT'yi yerelde doğrular (JWKS önbellekli);
      // getUser her gezinmede Supabase'e ağ turu atardı. Simetrik anahtarda
      // kendiliğinden getUser davranışına düşer.
      const { data, error } = await supabase.auth.getClaims();
      hasSession = !error && Boolean(data?.claims?.sub);
    } catch {
      hasSession = false;
    }
  }

  if (!hasSession) {
    const redirectUrl = new URL('/giris', request.url);
    const target = safeRedirectPath(request.nextUrl.pathname + request.nextUrl.search);
    if (target && target !== '/' && target !== '/giris') {
      redirectUrl.searchParams.set('redirect', target);
    }
    const redirect = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach(({ name, value }) => redirect.cookies.set(name, value, response.cookies.get(name)));
    if (response.headers.has('Cache-Control')) redirect.headers.set('Cache-Control', response.headers.get('Cache-Control')!);
    return redirect;
  }

  return response;
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
