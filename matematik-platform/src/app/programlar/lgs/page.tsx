import type { Metadata } from 'next';
import LgsProgramPage from '@/features/programs/containers/LgsProgramPage';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'LGS Puan & Tercih Sihirbazı',
  description:
    'LGS netlerine göre tahmini puanını hesapla ve lise hedeflerini belirle.',
  path: '/programlar/lgs',
});

export default function LgsProgramRoute() {
  return <LgsProgramPage />;
}
