import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LiveLessonsPage } from '@/features/live-lessons/components/LiveLessonsPage';
import {
  loadLiveLessonsForCurrentUser,
  loadLiveLessonStudentOptions,
} from '@/features/live-lessons/server/liveLessons';
import { getServerAuthSnapshot } from '@/lib/auth-snapshot.server';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Canlı Ders',
  description: 'Uğur Hoca canlı ders odaları ve planlanan dersler.',
  noIndex: true,
  path: '/canli-ders',
});

export default async function CanliDersPage() {
  const user = await getServerAuthSnapshot();
  if (!user) {
    redirect('/giris');
  }

  const [lessons, students] = await Promise.all([
    loadLiveLessonsForCurrentUser(),
    loadLiveLessonStudentOptions(),
  ]);
  return <LiveLessonsPage initialLessons={lessons} students={students} user={user} />;
}
