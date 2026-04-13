import TestsPage from '@/features/quizzes/containers/TestsPage';
import { loadInitialTestsPageData } from '@/features/quizzes/server';

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
