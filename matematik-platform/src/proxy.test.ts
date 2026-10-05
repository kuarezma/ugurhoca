import { NextRequest } from 'next/server';
import { proxy, config } from '@/proxy';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { AUTH_ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth-snapshot';

const ssr = vi.hoisted(() => ({ createServerClient: vi.fn() }));
vi.mock('@supabase/ssr', () => ({ createServerClient: ssr.createServerClient }));

const buildRequest = (path: string, cookieValue?: string) => {
  const request = new NextRequest(new URL(path, 'https://ugurhoca.com'));
  if (cookieValue) {
    request.cookies.set(AUTH_ACCESS_TOKEN_COOKIE_NAME, cookieValue);
  }
  return request;
};

describe('proxy', () => {
  it.each(['/icerikler%5C', '/icerikler%5c', '/profil%5C', '/api/example%5C', '/_next/example%5c'])('matcher bozuk %s yolunu kapsar', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true);
  });

  it.each(['/giris', '/icerikler', '/api/example', '/_next/static/example.js', '/icerikler?search=%5C', '/profilim'])('matcher normal açık %s yolunu proxy dışında bırakır', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(false);
  });

  it.each(['/profil', '/profil/ayarlar', '/admin', '/odevler'])('matcher korunan %s yolunu kapsar', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true);
  });

  it.each(['/icerikler%5C', '/icerikler%5c', '/profil%5C', '/api/example%5C', '/_next/example%5c'])('ters eğik çizgi içeren %s yolunu 404 sayfasına taşır', async (path) => {
    for (const cookieValue of [undefined, 'a-valid-looking-token']) {
      const response = await proxy(buildRequest(path, cookieValue));

      expect(response.status).toBe(404);
      expect(response.headers.get('x-middleware-rewrite')).toBe('https://ugurhoca.com/_not-found');
      expect(response.headers.get('location')).toBeNull();
    }
  });

  it('proxy’ye ulaşan ham ters eğik çizgi içeren yolu 404 sayfasına taşır', async () => {
    const request = buildRequest('/icerikler');
    // WHATWG URL ham ters eğik çizgiyi normalize eder; proxy dalını doğrudan doğrula.
    Object.defineProperty(request.nextUrl, 'pathname', { value: '/icerikler\\' });

    expect((await proxy(request)).status).toBe(404);
  });

  it('kodlanmış ters eğik çizgi içeren dönüş hedefini giriş URL’sine eklemez', async () => {
    const response = await proxy(buildRequest('/profil?search=%5C'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://ugurhoca.com/giris');
  });

  it('oturum çerezi yoksa korunan bir rotayı /giris\'e yönlendirir', async () => {
    const response = await proxy(buildRequest('/profil'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://ugurhoca.com/giris?redirect=%2Fprofil');
  });

  it('oturum çerezi varsa korunan rotayı olduğu gibi geçirir', async () => {
    const response = await proxy(buildRequest('/profil', 'a-valid-looking-token'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('SSR oturumunu yenileyip yeni çerezi yanıta taşır', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://testref.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-public-key');
    ssr.createServerClient.mockImplementation((_url, _key, options) => ({
      auth: {
        getUser: async () => {
          options.cookies.setAll([{
            name: 'sb-testref-auth-token',
            value: 'renewed',
            options: { path: '/', sameSite: 'lax' },
          }]);
          return { data: { user: { id: 'student-1' } }, error: null };
        },
      },
    }));
    try {
      const request = buildRequest('/profil');
      request.cookies.set('sb-testref-auth-token', 'expired');
      const response = await proxy(request);
      expect(response.headers.get('location')).toBeNull();
      expect(response.cookies.get('sb-testref-auth-token')?.value).toBe('renewed');
      expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('admin rotasını da aynı şekilde korur', async () => {
    const response = await proxy(buildRequest('/admin'));

    expect(response.headers.get('location')).toBe('https://ugurhoca.com/giris?redirect=%2Fadmin');
  });

  it('anonim ziyaretçiye tüm eski bekleme-odası rotalarında yönlendirme uygular', async () => {
    for (const path of ['/testler', '/oyunlar', '/meydan-okuma', '/odak-pomodoro', '/odevler', '/ilerleme', '/canli-ders']) {
      const response = await proxy(buildRequest(path));
      expect(response.headers.get('location')).toBe(`https://ugurhoca.com/giris?redirect=${encodeURIComponent(path)}`);
    }
  });
});
