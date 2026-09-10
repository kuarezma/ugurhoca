import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/profil',
        '/odevler',
        '/ilerleme',
        '/canli-ders',
        '/testler',
        '/oyunlar',
        '/meydan-okuma',
        '/odak-pomodoro',
        '/giris',
        '/kayit',
        '/sifremi-unuttum',
        '/sifre-sifirla',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
