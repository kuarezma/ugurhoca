import type { Metadata } from 'next';
import { LgsCalculatorContainer } from '@/features/tools/containers/LgsCalculatorContainer';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: '2026/2027 MEB LGS Puan & Yüzdelik Dilim Hesaplama Robotu | Uğur Hoca',
  description:
    'LGS netlerine göre güncel MEB standart sapma katsayılarıyla anlık puanını ve tahmini yüzdelik dilimini hesapla.',
  path: '/araclar/lgs-puan-hesaplama',
});

export default function LgsCalculatorRoute() {
  return <LgsCalculatorContainer />;
}
