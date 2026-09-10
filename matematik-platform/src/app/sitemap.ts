import { MetadataRoute } from 'next';
import { buildCanonicalUrl } from '@/lib/site-metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  // NOT: lastModified bilerek YOK. Eskiden her girdiye `new Date()` yazılıyordu:
  // her build tüm URL'leri "az önce değişti" gösteriyordu, arama motoru için
  // gürültü. lastModified opsiyoneldir; gerçek değişiklik tarihi üreten bir
  // boru hattı kurulana kadar (örn. git log / CMS mtime) boş bırakılır.
  return [
    { url: buildCanonicalUrl('/'), changeFrequency: 'weekly', priority: 1 },
    // /testler, /oyunlar, /meydan-okuma, /odak-pomodoro buradan çıkarıldı:
    // hepsi oturum gerektiriyor ve artık middleware anonim ziyaretçiyi
    // /giris'e yönlendiriyor (bkz. src/middleware.ts). Bir sitemap girdisi
    // yönlendiren bir URL'yi işaret edemez — sayfa meta verisinde de
    // `noIndex: true` var (bkz. ilgili page.tsx dosyaları).
    {
      url: buildCanonicalUrl('/icerikler'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/programlar'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/programlar/lgs'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/programlar/yks'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/araclar'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/araclar/lgs-puan-hesaplama'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/araclar/yks-puan-hesaplama'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/araclar/ebob-ekok-hesaplayici'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/araclar/pisagor-hesaplayici'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/cikis-bileti'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/gizlilik'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: buildCanonicalUrl('/kvkk'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
