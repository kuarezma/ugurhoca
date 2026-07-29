import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Canlı Ders Odası',
  description: 'Uğur Hoca canlı ders odası.',
  noIndex: true,
  path: '/canli-ders',
});

export default function LiveLessonRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
