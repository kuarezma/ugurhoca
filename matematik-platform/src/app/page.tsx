import type { Metadata } from 'next';
import { Suspense } from 'react';
import HomePage from '@/features/home/containers/HomePage';
import { loadInitialHomeFeed } from '@/features/home/server/loadHomeFeed';
import { loadActiveLiveLessonForCurrentUser } from '@/features/live-lessons/server/liveLessons';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Ana sayfa',
  description:
    'Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!',
  path: '/',
});

async function HomeWithFeed() {
  // Aktif ders sorgusu kimlik doğrulaması (Supabase auth + profiles) gerektirdiği için
  // duyurulardan bağımsız ve genelde daha yavaş. İkisi paralel çalışır; aktif ders
  // yoksa sayfa yine de yalnızca duyuru sorgusu kadar bekler.
  const [initialFeed, activeLiveLesson] = await Promise.all([
    loadInitialHomeFeed(),
    loadActiveLiveLessonForCurrentUser(),
  ]);

  return <HomePage activeLiveLesson={activeLiveLesson} initialFeed={initialFeed} />;
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeWithFeed />
    </Suspense>
  );
}
