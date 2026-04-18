import type { Metadata } from 'next';

export const SITE_URL = 'https://ugurhoca.com';

const defaultOgImage = `${SITE_URL}/icon-512.png`;

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
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Uğur Hoca Matematik',
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
    },
  };
}
