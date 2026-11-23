'use client';

import { useEffect, useState } from 'react';
import { SafeLink } from '@/components/SafeLink';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  FileCheck,
  Gamepad2,
  User,
  MessageCircle,
} from 'lucide-react';
import { useHydrated } from '@/hooks/useClientPathname';

const NAV_ITEMS = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/icerikler', label: 'İçerikler', icon: BookOpen },
  { href: '/testler', label: 'Testler', icon: FileCheck },
  { href: '/oyunlar', label: 'Oyunlar', icon: Gamepad2 },
  { href: '/profil', label: 'Profil', icon: User },
];

const HIDDEN_PREFIXES = [
  '/canli-ders/d/',
  '/admin',
  '/giris',
  '/kayit',
  '/sifremi-unuttum',
  '/sifre-sifirla',
];

export function MobileBottomNav() {
  const routerPathname = usePathname();
  const hydrated = useHydrated();
  // ISR kaynak yolu tarayıcı URL'sinden farklı olabilir; ilk HTML sabit kalır.
  const pathname = hydrated ? routerPathname : null;

  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const updateChatState = (event: Event) => {
      const state = (
        event as CustomEvent<{ unreadCount?: unknown; open?: unknown }>
      ).detail;
      if (!state) return;
      if (
        typeof state.unreadCount === 'number' &&
        Number.isFinite(state.unreadCount)
      ) {
        setUnreadCount(Math.max(0, state.unreadCount));
      }
      if (typeof state.open === 'boolean') setChatOpen(state.open);
    };
    window.addEventListener('ugurhoca:chat-state', updateChatState);
    return () =>
      window.removeEventListener('ugurhoca:chat-state', updateChatState);
  }, []);

  // Rota değiştiğinde bekleyen seçimi temizle
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  // Yönetici, giriş/kayıt ve canlı ders odası ekranlarında gizle
  if (
    routerPathname &&
    HIDDEN_PREFIXES.some((prefix) => routerPathname.startsWith(prefix))
  ) {
    return null;
  }

  return (
    <nav
      aria-label="Mobil alt menü"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden pointer-events-none"
    >
      <div className="mx-auto max-w-md px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-auto">
        <div className="flex items-center justify-around rounded-full border border-subtle crystal-nav-pill px-2 py-1.5 transition-all duration-300">
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
                className={`relative flex min-h-[46px] min-w-11 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-1.5 font-display text-[11px] font-bold transition-all duration-150 active:scale-95 select-none ${
                  isActive
                    ? 'text-sky-700 dark:text-sky-400 font-extrabold'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -top-1 h-1 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
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
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new Event(chatOpen ? 'close-chat-bubble' : 'open-chat-bubble'),
              )
            }
            data-chat-toggle
            aria-haspopup="dialog"
            aria-expanded={chatOpen}
            aria-label={
              unreadCount > 0
                ? `Uğur Hoca'ya yaz, ${unreadCount} okunmamış mesaj`
                : "Uğur Hoca'ya yaz"
            }
            className="relative flex min-h-[46px] min-w-11 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-1.5 font-display text-[11px] font-bold text-secondary hover:text-primary"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <span className="mt-1 leading-none">Destek</span>
            {unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0 top-0 rounded-full bg-tone-danger-bg px-1.5 text-[10px] font-bold text-tone-danger-fg"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
