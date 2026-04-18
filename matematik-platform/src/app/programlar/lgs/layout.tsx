import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'LGS Programı',
  description:
    'Liselere Geçiş Sınavı için matematik konu planı ve çalışma önerileri.',
};

export default function LgsProgramLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
