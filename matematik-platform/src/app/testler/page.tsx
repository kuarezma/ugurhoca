import type { Metadata } from 'next';
import TestsPage from '@/features/quizzes/containers/TestsPage';
import { loadInitialTestsPageData } from '@/features/quizzes/server';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Testler',
  description:
    'Konu testleri ve denemelerle kendini dene; çözümlerle pekiştir.',
  path: '/testler',
});

export default async function TestlerPage() {
  const initialData = await loadInitialTestsPageData();

  return (
    <TestsPage
      initialQuizzes={initialData.initialQuizzes}
      initialUser={initialData.initialUser}
      isHydrated={initialData.isHydrated}
    />
  );
}
