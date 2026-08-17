'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
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
  const showStudentBell = Boolean(user && !user.isAdmin && user.id);
  const showStudentMessages = showStudentBell;

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        isLight
          ? 'border-slate-200/80 bg-white/85 shadow-sm'
          : 'border-white/10 bg-slate-900/85 shadow-2xl'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="flex h-16 w-full items-center gap-3 sm:gap-4">
          <Link
            href="/"
            aria-current={isHomePage ? 'page' : undefined}
            onClick={(event) => {
              if (isHomePage) {
                event.preventDefault();
              }
            }}
            className="group flex shrink-0 items-center gap-2.5"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary via-brand-pink to-brand-orange p-0.5 shadow-md transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/ugur.jpeg"
                alt="Uğur Hoca"
                width={40}
                height={40}
                className="h-full w-full rounded-[14px] object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-display text-base font-bold sm:text-lg leading-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Uğur Hoca
              </span>
              <span className="text-[10px] font-semibold text-brand-primary-soft uppercase tracking-wider">
                Matematik Platformu
              </span>
            </div>
          </Link>

          {/* Orta menü */}
          <div className="hidden min-h-0 min-w-0 flex-1 items-center lg:flex">
            <nav
              aria-label="Ana menü"
              className="mx-auto flex max-w-full items-center gap-1.5 overflow-x-auto overflow-y-hidden py-1 [scrollbar-width:thin]"
            >
              {HOME_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={category.href}
                  className={`shrink-0 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    isLight
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {category.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <ThemeToggle compact />
            {showStudentMessages && user?.id ? (
              <HomeNavbarMessagesButton
                userId={user.id}
                userName={user.name || ''}
                userEmail={user.email || ''}
                isLight={isLight}
              />
            ) : null}
            {showStudentBell && user?.id ? (
              <HomeNavbarNotificationBell userId={user.id} isLight={isLight} />
            ) : null}
            {user ? (
              <>
                <Link
                  href={profileHref}
                  className={`flex items-center gap-2.5 rounded-2xl border px-3 py-1.5 transition-all ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-pink text-xs font-bold text-white shadow">
                    {user.name?.[0] || '?'}
                  </div>
                  <span className="font-semibold text-xs xl:inline">
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Çıkış yap"
                  title="Çıkış yap"
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
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
                <Link
                  href="/giris"
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                    isLight
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  className="rounded-xl bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange px-4 py-2 text-xs font-bold text-white shadow-brand-glow transition-transform hover:scale-105 active:scale-95"
                >
                  Ücretsiz Kayıt
                </Link>
              </>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:hidden">
            {showStudentMessages && user?.id ? (
              <HomeNavbarMessagesButton
                userId={user.id}
                userName={user.name || ''}
                userEmail={user.email || ''}
                isLight={isLight}
              />
            ) : null}
            {showStudentBell && user?.id ? (
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
              ? 'border-slate-200 bg-white'
              : 'border-slate-800 bg-slate-900'
          }`}
        >
          <div className="space-y-2 px-4 py-4">
            {HOME_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isLight
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <category.icon className="h-5 w-5" />
                {category.title}
              </Link>
            ))}
            <div
              className={`mt-3 border-t pt-3 ${
                isLight ? 'border-slate-200' : 'border-slate-700'
              }`}
            >
              <div className="mb-3">
                <ThemeToggle className="w-full justify-center" />
              </div>
              {user ? (
                <>
                  <Link
                    href={profileHref}
                    className={`block py-2 ${
                      isLight
                        ? 'text-slate-700 hover:text-slate-900'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {user.isAdmin ? 'Admin Panel' : 'Profil'}
                  </Link>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="min-h-[44px] py-2 text-left text-red-400 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/giris"
                    className={`block py-2 ${
                      isLight
                        ? 'text-slate-700 hover:text-slate-900'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Giriş
                  </Link>
                  <Link
                    href="/kayit"
                    className="mt-2 block rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 py-2 text-center font-semibold text-white"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
