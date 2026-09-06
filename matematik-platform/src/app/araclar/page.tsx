import type { Metadata } from 'next';
import { ToolsHubContainer } from '@/features/tools/containers/ToolsHubContainer';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Ücretsiz Matematik & Sınav Araçları | Uğur Hoca',
  description:
    'LGS ve YKS puan hesaplama robotu, adım adım EBOB-EKOK bulucu, Pisagor hipotenüs hesaplayıcı ve interaktif geometri laboratuvarı.',
  path: '/araclar',
});

export default function ToolsHubRoute() {
  return <ToolsHubContainer />;
}
