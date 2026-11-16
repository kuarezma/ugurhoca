import type { Metadata } from 'next';
import { LgsCalculatorContainer } from '@/features/tools/containers/LgsCalculatorContainer';
import { createPageMetadata } from '@/lib/site-metadata';
import { buildFaqJsonLd, buildToolJsonLd } from '@/lib/schema-org';
import { LGS_CALCULATOR_TITLE, LGS_FAQS } from '@/features/tools/lgs-content';

export const metadata: Metadata = createPageMetadata({
  title: LGS_CALCULATOR_TITLE,
  description:
    'LGS netlerine ve ders ağırlıklarına göre tahmini puanını ve yüzdelik dilimini hesapla.',
  path: '/araclar/lgs-puan-hesaplama',
});

const toolJsonLd = buildToolJsonLd({
  name: 'MEB LGS Puan & Yüzdelik Dilim Hesaplama Robotu',
  description: 'LGS netlerine göre tahmini puan ve yüzdelik dilim hesaplayıcı.',
  path: '/araclar/lgs-puan-hesaplama',
});

const faqJsonLd = buildFaqJsonLd(
  LGS_FAQS.map(({ q, a }) => ({ question: q, answer: a })),
);

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
