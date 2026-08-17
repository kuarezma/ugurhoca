import type { Metadata } from 'next';
import ProgramsHubPage from '@/features/programs/containers/ProgramsHubPage';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Programlar & Sihirbazlar',
  description:
    'LGS ve YKS için akıllı puan hesaplama ve hedef tercih sihirbazları.',
  path: '/programlar',
});

export default function ProgramsHubRoute() {
  return <ProgramsHubPage />;
}
