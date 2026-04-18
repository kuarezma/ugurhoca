import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Oyunlar',
  description:
    'Matematik becerilerinizi geliştiren eğitici oyunlar ve etkinlikler.',
  path: '/oyunlar',
});

export default function OyunlarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
