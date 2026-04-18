import type { Metadata } from 'next';
import ProgressPage from '@/features/progress/containers/ProgressPage';
import { loadInitialProgressPageData } from '@/features/progress/server';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'İlerleme',
    description:
      'Çalışma süresi, hedefler ve başarı rozetleriyle gelişimini takip et.',
    path: '/ilerleme',
  }),
  robots: { index: false, follow: false },
};

export default async function IlerlemePage() {
  const initialData = await loadInitialProgressPageData();

  return <ProgressPage initialData={initialData} />;
}
