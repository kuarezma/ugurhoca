import type { Metadata } from 'next';

// Vercel preview/özel domain için override edilebilir; boşsa prod domain.
// NEXT_PUBLIC_ prefix zorunlu: ToolsHubContainer gibi istemci bileşenleri de
// bu sabiti kullanır.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://ugurhoca.com';
export const SITE_NAME = 'Uğur Hoca Matematik';

// 1200x630 sosyal önizleme: src/app/opengraph-image.tsx (edge ImageResponse).
// Eskiden /icon-512.png kullanılıyordu — summary_large_image kartlarda küçük
// ve özensiz görünüyordu.
const defaultOgImage = `${SITE_URL}/opengraph-image`;

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
          width: 1200,
          height: 630,
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
