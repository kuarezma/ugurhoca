import type { Metadata } from 'next';
import { EbobEkokCalculatorContainer } from '@/features/tools/containers/EbobEkokCalculatorContainer';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Adım Adım EBOB - EKOK Hesaplayıcı & Asal Çarpan Tablosu | Uğur Hoca',
  description:
    'İki sayının EBOB ve EKOK değerlerini bölen listesi algoritması ile adım adım hesapla ve ortak asal çarpanları gör.',
  path: '/araclar/ebob-ekok-hesaplayici',
});

export default function EbobEkokCalculatorRoute() {
  return <EbobEkokCalculatorContainer />;
}
