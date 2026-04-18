import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Kayıt ol',
  description:
    'Uğur Hoca Matematik platformuna kayıt olun; matematik içerikleri ve ödevleri kullanmaya başlayın.',
  path: '/kayit',
  noIndex: true,
});

export default function KayitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
