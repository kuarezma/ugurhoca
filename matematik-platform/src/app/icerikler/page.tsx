import type { Metadata } from 'next';
import ContentsPage from '@/features/content/containers/ContentsPage';
import { CONTENT_PAGE_SIZE } from '@/features/content/constants';
import { loadInitialContentDocuments } from '@/features/content/server';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'İçerikler',
  description:
    'Çalışma kağıtları, ders notları, videolar ve dokümanları sınıf ve türe göre keşfet.',
  path: '/icerikler',
});

export const revalidate = 60;

export default async function IceriklerPage() {
  const initialData = await loadInitialContentDocuments(
    1,
    CONTENT_PAGE_SIZE,
    'all',
    'all',
  );

  return (
    <ContentsPage
      initialDocuments={initialData.documents}
      initialLoadSucceeded={initialData.isHydrated}
      initialGrade="all"
      initialTotalCount={initialData.count}
      initialType="all"
    />
  );
}
