import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import { AUTH_ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth-snapshot';

const buildRequest = (path: string, cookieValue?: string) => {
  const request = new NextRequest(new URL(path, 'https://ugurhoca.com'));
  if (cookieValue) {
    request.cookies.set(AUTH_ACCESS_TOKEN_COOKIE_NAME, cookieValue);
  }
  return request;
};

describe('middleware', () => {
  it('oturum çerezi yoksa korunan bir rotayı /giris\'e yönlendirir', () => {
    const response = middleware(buildRequest('/profil'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://ugurhoca.com/giris');
  });

  it('oturum çerezi varsa korunan rotayı olduğu gibi geçirir', () => {
    const response = middleware(buildRequest('/profil', 'a-valid-looking-token'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('admin rotasını da aynı şekilde korur', () => {
    const response = middleware(buildRequest('/admin'));

    expect(response.headers.get('location')).toBe('https://ugurhoca.com/giris');
  });

  it('anonim ziyaretçiye tüm eski bekleme-odası rotalarında yönlendirme uygular', () => {
    for (const path of ['/testler', '/oyunlar', '/meydan-okuma', '/odak-pomodoro', '/odevler', '/ilerleme', '/canli-ders']) {
      const response = middleware(buildRequest(path));
      expect(response.headers.get('location')).toBe('https://ugurhoca.com/giris');
    }
  });
});
