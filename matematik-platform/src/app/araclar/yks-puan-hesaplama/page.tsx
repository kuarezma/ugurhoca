import type { Metadata } from 'next';
import { YksCalculatorContainer } from '@/features/tools/containers/YksCalculatorContainer';
import { createPageMetadata } from '@/lib/site-metadata';
import { buildFaqJsonLd, buildToolJsonLd } from '@/lib/schema-org';

export const metadata: Metadata = createPageMetadata({
  title: '2026/2027 ÖSYM YKS (TYT-AYT) Puan & Sıralama Hesaplayıcı | Uğur Hoca',
  description:
    'TYT, Sayısal, Eşit Ağırlık ve Sözel yerleştirme puanlarını OBP diploma notuyla hesapla, tahmini başarı sıranı öğren.',
  path: '/araclar/yks-puan-hesaplama',
});

const toolJsonLd = buildToolJsonLd({
  name: 'ÖSYM YKS (TYT-AYT) Puan & Sıralama Hesaplayıcı',
  description:
    'TYT, Sayısal, Eşit Ağırlık ve Sözel puanlarını OBP diploma notuyla hesaplayan güncel YKS robotu.',
  path: '/araclar/yks-puan-hesaplama',
});

const faqJsonLd = buildFaqJsonLd([
  {
    question: 'YKS yerleştirme puanı nasıl hesaplanır?',
    answer:
      'Ham TYT ve AYT puanlarına, adayın Ortaöğretim Başarı Puanının (OBP) 0.12 katsayısıyla çarpımı eklenerek yerleştirme puanı elde edilir.',
  },
  {
    question: 'OBP hesaplamaya nasıl etki eder?',
    answer:
      'Lise diploma notu 5 ile çarpılarak OBP (maksimum 500) bulunur, ardından 0.12 ile çarpılarak yerleştirme puanına 30 ila 60 puan arasında katkı sağlar.',
  },
]);

export default function YksCalculatorRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <YksCalculatorContainer />
    </>
  );
}
