'use client';

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

export function MobileBottomNav() {
  const pathname = usePathname();

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
        <div className="flex items-center justify-around rounded-2xl border px-2 py-2 backdrop-blur-xl transition-all duration-300 border-slate-200/90 bg-white/92 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/92 dark:shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <SafeLink
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-[44px] min-w-[52px] flex-col items-center justify-center rounded-xl px-2 py-1 text-[11px] font-semibold transition-all duration-200 ${
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
                  className={`h-5 w-5 transition-transform duration-200 ${
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
