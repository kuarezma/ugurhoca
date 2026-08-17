import type { Metadata } from 'next';
import YksProgramPage from '@/features/programs/containers/YksProgramPage';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'YKS Puan & Tercih Sihirbazı',
  description:
    'YKS (TYT-AYT) netlerine göre tahmini puanını hesapla ve üniversite bölümlerini keşfet.',
  path: '/programlar/yks',
});

export default function YksProgramRoute() {
  return <YksProgramPage />;
}
