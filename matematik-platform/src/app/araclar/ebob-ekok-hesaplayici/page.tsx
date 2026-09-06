import type { Metadata } from 'next';
import { EbobEkokCalculatorContainer } from '@/features/tools/containers/EbobEkokCalculatorContainer';
import { createPageMetadata } from '@/lib/site-metadata';
import { buildHowToJsonLd, buildToolJsonLd } from '@/lib/schema-org';

export const metadata: Metadata = createPageMetadata({
  title: 'Adım Adım EBOB - EKOK Hesaplayıcı & Asal Çarpan Tablosu | Uğur Hoca',
  description:
    'İki sayının EBOB ve EKOK değerlerini bölen listesi algoritması ile adım adım hesapla ve ortak asal çarpanları gör.',
  path: '/araclar/ebob-ekok-hesaplayici',
});

const toolJsonLd = buildToolJsonLd({
  name: 'Adım Adım EBOB - EKOK Hesaplayıcı',
  description:
    'İki sayının EBOB ve EKOK değerlerini bölen listesi algoritması ile adım adım hesaplayan interaktif araç.',
  path: '/araclar/ebob-ekok-hesaplayici',
});

const howToJsonLd = buildHowToJsonLd({
  name: 'Bölen Listesi Yöntemi ile EBOB ve EKOK Nasıl Hesaplanır?',
  description: 'İki sayının ortak ve asal bölenlerini bularak EBOB ve EKOK değerlerini hesaplama adımları.',
  steps: [
    {
      name: '1. Sayıları Yan Yana Yazın',
      text: 'Hesaplamak istediğiniz iki sayıyı yan yana yazarak sağ tarafına dikey bir bölen çizgisi çekin.',
    },
    {
      name: '2. En Küçük Asal Sayıdan Başlayarak Bölün',
      text: 'Sayıları 2, 3, 5, 7 gibi asal sayılara bölün. Her iki sayıyı da bölen asal sayıları işaretleyin.',
    },
    {
      name: '3. EBOB ve EKOK Değerlerini Çarpın',
      text: 'İşaretlenen ortak bölenlerin çarpımı EBOB değerini; sağ sütundaki tüm asal bölenlerin çarpımı ise EKOK değerini verir.',
    },
  ],
});

export default function EbobEkokCalculatorRoute() {
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
      <EbobEkokCalculatorContainer />
    </>
  );
}
