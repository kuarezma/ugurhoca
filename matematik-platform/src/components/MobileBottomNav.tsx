'use client';

import { useCallback, useEffect, useState } from 'react';
import { SafeLink } from '@/components/SafeLink';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileCheck, Timer, Gamepad2, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/testler', label: 'Testler', icon: FileCheck },
  { href: '/odak-pomodoro', label: 'Odak', icon: Timer },
  { href: '/oyunlar', label: 'Oyunlar', icon: Gamepad2 },
  { href: '/profil', label: 'Profil', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  let router: ReturnType<typeof useRouter> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch {
    router = null;
  }

  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Rota değiştiğinde bekleyen seçimi temizle
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  // 5 ana sekmenin rotalarını boşta iken (idle) önceden yükle
  useEffect(() => {
    if (!router) return;
    const prefetchRoutes = () => {
      NAV_ITEMS.forEach((item) => {
        if (item.href !== pathname) {
          try {
            router?.prefetch(item.href);
          } catch {
            // prefetch hatası yok sayılır
          }
        }
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(prefetchRoutes, { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(prefetchRoutes, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, router]);

  const handlePointerDown = useCallback(
    (href: string) => {
      if (router && href !== pathname) {
        try {
          router.prefetch(href);
        } catch {
          // ignore
        }
      }
    },
    [pathname, router],
  );

  // Canlı ders odasında tam ekran deneyimini bozmamak için gizle
  if (pathname?.startsWith('/canli-ders/d/')) {
    return null;
  }

  return (
    <nav
      aria-label="Mobil alt menü"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden pointer-events-none"
    >
      <div className="mx-auto max-w-md px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-auto">
        <div className="flex items-center justify-around rounded-2xl border px-2 py-2 backdrop-blur-xl transition-colors duration-200 border-slate-200/90 bg-white/92 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/92 dark:shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
          {NAV_ITEMS.map((item) => {
            const isRouteActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);
            const isActive = pendingHref ? pendingHref === item.href : isRouteActive;
            const Icon = item.icon;

            return (
              <SafeLink
                key={item.href}
                href={item.href}
                aria-current={isRouteActive ? 'page' : undefined}
                onPointerDown={() => handlePointerDown(item.href)}
                onClick={(e) => {
                  if (isRouteActive) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                  }
                  setPendingHref(item.href);
                }}
                className={`relative flex min-h-[44px] min-w-[52px] flex-col items-center justify-center rounded-xl px-2 py-1 text-[11px] font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 -top-1 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                )}
                <Icon
                  className={`h-5 w-5 transition-transform duration-150 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  aria-hidden="true"
                />
                <span className="mt-1 leading-none">{item.label}</span>
              </SafeLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
