import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HomeAnnouncementsFeed } from '@/features/home/components/HomeAnnouncementsFeed';
import HomePage from '@/features/home/containers/HomePage';
import { loadInitialHomeFeed } from '@/features/home/server/loadHomeFeed';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Ana sayfa',
  description:
    'Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!',
  path: '/',
});

export const revalidate = 60;

async function HomeAnnouncementsSlot() {
  const initialFeed = await loadInitialHomeFeed();

  return <HomeAnnouncementsFeed announcements={initialFeed.announcements} />;
}

export default function Home() {
  return (
    <HomePage
      announcementsSlot={
        <Suspense fallback={null}>
          <HomeAnnouncementsSlot />
        </Suspense>
      }
    />
  );
}
