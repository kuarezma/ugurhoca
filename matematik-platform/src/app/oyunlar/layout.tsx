import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Oyunlar',
  description:
    'Matematik becerilerini pekiştiren eğitici oyunlar ve etkinlikler.',
};

export default function OyunlarLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
