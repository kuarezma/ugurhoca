'use client';

import Image from 'next/image';
import { ArrowLeft, Bell, LogOut } from 'lucide-react';
import { SafeLink as Link } from '@/components/SafeLink';

export type ProfileNavProps = {
  isAdmin: boolean;
  unreadCount: number;
  onToggleNotifications: () => void;
  onLogout: () => void;
};

export function ProfileNav({
  isAdmin,
  unreadCount,
  onToggleNotifications,
  onLogout,
}: ProfileNavProps) {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-default bg-surface-1/90 backdrop-blur-xl transition-all duration-300 pt-[env(safe-area-inset-top)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl p-0.5 shadow-md transition-transform duration-300 group-hover:scale-105 bg-brand-primary">
            <Image
              src="/ugur.jpeg"
              alt="Uğur Hoca"
              width={40}
              height={40}
              priority
              className="h-full w-full rounded-[10px] object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base font-extrabold tracking-tight text-primary">
              Uğur Hoca
            </span>
            <span className="text-[10px] font-bold text-secondary">
              Öğrenci Paneli
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isAdmin && (
            <button
              type="button"
              onClick={onToggleNotifications}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-default bg-surface-2 text-secondary transition-colors hover:bg-overlay-2 hover:text-primary"
              aria-label="Bildirimler"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white dark:text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-default bg-surface-2 px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:bg-overlay-2 hover:text-primary sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Ana Sayfa</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-default bg-surface-2 text-secondary transition-colors hover:bg-red-500/20 hover:text-red-400"
            aria-label="Çıkış Yap"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
