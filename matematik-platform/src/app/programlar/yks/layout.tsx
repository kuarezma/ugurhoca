import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'YKS Programı',
  description:
    'Yükseköğretim Kurumları Sınavı matematik hazırlık ve konu takibi.',
};

export default function YksProgramLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
