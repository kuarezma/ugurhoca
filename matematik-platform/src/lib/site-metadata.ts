import type { Metadata } from 'next';

export const SITE_URL = 'https://ugurhoca.com';
export const SITE_NAME = 'Uğur Hoca Matematik';

const defaultOgImage = `${SITE_URL}/icon-512.png`;

export function buildCanonicalUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = buildCanonicalUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? {
          follow: false,
          googleBot: {
            follow: false,
            index: false,
          },
          index: false,
        }
      : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'tr_TR',
      type: 'website',
      images: [
        {
          url: defaultOgImage,
          width: 512,
          height: 512,
          alt: 'Uğur Hoca Matematik',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [defaultOgImage],
    },
  };
}
