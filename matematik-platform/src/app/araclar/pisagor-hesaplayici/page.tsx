import type { Metadata } from 'next';
import { PisagorCalculatorContainer } from '@/features/tools/containers/PisagorCalculatorContainer';
import { createPageMetadata } from '@/lib/site-metadata';
import { buildHowToJsonLd, buildToolJsonLd } from '@/lib/schema-org';

export const metadata: Metadata = createPageMetadata({
  title: 'Dik Üçgen Pisagor Bağıntısı & Hipotenüs Hesaplayıcı | Uğur Hoca',
  description:
    'a² + b² = c² bağıntısıyla hipotenüs ve dik kenarı adım adım hesapla, özel dik üçgenleri anında tespit et.',
  path: '/araclar/pisagor-hesaplayici',
});

const toolJsonLd = buildToolJsonLd({
  name: 'Dik Üçgen Pisagor & Hipotenüs Hesaplayıcı',
  description:
    'a² + b² = c² formülüyle dik kenarları veya hipotenüsü adım adım hesaplayan geometri robotu.',
  path: '/araclar/pisagor-hesaplayici',
});

const howToJsonLd = buildHowToJsonLd({
  name: 'Pisagor Bağıntısı ile Hipotenüs Nasıl Hesaplanır?',
  description: 'Bir dik üçgende dik kenarların kareleri toplamının hipotenüsün karesine eşit olması adımları.',
  steps: [
    {
      name: '1. Dik Kenarları Belirleyin',
      text: 'Dik açıyı (90°) oluşturan a ve b dik kenarlarının uzunluklarını girin.',
    },
    {
      name: '2. Karelerini Toplayın',
      text: 'a² ve b² değerlerini hesaplayıp toplayarak c² değerini bulun.',
    },
    {
      name: '3. Karekökünü Alın',
      text: 'Toplamın karekökünü alarak hipotenüs uzunluğunu (c) elde edin.',
    },
  ],
});

export default function PisagorCalculatorRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <PisagorCalculatorContainer />
    </>
  );
}
