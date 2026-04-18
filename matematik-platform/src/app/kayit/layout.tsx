import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kayıt',
  description: 'Yeni öğrenci hesabı oluştur ve matematik içeriklerine eriş.',
  robots: { index: false, follow: true },
};

export default function KayitLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
