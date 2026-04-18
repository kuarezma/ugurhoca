import { buildCanonicalUrl, createPageMetadata, SITE_URL } from '@/lib/site-metadata';

describe('site-metadata', () => {
  it('builds canonical urls from relative paths', () => {
    expect(buildCanonicalUrl('/testler')).toBe(`${SITE_URL}/testler`);
    expect(buildCanonicalUrl('programlar')).toBe(`${SITE_URL}/programlar`);
  });

  it('creates indexable page metadata with canonical and social previews', () => {
    const metadata = createPageMetadata({
      title: 'Testler',
      description: 'Konu testleri',
      path: '/testler',
    });
    const twitter = metadata.twitter as {
      card?: string;
      images?: string[];
    };

    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/testler`);
    expect(metadata.openGraph?.url).toBe(`${SITE_URL}/testler`);
    expect(twitter.card).toBe('summary_large_image');
    expect(twitter.images).toContain(`${SITE_URL}/icon-512.png`);
  });

  it('marks noindex pages consistently for robots and googleBot', () => {
    const metadata = createPageMetadata({
      title: 'Giriş',
      description: 'Giriş ekranı',
      path: '/giris',
      noIndex: true,
    });

    expect(metadata.robots).toEqual({
      follow: false,
      googleBot: {
        follow: false,
        index: false,
      },
      index: false,
    });
  });
});
