'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SafeLink } from '@/components/SafeLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';
import { HOME_CATEGORIES } from '@/features/home/constants';
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
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isHomePage = pathname === '/';
  const profileHref = user?.isAdmin ? '/admin' : '/profil';
  const showBell = Boolean(user?.id);
  const showMessages = Boolean(user?.id);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        isLight
          ? 'border-slate-200/90 bg-white/90 shadow-sm'
          : 'border-white/10 bg-slate-900/90 shadow-xl'
      }`}
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
            className="group flex min-w-0 shrink items-center gap-2 sm:gap-2.5"
          >
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/ugur.jpeg"
                alt="Uğur Hoca"
                width={40}
                height={40}
                className="h-full w-full rounded-[14px] object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={`font-display text-sm sm:text-lg font-bold leading-tight truncate ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Uğur Hoca
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider truncate">
                Matematik Platformu
              </span>
            </div>
          </SafeLink>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <ThemeToggle compact />
            {showMessages && user?.id ? (
              <HomeNavbarMessagesButton
                userId={user.id}
                userName={user.name || ''}
                userEmail={user.email || ''}
                isLight={isLight}
              />
            ) : null}
            {showBell && user?.id ? (
              <HomeNavbarNotificationBell userId={user.id} isLight={isLight} />
            ) : null}
            {user ? (
              <>
                <SafeLink
                  href={profileHref}
                  className={`flex items-center gap-2.5 rounded-2xl border px-3 py-1.5 transition-all ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-bold text-white shadow">
                    {user.name?.[0] || '?'}
                  </div>
                  <span className="font-semibold text-xs xl:inline">
                    {user.name?.split(' ')[0]}
                  </span>
                </SafeLink>
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Çıkış yap"
                  title="Çıkış yap"
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isLight
                      ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <SafeLink
                  href="/giris"
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                    isLight
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Giriş Yap
                </SafeLink>
                <SafeLink
                  href="/kayit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  Ücretsiz Kayıt
                </SafeLink>
              </>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:hidden">
            {showMessages && user?.id ? (
              <HomeNavbarMessagesButton
                userId={user.id}
                userName={user.name || ''}
                userEmail={user.email || ''}
                isLight={isLight}
              />
            ) : null}
            {showBell && user?.id ? (
              <HomeNavbarNotificationBell userId={user.id} isLight={isLight} />
            ) : null}
            <button
              type="button"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/5'
              }`}
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
          className={`animate-fade-in border-t lg:hidden ${
            isLight
              ? 'border-slate-200 bg-white/95 backdrop-blur-xl'
              : 'border-white/10 bg-slate-950/95 backdrop-blur-xl'
          }`}
        >
          <div className="space-y-1.5 px-4 py-4">
            {HOME_CATEGORIES.map((category) => (
              <SafeLink
                key={category.id}
                href={category.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  isLight
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <category.icon className="h-5 w-5 text-brand-primary-soft" />
                {category.title}
              </SafeLink>
            ))}
            <div
              className={`mt-3 border-t pt-3 ${
                isLight ? 'border-slate-200' : 'border-white/10'
              }`}
            >
              <div className="mb-3">
                <ThemeToggle className="w-full justify-center" />
              </div>
              {user ? (
                <>
                  <SafeLink
                    href={profileHref}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                      isLight
                        ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {user.isAdmin ? 'Admin Paneli' : 'Öğrenci Profili'}
                  </SafeLink>
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
                    className={`flex items-center justify-center rounded-xl border px-3 py-2.5 text-center text-xs font-bold transition-colors ${
                      isLight
                        ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                        : 'border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Giriş Yap
                  </SafeLink>
                  <SafeLink
                    href="/kayit"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange px-3 py-2.5 text-center text-xs font-bold text-white shadow-md transition-transform active:scale-95"
                  >
                    Ücretsiz Kayıt
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
