import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Uğur Hoca Matematik Platformu',
    short_name: 'Uğur Hoca',
    description:
      'LGS ve YKS için yeni nesil matematik testleri, canlı dersler, formül laboratuvarı ve etkileşimli araçlar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#4f46e5',
    orientation: 'portrait-primary',
    lang: 'tr',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
