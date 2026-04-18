'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';
import { HOME_CATEGORIES } from '@/features/home/constants';
import type { AppUser } from '@/types';

type HomeNavbarProps = {
  onLogout: () => void;
  user: AppUser | null;
};

export function HomeNavbar({ onLogout, user }: HomeNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const profileHref = user?.isAdmin ? '/admin' : '/profil';

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-lg ${
        isLight
          ? 'border-slate-200/90 bg-white/90 shadow-sm shadow-slate-200/80'
          : 'border-slate-800/50 bg-slate-900/95'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
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

          <div className="hidden items-center gap-6 md:flex">
            {HOME_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className={`text-sm font-medium transition-colors ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {category.title}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle compact />
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
                  <span className="font-medium">
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={onLogout}
                  className={`ml-2 transition-colors ${
                    isLight
                      ? 'text-slate-500 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogOut className="h-5 w-5" />
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

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className={`animate-fade-in border-t md:hidden ${
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
                  <button onClick={onLogout} className="py-2 text-red-400">
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
