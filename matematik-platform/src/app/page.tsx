import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HomeAnnouncementsFeed } from '@/features/home/components/HomeAnnouncementsFeed';
import HomePage from '@/features/home/containers/HomePage';
import { loadInitialHomeFeed } from '@/features/home/server/loadHomeFeed';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Uğur Hoca Matematik | 5, 6, 7, 8. Sınıf & LGS',
  description:
    '5, 6, 7 ve 8. sınıf öğrencileri için MEB müfredatına uygun yeni nesil çalışma kağıtları, yaprak testler, eğitici matematik oyunları ve LGS hazırlık içerikleri. Tamamen ücretsiz!',
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
