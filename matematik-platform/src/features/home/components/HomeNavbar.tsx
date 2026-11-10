'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import { SafeLink } from '@/components/SafeLink';
import { ThemeToggle } from '@/components/ThemeToggle';
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

  const handleOpenCommandPalette = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ugurhoca:open-command-palette'));
    }
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-subtle bg-surface-1/95 font-sans backdrop-blur-xl transition-all duration-300 pt-[env(safe-area-inset-top)] shadow-xs">
      <div className="mx-auto max-w-6xl px-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="flex h-16 w-full items-center justify-between gap-2 sm:gap-4">
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
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-2 border border-subtle text-xl sm:text-2xl transition-transform duration-200 group-hover:scale-105 select-none overflow-hidden p-0.5">
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
              <span className="font-display text-base sm:text-xl font-bold leading-tight truncate text-primary">
                Uğur Hoca
              </span>
              <span className="hidden sm:block text-xs font-black text-secondary uppercase tracking-wider truncate">
                Matematik Maceraları
              </span>
            </div>
          </SafeLink>

          {/* Orta Menü Bağlantıları (Masaüstü) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            <SafeLink
              href="/icerikler?type=yaprak-test"
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-bold text-secondary transition-colors duration-150 hover:bg-surface-2 hover:text-primary"
            >
              <span>📄 Yaprak Testler</span>
            </SafeLink>
            <SafeLink
              href="/oyunlar"
              aria-current={
                pathname?.startsWith('/oyunlar') ? 'page' : undefined
              }
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-bold transition-colors duration-150 ${
                pathname?.startsWith('/oyunlar')
                  ? 'bg-accent-bg text-accent-fg'
                  : 'text-secondary hover:bg-surface-2 hover:text-primary'
              }`}
            >
              <span>🎮 Oyunlar</span>
            </SafeLink>
            <SafeLink
              href="/testler"
              aria-current={
                pathname?.startsWith('/testler') ? 'page' : undefined
              }
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-bold transition-colors duration-150 ${
                pathname?.startsWith('/testler')
                  ? 'bg-accent-bg text-accent-fg'
                  : 'text-secondary hover:bg-surface-2 hover:text-primary'
              }`}
            >
              <span>📝 Testler</span>
            </SafeLink>
            <SafeLink
              href="/programlar"
              aria-current={
                pathname?.startsWith('/programlar') ? 'page' : undefined
              }
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-bold transition-colors duration-150 ${
                pathname?.startsWith('/programlar')
                  ? 'bg-accent-bg text-accent-fg'
                  : 'text-secondary hover:bg-surface-2 hover:text-primary'
              }`}
            >
              <span>🧭 Rehberlik</span>
            </SafeLink>
            <SafeLink
              href="/araclar"
              aria-current={
                pathname?.startsWith('/araclar') ? 'page' : undefined
              }
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-bold transition-colors duration-150 ${
                pathname?.startsWith('/araclar')
                  ? 'bg-accent-bg text-accent-fg'
                  : 'text-secondary hover:bg-surface-2 hover:text-primary'
              }`}
            >
              <span>🧮 Araçlar</span>
            </SafeLink>
            <SafeLink
              href="/icerikler"
              aria-current={pathname === '/icerikler' ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-bold transition-colors duration-150 ${
                pathname === '/icerikler'
                  ? 'bg-accent-bg text-accent-fg'
                  : 'text-secondary hover:bg-surface-2 hover:text-primary'
              }`}
            >
              <span>📚 Konular</span>
            </SafeLink>
            <SafeLink
              href="/canli-ders"
              aria-current={
                pathname?.startsWith('/canli-ders') ? 'page' : undefined
              }
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-bold text-tone-danger-fg bg-tone-danger-bg/50 border border-tone-danger-border transition-colors duration-150 hover:bg-tone-danger-bg"
            >
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              <span>Canlı Ders</span>
            </SafeLink>
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={handleOpenCommandPalette}
              aria-label="Hızlı arama aç"
              className="inline-flex items-center gap-1.5 rounded-xl border border-strong bg-surface-2/80 px-2.5 py-1.5 text-xs font-semibold text-secondary transition-colors duration-150 hover:border-strong hover:bg-surface-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-info"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden xl:inline">Ara</span>
              <kbd className="hidden xl:inline-flex items-center rounded border border-subtle bg-surface-1 px-1 py-0.5 text-[10px] font-semibold text-tertiary">
                ⌘K
              </kbd>
            </button>
            <ThemeToggle compact />
            {showBell && user?.id ? (
              <HomeNavbarNotificationBell userId={user.id} />
            ) : null}
            {user ? (
              <>
                <SafeLink
                  href={profileHref}
                  className="flex items-center gap-2.5 rounded-2xl border border-subtle bg-surface-2 px-3.5 py-1.5 transition-all hover:bg-surface-3 active:translate-y-0.5 active:shadow-none text-primary"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[var(--accent-brand)] text-xs font-bold text-[var(--on-brand)] shadow-xs">
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
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-subtle bg-surface-1 px-4 text-sm font-bold text-primary hover:bg-surface-2"
                >
                  Giriş
                </SafeLink>
                <SafeLink
                  href="/kayit"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-transparent bg-[var(--accent-brand)] px-4 text-sm font-bold text-[var(--on-brand)] hover:opacity-90"
                >
                  Ücretsiz Katıl! 🌟
                </SafeLink>
              </div>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:hidden">
            <button
              type="button"
              onClick={handleOpenCommandPalette}
              aria-label="Hızlı arama aç"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-strong bg-surface-2 transition-colors hover:bg-surface-3 text-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-info"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <ThemeToggle compact />
            {showBell && user?.id ? (
              <HomeNavbarNotificationBell userId={user.id} />
            ) : null}
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary text-secondary hover:bg-surface-2 hover:text-primary"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            >
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          id="mobile-navigation"
          className="animate-fade-in border-t max-h-[calc(100dvh-4.5rem-env(safe-area-inset-top))] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:hidden border-default bg-surface-1/95 backdrop-blur-xl"
        >
          <div className="space-y-1.5 px-4 py-4">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleOpenCommandPalette();
              }}
              className="flex w-full items-center justify-between rounded-xl border border-strong bg-surface-2 px-3.5 py-2.5 text-sm font-bold text-primary hover:bg-surface-3"
            >
              <span className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-accent-fg" aria-hidden="true" />
                <span>Hızlı Arama & Komut Paleti</span>
              </span>
              <kbd className="rounded border border-subtle bg-surface-1 px-1.5 py-0.5 text-xs font-semibold text-tertiary">
                ⌘K
              </kbd>
            </button>
            <SafeLink
              href="/icerikler?type=yaprak-test"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-primary hover:bg-surface-2"
            >
              <span className="text-lg">📄</span> Yaprak Testler & İçerikler
            </SafeLink>
            <SafeLink
              href="/oyunlar"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-primary hover:bg-surface-2"
            >
              <span className="text-lg">🎮</span> Matematik Oyunları
            </SafeLink>
            <SafeLink
              href="/testler"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-primary hover:bg-surface-2"
            >
              <span className="text-lg">📝</span> İnteraktif Testler
            </SafeLink>
            <SafeLink
              href="/programlar"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-primary hover:bg-surface-2"
            >
              <span className="text-lg">🧭</span> LGS & YKS Rehberliği
            </SafeLink>
            <SafeLink
              href="/araclar"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-primary hover:bg-surface-2"
            >
              <span className="text-lg">🧮</span> Matematik & Sınav Araçları
            </SafeLink>
            <SafeLink
              href="/icerikler"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-primary hover:bg-surface-2"
            >
              <span className="text-lg">📚</span> Konular ve Sınıflar
            </SafeLink>
            <SafeLink
              href="/canli-ders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-tone-danger-fg bg-tone-danger-bg hover:bg-surface-2"
            >
              <span className="text-lg">🔴</span> Canlı Ders Odası
            </SafeLink>
            <div className="mt-3 border-t pt-3 border-subtle">
              <div className="mb-3 flex items-center justify-between px-2">
                <span className="text-xs font-bold text-secondary">
                  Görünüm
                </span>
                <ThemeToggle />
              </div>
              {user ? (
                <>
                  <SafeLink
                    href={profileHref}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-secondary hover:bg-surface-2 hover:text-primary"
                  >
                    {user.isAdmin ? 'Admin Paneli' : 'Öğrenci Profili'}
                  </SafeLink>
                  {user.isAdmin && (
                    <SafeLink
                      href="/profil"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-secondary hover:bg-surface-2 hover:text-primary"
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
                    className="flex w-full min-h-[44px] items-center rounded-xl px-3.5 py-2 text-left text-sm font-semibold text-rose-600 dark:text-red-400 hover:bg-red-500/10 hover:text-rose-700 dark:hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <SafeLink
                    href="/giris"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-subtle bg-surface-1 px-4 text-sm font-bold text-primary hover:bg-surface-2"
                  >
                    Giriş
                  </SafeLink>
                  <SafeLink
                    href="/kayit"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-transparent bg-[var(--accent-brand)] px-4 text-sm font-bold text-[var(--on-brand)] hover:opacity-90"
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
