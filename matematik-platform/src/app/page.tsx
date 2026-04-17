import HomePage from '@/features/home/containers/HomePage';
import { loadInitialHomePageData } from '@/features/home/server';

export const revalidate = 300;

export default async function Page() {
  const initialData = await loadInitialHomePageData();

  return <HomePage initialData={initialData} />;
}
