import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { buildCanonicalUrl, SITE_URL } from '@/lib/site-metadata';
import { buildDocumentSlug } from '@/lib/document-slug';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: buildCanonicalUrl('/'), changeFrequency: 'weekly', priority: 1 },
    {
      url: buildCanonicalUrl('/icerikler'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/deneme-salonu'),
      changeFrequency: 'weekly',
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
      url: buildCanonicalUrl('/iletisim'),
      changeFrequency: 'monthly',
      priority: 0.7,
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
    {
      url: buildCanonicalUrl('/cerez'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return staticRoutes;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, title, grade, created_at')
      .eq('is_admin_only', false)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error || !Array.isArray(documents)) {
      return staticRoutes;
    }

    const documentRoutes: MetadataRoute.Sitemap = documents.map((doc) => ({
      url: `${SITE_URL}/icerikler/${buildDocumentSlug(doc)}`,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...documentRoutes];
  } catch {
    return staticRoutes;
  }
}
