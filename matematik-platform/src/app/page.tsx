import type { Metadata } from 'next';
import { Suspense } from 'react';
import HomePage from '@/features/home/containers/HomePage';
import { loadInitialHomeFeed } from '@/features/home/server/loadHomeFeed';
import { ActiveLiveLessonBadge } from '@/features/live-lessons/components/ActiveLiveLessonBadge';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Ana sayfa',
  description:
    'Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!',
  path: '/',
});

async function HomeWithFeed() {
  // Sayfa yalnızca duyuru sorgusunu bekler (tek indeksli sorgu, limit 4).
  // Aktif ders rozeti kendi verisini çeker ve aşağıda `<Suspense>` içinde
  // stream edilir; gerektirdiği iki kimlik doğrulama turu artık hero'nun
  // boyanmasını geciktirmiyor.
  const initialFeed = await loadInitialHomeFeed();

  return (
    <HomePage
      initialFeed={initialFeed}
      liveLessonSlot={
        <Suspense fallback={null}>
          <ActiveLiveLessonBadge />
        </Suspense>
      }
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeWithFeed />
    </Suspense>
  );
}
