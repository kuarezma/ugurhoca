import { MetadataRoute } from 'next';

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
        '/giris',
        '/kayit',
      ],
    },
    sitemap: 'https://ugurhoca.com/sitemap.xml',
  };
}
