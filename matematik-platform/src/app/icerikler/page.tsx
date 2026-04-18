import type { Metadata } from 'next';
import ContentsPage from '@/features/content/containers/ContentsPage';
import { CONTENT_PAGE_SIZE } from '@/features/content/constants';
import {
  getInitialContentGradeFilter,
  loadInitialContentDocuments,
} from '@/features/content/server';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'İçerikler',
  description:
    'Çalışma kağıtları, ders notları, videolar ve dokümanları sınıf ve türe göre keşfet.',
  path: '/icerikler',
});

type IceriklerPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function IceriklerPage({
  searchParams,
}: IceriklerPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const typeParam = resolvedSearchParams.type;
  const initialType =
    typeof typeParam === 'string' && typeParam.length > 0 ? typeParam : 'all';
  const initialGrade = await getInitialContentGradeFilter();

  const initialData = await loadInitialContentDocuments(
    1,
    CONTENT_PAGE_SIZE,
    initialGrade,
    initialType,
  );

  return (
    <ContentsPage
      initialDocuments={initialData.documents}
      initialGrade={initialGrade}
      initialTotalCount={initialData.count}
      initialType={initialType}
    />
  );
}
