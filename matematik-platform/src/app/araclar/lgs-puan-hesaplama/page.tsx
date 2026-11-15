import type { Metadata } from 'next';
import { LgsCalculatorContainer } from '@/features/tools/containers/LgsCalculatorContainer';
import { createPageMetadata } from '@/lib/site-metadata';
import { buildFaqJsonLd, buildToolJsonLd } from '@/lib/schema-org';

export const metadata: Metadata = createPageMetadata({
  title: '2026 MEB LGS Puan & Yüzdelik Dilim Hesaplama',
  description:
    'LGS netlerine ve ders ağırlıklarına göre tahmini puanını ve yüzdelik dilimini hesapla.',
  path: '/araclar/lgs-puan-hesaplama',
});

const toolJsonLd = buildToolJsonLd({
  name: 'MEB LGS Puan & Yüzdelik Dilim Hesaplama Robotu',
  description: 'LGS netlerine göre tahmini puan ve yüzdelik dilim hesaplayıcı.',
  path: '/araclar/lgs-puan-hesaplama',
});

const faqJsonLd = buildFaqJsonLd([
  {
    question: 'LGS puanı nasıl hesaplanır?',
    answer:
      'Her alt testin neti doğru sayısından yanlış sayısının üçte biri çıkarılarak hesaplanır. Araç ders ağırlıklarıyla tahmini puan üretir; resmî sonuç sınav istatistiklerine bağlıdır.',
  },
  {
    question: 'LGS yüzdelik dilim tahmini nasıl yapılır?',
    answer:
      'Araç tahmini puandan yaklaşık bir yüzdelik üretir; gerçek yüzdelik sınava katılanların sonuçlarına göre değişir.',
  },
]);

export default function LgsCalculatorRoute() {
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
      <LgsCalculatorContainer />
    </>
  );
}
