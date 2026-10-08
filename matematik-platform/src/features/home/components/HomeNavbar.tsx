'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SafeLink } from '@/components/SafeLink';
import { HomeNavbarMessagesButton } from '@/features/home/components/HomeNavbarMessagesButton';
import { HomeNavbarNotificationBell } from '@/features/home/components/HomeNavbarNotificationBell';
import type { AppUser } from '@/types';

type HomeNavbarProps = {
  onLogout: () => void;
  user: AppUser | null;
};

export function HomeNavbar({ onLogout, user }: HomeNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const profileHref = user?.isAdmin ? '/admin' : '/profil';
  const showBell = Boolean(user?.id);
  const showMessages = Boolean(user?.id);

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 border-b-2 sm:border-b-3 border-default bg-surface-1/95 backdrop-blur-xl transition-all duration-300 pt-[env(safe-area-inset-top)] shadow-xs"
    >
      <div className="mx-auto max-w-6xl px-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="flex h-16 w-full items-center justify-between gap-3 sm:gap-4">
          <SafeLink
            href="/"
            aria-current={isHomePage ? 'page' : undefined}
            onClick={(event) => {
              if (isHomePage) {
                event.preventDefault();
              }
            }}
            className="group flex min-w-0 shrink items-center gap-2.5 sm:gap-3"
          >
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d7ffb8] border-2 border-[#58cc02] shadow-[0_3px_0_#46a302] text-xl sm:text-2xl transition-transform duration-200 group-hover:scale-105 select-none overflow-hidden p-0.5">
              <Image
                src="/ugur.jpeg"
                alt="Uğur Hoca"
                width={44}
                height={44}
                priority
                className="h-full w-full rounded-[14px] object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display text-base sm:text-xl font-black leading-tight truncate text-primary">
                Uğur Hoca
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-green-ink dark:text-[#61e002] uppercase tracking-wider truncate">
                Matematik Maceraları
              </span>
            </div>
          </SafeLink>


          {/* Orta Menü Bağlantıları (Masaüstü) */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            <SafeLink
              href="/icerikler?type=yaprak-test"
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-secondary transition-all hover:bg-surface-2 hover:text-primary"
            >
              <span>📄 Yaprak Testler</span>
            </SafeLink>
            <SafeLink
              href="/oyunlar"
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-secondary transition-all hover:bg-surface-2 hover:text-primary"
            >
              <span>🎮 Oyunlar</span>
            </SafeLink>
            <SafeLink
              href="/icerikler"
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-secondary transition-all hover:bg-surface-2 hover:text-primary"
            >
              <span>📚 Konular & Sınıflar</span>
            </SafeLink>
            <SafeLink
              href="/canli-ders"
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-tone-danger-fg bg-tone-danger-bg/50 border border-tone-danger-border transition-all hover:bg-tone-danger-bg"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>Canlı Ders</span>
            </SafeLink>
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {showMessages && user?.id ? (
              <HomeNavbarMessagesButton
                userId={user.id}
                userName={user.name || ''}
                userEmail={user.email || ''}
              />
            ) : null}
            {showBell && user?.id ? (
              <HomeNavbarNotificationBell userId={user.id} />
            ) : null}
            {user ? (
              <>
                <SafeLink
                  href={profileHref}
                  className="flex items-center gap-2.5 rounded-2xl border-2 border-default bg-surface-2 px-3.5 py-1.5 shadow-[0_3px_0_var(--border-default)] transition-all hover:bg-surface-3 active:translate-y-0.5 active:shadow-none text-primary"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#58cc02] text-xs font-black text-slate-950 dark:text-slate-950 shadow-xs">
                    {user.name?.[0] || '?'}
                  </div>
                  <span className="font-bold text-xs xl:inline">
                    {user.name?.split(' ')[0]}
                  </span>
                </SafeLink>
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Çıkış yap"
                  title="Çıkış yap"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-default bg-surface-2 transition-colors hover:bg-rose-500/10 hover:text-rose-500 text-secondary"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <SafeLink
                  href="/giris"
                  className="btn-3d btn-white btn-sm"
                >
                  Giriş
                </SafeLink>
                <SafeLink
                  href="/kayit"
                  className="btn-3d btn-green btn-sm"
                >
                  Ücretsiz Katıl! 🌟
                </SafeLink>
              </div>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:hidden">
            {showMessages && user?.id ? (
              <HomeNavbarMessagesButton
                userId={user.id}
                userName={user.name || ''}
                userEmail={user.email || ''}
              />
            ) : null}
            {showBell && user?.id ? (
              <HomeNavbarNotificationBell userId={user.id} />
            ) : null}
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-white/5"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            >
              {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          id="mobile-navigation"
          className="animate-fade-in border-t max-h-[calc(100dvh-4.5rem-env(safe-area-inset-top))] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:hidden border-slate-200 bg-white/95 backdrop-blur-xl"
        >
          <div className="space-y-1.5 px-4 py-4">
            <SafeLink
              href="/icerikler?type=yaprak-test"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100"
            >
              <span className="text-lg">📄</span> Yaprak Testler & İçerikler
            </SafeLink>
            <SafeLink
              href="/oyunlar"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100"
            >
              <span className="text-lg">🎮</span> Matematik Oyunları
            </SafeLink>
            <SafeLink
              href="/icerikler"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100"
            >
              <span className="text-lg">📚</span> Konular ve Sınıflar
            </SafeLink>
            <SafeLink
              href="/canli-ders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100"
            >
              <span className="text-lg">🔴</span> Canlı Ders Odası
            </SafeLink>
            <div className="mt-3 border-t pt-3 border-slate-200">
              {user ? (
                <>
                  <SafeLink
                    href={profileHref}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    {user.isAdmin ? 'Admin Paneli' : 'Öğrenci Profili'}
                  </SafeLink>
                  {user.isAdmin && (
                    <SafeLink
                      href="/profil"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      Kullanıcı / Öğrenci Profili
                    </SafeLink>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onLogout();
                    }}
                    className="flex w-full min-h-[44px] items-center rounded-xl px-3.5 py-2 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <SafeLink
                    href="/giris"
                    onClick={() => setIsOpen(false)}
                    className="btn-3d btn-white btn-sm"
                  >
                    Giriş
                  </SafeLink>
                  <SafeLink
                    href="/kayit"
                    onClick={() => setIsOpen(false)}
                    className="btn-3d btn-green btn-sm"
                  >
                    Ücretsiz Katıl! 🌟
                  </SafeLink>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
