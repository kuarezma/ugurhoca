import { NextRequest } from 'next/server';
import { middleware, config } from '@/middleware';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { AUTH_ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth-snapshot';

const buildRequest = (path: string, cookieValue?: string) => {
  const request = new NextRequest(new URL(path, 'https://ugurhoca.com'));
  if (cookieValue) {
    request.cookies.set(AUTH_ACCESS_TOKEN_COOKIE_NAME, cookieValue);
  }
  return request;
};

describe('middleware', () => {
  it.each(['/icerikler%5C', '/icerikler%5c', '/profil%5C', '/api/example%5C', '/_next/example%5c'])('matcher bozuk %s yolunu kapsar', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true);
  });

  it.each(['/giris', '/icerikler', '/api/example', '/_next/static/example.js', '/icerikler?search=%5C', '/profilim'])('matcher normal açık %s yolunu middleware dışında bırakır', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(false);
  });

  it.each(['/profil', '/profil/ayarlar', '/admin', '/odevler'])('matcher korunan %s yolunu kapsar', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true);
  });

  it.each(['/icerikler%5C', '/icerikler%5c', '/profil%5C', '/api/example%5C', '/_next/example%5c'])('ters eğik çizgi içeren %s yolunu 404 sayfasına taşır', (path) => {
    for (const cookieValue of [undefined, 'a-valid-looking-token']) {
      const response = middleware(buildRequest(path, cookieValue));

      expect(response.status).toBe(404);
      expect(response.headers.get('x-middleware-rewrite')).toBe('https://ugurhoca.com/_not-found');
      expect(response.headers.get('location')).toBeNull();
    }
  });

  it('middleware’e ulaşan ham ters eğik çizgi içeren yolu 404 sayfasına taşır', () => {
    const request = buildRequest('/icerikler');
    // WHATWG URL ham ters eğik çizgiyi normalize eder; middleware dalını doğrudan doğrula.
    Object.defineProperty(request.nextUrl, 'pathname', { value: '/icerikler\\' });

    expect(middleware(request).status).toBe(404);
  });

  it('kodlanmış ters eğik çizgi içeren dönüş hedefini giriş URL’sine eklemez', () => {
    const response = middleware(buildRequest('/profil?search=%5C'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://ugurhoca.com/giris');
  });

  it('oturum çerezi yoksa korunan bir rotayı /giris\'e yönlendirir', () => {
    const response = middleware(buildRequest('/profil'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://ugurhoca.com/giris?redirect=%2Fprofil');
  });

  it('oturum çerezi varsa korunan rotayı olduğu gibi geçirir', () => {
    const response = middleware(buildRequest('/profil', 'a-valid-looking-token'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('admin rotasını da aynı şekilde korur', () => {
    const response = middleware(buildRequest('/admin'));

    expect(response.headers.get('location')).toBe('https://ugurhoca.com/giris?redirect=%2Fadmin');
  });

  it('anonim ziyaretçiye tüm eski bekleme-odası rotalarında yönlendirme uygular', () => {
    for (const path of ['/testler', '/oyunlar', '/meydan-okuma', '/odak-pomodoro', '/odevler', '/ilerleme', '/canli-ders']) {
      const response = middleware(buildRequest(path));
      expect(response.headers.get('location')).toBe(`https://ugurhoca.com/giris?redirect=${encodeURIComponent(path)}`);
    }
  });
});
