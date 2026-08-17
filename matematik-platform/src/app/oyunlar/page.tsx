import type { Metadata } from 'next';
import GamesPage from '@/features/games/containers/GamesPage';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Oyunlar',
  description:
    'Eğlenceli matematik oyunlarıyla pratik yap, puan topla ve liderlik tablosunda yerini al.',
  path: '/oyunlar',
});

export default function OyunlarRoute() {
  return <GamesPage />;
}
