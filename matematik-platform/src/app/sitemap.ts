import { MetadataRoute } from 'next';
import { buildCanonicalUrl } from '@/lib/site-metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: buildCanonicalUrl('/'), lastModified, changeFrequency: 'weekly', priority: 1 },
    {
      url: buildCanonicalUrl('/testler'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/oyunlar'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/icerikler'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/programlar'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/programlar/lgs'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/programlar/yks'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/araclar'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/araclar/lgs-puan-hesaplama'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/araclar/yks-puan-hesaplama'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/araclar/ebob-ekok-hesaplayici'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/araclar/pisagor-hesaplayici'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/gizlilik'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: buildCanonicalUrl('/kvkk'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
