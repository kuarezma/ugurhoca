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
      className={`fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-lg ${
        isLight
          ? 'border-slate-200/90 bg-white/90 shadow-sm shadow-slate-200/80'
          : 'border-slate-800/50 bg-slate-900/95'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="flex h-14 w-full items-center gap-2 sm:gap-3">
          <Link
            href="/"
            aria-current={isHomePage ? 'page' : undefined}
            onClick={(event) => {
              if (isHomePage) {
                event.preventDefault();
              }
            }}
            className="flex shrink-0 items-center gap-2"
          >
            <Image
              src="/ugur.jpeg"
              alt="Uğur Hoca"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span
              className={`text-lg font-bold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Uğur Hoca
            </span>
          </Link>

          {/* Orta menü: dar genişlikte taşma yerine yatay kaydır — tüm tarayıcılar + PWA */}
          <div className="hidden min-h-0 min-w-0 flex-1 items-center lg:flex">
            <nav
              aria-label="Ana menü"
              className="mx-auto flex max-w-full items-center gap-2 overflow-x-auto overflow-y-hidden py-1 [scrollbar-width:thin] xl:gap-3"
            >
              {HOME_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={category.href}
                  className={`shrink-0 whitespace-nowrap text-sm font-medium transition-colors ${
                    isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {category.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 lg:flex xl:gap-2.5">
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
                  className={`flex items-center gap-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold">
                    {user.name?.[0] || '?'}
                  </div>
                  <span className="hidden font-medium xl:inline">
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Çıkış yap"
                  title="Çıkış yap"
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                    isLight
                      ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/giris"
                  className={`text-sm font-medium transition-colors ${
                    isLight
                      ? 'text-slate-700 hover:text-slate-900'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Giriş
                </Link>
                <Link
                  href="/kayit"
                  className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600"
                >
                  Kayıt Ol
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
