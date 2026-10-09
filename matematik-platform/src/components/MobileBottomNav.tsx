'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { SafeLink } from '@/components/SafeLink';
import { usePathname } from 'next/navigation';
import { Home, FileCheck, Timer, Gamepad2, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/testler', label: 'Testler', icon: FileCheck },
  { href: '/odak-pomodoro', label: 'Odak', icon: Timer },
  { href: '/oyunlar', label: 'Oyunlar', icon: Gamepad2 },
  { href: '/profil', label: 'Profil', icon: User },
];

const subscribeToHydration = () => () => {};
const readHydrated = () => true;
const readServerHydrated = () => false;

export function MobileBottomNav() {
  const routerPathname = usePathname();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    readHydrated,
    readServerHydrated,
  );
  // ISR kaynak yolu tarayıcı URL'sinden farklı olabilir; ilk HTML sabit kalır.
  const pathname = hydrated ? routerPathname : null;

  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Rota değiştiğinde bekleyen seçimi temizle
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  // Canlı ders odasında tam ekran deneyimini bozmamak için gizle
  if (routerPathname?.startsWith('/canli-ders/d/')) {
    return null;
  }

  return (
    <nav
      aria-label="Mobil alt menü"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden pointer-events-none"
    >
      <div className="mx-auto max-w-md px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-auto">
        <div className="flex items-center justify-around rounded-3xl border-2 sm:border-3 border-default bg-surface-1/95 px-2 py-2 shadow-[0_4px_0_var(--border-default)] backdrop-blur-xl transition-all duration-200">
          {NAV_ITEMS.map((item) => {
            const isRouteActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);
            const isActive = pendingHref
              ? pendingHref === item.href
              : isRouteActive;
            const Icon = item.icon;

            return (
              <SafeLink
                key={item.href}
                href={item.href}
                aria-current={isRouteActive ? 'page' : undefined}
                onClick={(e) => {
                  if (isRouteActive) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                  }
                  setPendingHref(item.href);
                }}
                className={`relative flex min-h-[46px] min-w-[54px] flex-col items-center justify-center rounded-2xl px-2 py-1.5 font-display text-[11px] font-bold transition-all duration-150 active:scale-95 select-none ${
                  isActive
                    ? 'text-green-ink dark:text-[#61e002] font-black'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -top-1.5 h-1 rounded-full bg-[#58cc02]"
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
