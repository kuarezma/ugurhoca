'use client';

import { usePathname } from 'next/navigation';
import { HomeFooter } from '@/features/home/components/HomeFooter';

export function GlobalFooterGate() {
  const pathname = usePathname();

  if (!pathname) {
    return null;
  }

  // Zaten kendi HomeFooter'ını içeren sayfalar veya footer istenmeyen yollar
  if (
    pathname === '/' ||
    pathname.startsWith('/odak-pomodoro') ||
    pathname.startsWith('/meydan-okuma') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/canli-ders/d/')
  ) {
    return null;
  }

  return <HomeFooter />;
}
