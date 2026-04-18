import HomePage from '@/features/home/containers/HomePage';
import { loadInitialHomeFeed } from '@/features/home/server/loadHomeFeed';

export default async function Home() {
  const initialFeed = await loadInitialHomeFeed();

  return <HomePage initialFeed={initialFeed} />;
}
