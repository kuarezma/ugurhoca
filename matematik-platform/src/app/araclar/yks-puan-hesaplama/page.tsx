import type { Metadata } from 'next';
import { YksCalculatorContainer } from '@/features/tools/containers/YksCalculatorContainer';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: '2026/2027 ÖSYM YKS (TYT-AYT) Puan & Sıralama Hesaplayıcı | Uğur Hoca',
  description:
    'TYT, Sayısal, Eşit Ağırlık ve Sözel yerleştirme puanlarını OBP diploma notuyla hesapla, tahmini başarı sıranı öğren.',
  path: '/araclar/yks-puan-hesaplama',
});

export default function YksCalculatorRoute() {
  return <YksCalculatorContainer />;
}
