import type { Metadata } from 'next';
import { Suspense } from 'react';
import HomePage from '@/features/home/containers/HomePage';
import { loadInitialHomeFeed } from '@/features/home/server/loadHomeFeed';
import { createPageMetadata } from '@/lib/site-metadata';
import HomeLoading from './loading';

export const metadata: Metadata = createPageMetadata({
  title: 'Ana sayfa',
  description:
    'Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!',
  path: '/',
});

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
