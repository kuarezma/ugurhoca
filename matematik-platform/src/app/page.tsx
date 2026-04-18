import { Suspense } from 'react';
import HomePage from '@/features/home/containers/HomePage';
import { loadInitialHomeFeed } from '@/features/home/server/loadHomeFeed';
import HomeLoading from './loading';

async function HomeWithFeed() {
  const initialFeed = await loadInitialHomeFeed();

  return <HomePage initialFeed={initialFeed} />;
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeWithFeed />
    </Suspense>
  );
}
