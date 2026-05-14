import type { Metadata } from 'next';
import HomePage from '@/features/home/containers/HomePage';
import { loadInitialHomeFeed } from '@/features/home/server/loadHomeFeed';
import { loadLiveLessonsForCurrentUser } from '@/features/live-lessons/server/liveLessons';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Ana sayfa',
  description:
    'Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!',
  path: '/',
});

async function HomeWithFeed() {
  const [initialFeed, liveLessons] = await Promise.all([
    loadInitialHomeFeed(),
    loadLiveLessonsForCurrentUser(),
  ]);
  const activeLiveLesson = liveLessons.find((lesson) => lesson.status === 'active') ?? null;

  return <HomePage activeLiveLesson={activeLiveLesson} initialFeed={initialFeed} />;
}

export default function Home() {
  return <HomeWithFeed />;
}
