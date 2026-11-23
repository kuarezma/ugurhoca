import type { Metadata } from 'next';
import { SitePageNavigation } from '@/components/SitePageNavigation';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Programlar ve araçlar',
  description: 'LGS ve YKS için programlar, puan hesaplama ve hedef araçları.',
  path: '/programlar',
});

export default function ProgramlarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SitePageNavigation />
      {children}
    </>
  );
}
