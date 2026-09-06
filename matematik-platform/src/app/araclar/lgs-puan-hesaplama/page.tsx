import type { Metadata } from 'next';
import { LgsCalculatorContainer } from '@/features/tools/containers/LgsCalculatorContainer';
import { createPageMetadata } from '@/lib/site-metadata';
import { buildFaqJsonLd, buildToolJsonLd } from '@/lib/schema-org';

export const metadata: Metadata = createPageMetadata({
  title: '2026/2027 MEB LGS Puan & Yüzdelik Dilim Hesaplama Robotu | Uğur Hoca',
  description:
    'LGS netlerine göre güncel MEB standart sapma katsayılarıyla anlık puanını ve tahmini yüzdelik dilimini hesapla.',
  path: '/araclar/lgs-puan-hesaplama',
});

const toolJsonLd = buildToolJsonLd({
  name: 'MEB LGS Puan & Yüzdelik Dilim Hesaplama Robotu',
  description:
    'LGS netlerine göre güncel MEB katsayılarıyla anlık puan ve tahmini yüzdelik dilim hesaplayıcı.',
  path: '/araclar/lgs-puan-hesaplama',
});

const faqJsonLd = buildFaqJsonLd([
  {
    question: 'LGS puanı nasıl hesaplanır?',
    answer:
      'Her alt testin neti (Doğru Sayısı - Yanlış Sayısı / 3) hesaplanır. Netler ilgili dersin MEB standart katsayısı ile çarpılır ve taban puana eklenerek merkezi sınav puanı (MSP) bulunur.',
  },
  {
    question: 'LGS yüzdelik dilim tahmini nasıl yapılır?',
    answer:
      'Önceki yılların MEB resmi istatistikleri, standart sapma aralıkları ve öğrenci yığılma eğrileri baz alınarak tahmini genel yüzdelik dilim hesaplanır.',
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
