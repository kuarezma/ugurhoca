'use client';

import { useClientPathname } from '@/hooks/useClientPathname';
import { HomeFooter } from '@/features/home/components/HomeFooter';

export function GlobalFooterGate() {
  const pathname = useClientPathname();

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
