import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'YKS programı ve araçları',
  description:
    'Yükseköğretim Kurumları Sınavı için program, hedef ve çalışma araçları.',
  path: '/programlar/yks',
});

export default function YksProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
