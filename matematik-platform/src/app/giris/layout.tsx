import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Giriş',
  description:
    'Uğur Hoca Matematik hesabınıza giriş yapın; testler, ödevler ve içeriklere erişin.',
  path: '/giris',
});

export default function GirisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
