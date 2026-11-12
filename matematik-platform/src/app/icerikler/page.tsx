import type { Metadata } from 'next';
import ContentsPage from '@/features/content/containers/ContentsPage';
import {
  CONTENT_PAGE_SIZE,
  CONTENT_TYPE_MAPPING,
} from '@/features/content/constants';
import { loadInitialContentDocuments } from '@/features/content/server';
import { normalizeContentGrade } from '@/features/content/utils';
import { isWorksheetType } from '@/features/content/worksheet-display';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'İçerikler',
  description:
    'Çalışma kağıtları, ders notları, videolar ve dokümanları sınıf ve türe göre keşfet.',
  path: '/icerikler',
});

export const revalidate = 60;

type IceriklerPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getSingleParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function IceriklerPage({
  searchParams,
}: IceriklerPageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const rawType =
    getSingleParam(resolvedSearchParams.type) ||
    getSingleParam(resolvedSearchParams.category);
  const initialType = rawType
    ? CONTENT_TYPE_MAPPING[rawType] || rawType
    : 'all';
  const rawGrade = getSingleParam(resolvedSearchParams.grade);
  const initialGrade = rawGrade ? normalizeContentGrade(rawGrade) : 'all';

  const initialData = isWorksheetType(initialType)
    ? { count: 0, documents: [], isHydrated: false }
    : await loadInitialContentDocuments(
        1,
        CONTENT_PAGE_SIZE,
        initialGrade,
        initialType,
      );

  return (
    <ContentsPage
      initialDocuments={initialData.documents}
      initialLoadSucceeded={initialData.isHydrated}
      initialGrade={initialGrade}
      initialTotalCount={initialData.count}
      initialType={initialType}
    />
  );
}
