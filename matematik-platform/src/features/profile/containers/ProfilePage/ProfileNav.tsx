'use client';

import { Bell, LogOut } from 'lucide-react';
import { SitePageNavigation } from '@/components/SitePageNavigation';

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
    <SitePageNavigation
      subtitle={isAdmin ? 'Yönetici Görünümü' : 'Öğrenci Paneli'}
      hideAccountLink
      rightSlot={
        <>
          {!isAdmin && (
            <button
              type="button"
              onClick={onToggleNotifications}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-default bg-surface-2 text-secondary transition-colors hover:bg-surface-3 hover:text-primary"
              aria-label="Bildirimler"
            >
              <Bell className="h-4.5 w-4.5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-tone-danger-border bg-tone-danger-bg px-1 text-[10px] font-bold text-tone-danger-fg">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-default bg-surface-2 text-secondary transition-colors hover:border-tone-danger-border hover:bg-tone-danger-bg hover:text-tone-danger-fg"
            aria-label="Çıkış Yap"
          >
            <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </>
      }
    />
  );
}
