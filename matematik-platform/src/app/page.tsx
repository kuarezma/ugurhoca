import HomePage from '@/features/home/containers/HomePage';
import { loadHomeFeedServer } from '@/features/home/server';

export default async function Page() {
  const initialFeed = await loadHomeFeedServer();

  return (
    <HomePage
      initialAnnouncements={initialFeed.announcements}
      initialDocuments={initialFeed.documents}
      initialWritings={initialFeed.writings}
    />
  );
}
