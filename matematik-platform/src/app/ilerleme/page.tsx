import type { Metadata } from 'next';
import ProgressPage from '@/features/progress/containers/ProgressPage';
import { loadInitialProgressPageData } from '@/features/progress/server';

export const metadata: Metadata = {
  title: 'İlerleme',
  description:
    'Çalışma süresi, hedefler ve başarı rozetleriyle gelişimini takip et.',
  robots: { index: false, follow: false },
};

export default async function IlerlemePage() {
  const initialData = await loadInitialProgressPageData();

  return <ProgressPage initialData={initialData} />;
}
