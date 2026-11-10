import type { Metadata } from 'next';

// Vercel preview/özel domain için override edilebilir; boşsa prod domain.
// NEXT_PUBLIC_ prefix zorunlu: ToolsHubContainer gibi istemci bileşenleri de
// bu sabiti kullanır.
function normalizeCanonicalSiteUrl(rawUrl?: string): string {
  const trimmed = rawUrl?.trim().replace(/\/$/, '');
  if (
    !trimmed ||
    trimmed === 'https://ugurhoca.com' ||
    trimmed === 'http://ugurhoca.com'
  ) {
    return 'https://www.ugurhoca.com';
  }
  return trimmed;
}

export const SITE_URL = normalizeCanonicalSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
);
export const SITE_NAME = 'Uğur Hoca Matematik';

// 1200x630 sosyal önizleme görseli (src/app/opengraph-image.png).
// Doğrudan nihai PNG adresini kullanarak sosyal medya botlarında 307 yönlendirmesini önler.
const defaultOgImage = `${SITE_URL}/opengraph-image.png`;

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
  const isHome = path === '/' || path === '';
  const displayTitle =
    isHome && title === 'Ana sayfa'
      ? `${SITE_NAME} | 5, 6, 7, 8. Sınıf & LGS Öğrenme Platformu`
      : title;
  const socialTitle = displayTitle.includes(SITE_NAME)
    ? displayTitle
    : `${displayTitle} | ${SITE_NAME}`;

  return {
    title:
      isHome || displayTitle.includes(SITE_NAME)
        ? { absolute: displayTitle }
        : displayTitle,
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
      title: socialTitle,
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
      title: socialTitle,
      description,
      images: [defaultOgImage],
    },
  };
}
