import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Programlar',
  description:
    'LGS ve YKS matematik çalışma programları, hedefler ve planlama.',
};

export default function ProgramlarLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
