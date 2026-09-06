import type { Metadata } from 'next';
import { PisagorCalculatorContainer } from '@/features/tools/containers/PisagorCalculatorContainer';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Dik Üçgen Pisagor Bağıntısı & Hipotenüs Hesaplayıcı | Uğur Hoca',
  description:
    'a² + b² = c² bağıntısıyla hipotenüs ve dik kenarı adım adım hesapla, özel dik üçgenleri anında tespit et.',
  path: '/araclar/pisagor-hesaplayici',
});

export default function PisagorCalculatorRoute() {
  return <PisagorCalculatorContainer />;
}
