import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'LGS programı ve araçları',
  description:
    'Liselere Geçiş Sistemi için puan hesaplama, hedef belirleme ve çalışma programı.',
  path: '/programlar/lgs',
});

export default function LgsProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
