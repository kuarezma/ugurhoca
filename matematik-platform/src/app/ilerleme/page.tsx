import ProgressPage from '@/features/progress/containers/ProgressPage';
import { loadInitialProgressPageData } from '@/features/progress/server';

export default async function IlerlemePage() {
  const initialData = await loadInitialProgressPageData();

  return <ProgressPage initialData={initialData} />;
}
