import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Giriş',
  description: 'Öğrenci hesabınla Uğur Hoca Matematik platformuna giriş yap.',
  robots: { index: false, follow: true },
};

export default function GirisLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
