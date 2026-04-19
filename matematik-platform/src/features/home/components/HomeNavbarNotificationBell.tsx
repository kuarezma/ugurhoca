'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DashboardNotification } from '@/types/dashboard';
import { getNotificationStyle } from '@/features/profile/utils/getNotificationStyle';
import { useNavbarNotifications } from '@/features/home/hooks/useNavbarNotifications';

type HomeNavbarNotificationBellProps = {
  userId: string;
  isLight: boolean;
};

export function HomeNavbarNotificationBell({
  userId,
  isLight,
}: HomeNavbarNotificationBellProps) {
  const router = useRouter();
  const { markAllAsRead, markAsRead, notifications, unreadCount } =
    useNavbarNotifications(userId);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleNotificationClick = useCallback(
    async (notification: DashboardNotification) => {
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
      setOpen(false);
      router.push('/profil');
    },
    [markAsRead, router],
  );

  const buttonClasses = `relative inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
    isLight
      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          unreadCount > 0
            ? `Bildirimler: ${unreadCount} okunmamış`
            : 'Bildirimler'
        }
        aria-expanded={open}
        aria-haspopup="menu"
        className={buttonClasses}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className={`fixed left-4 right-4 top-[calc(3.5rem+0.25rem+env(safe-area-inset-top))] z-50 max-h-[70vh] overflow-hidden rounded-2xl border shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 ${
              isLight
                ? 'border-slate-200 bg-white'
                : 'border-slate-700 bg-slate-900'
            }`}
          >
            <div
              className={`flex items-center justify-between border-b px-4 py-3 ${
                isLight ? 'border-slate-200' : 'border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <h3
                  className={`font-semibold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Bildirimler
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-500">
                    {unreadCount} yeni
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      void markAllAsRead();
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                      isLight
                        ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Tümünü okundu yap
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Kapat"
                  className={`rounded-lg p-1.5 transition-colors ${
                    isLight
                      ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto sm:max-h-96">
              {notifications.length === 0 ? (
                <p
                  className={`py-10 text-center text-sm ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Henüz bildirim yok
                </p>
              ) : (
                <ul
                  className={`divide-y ${
                    isLight ? 'divide-slate-100' : 'divide-slate-800'
                  }`}
                >
                  {notifications.map((notification) => {
                    const style = getNotificationStyle(notification);
                    const Icon = style.icon;

                    return (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => {
                            void handleNotificationClick(notification);
                          }}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                            notification.is_read
                              ? isLight
                                ? 'hover:bg-slate-50'
                                : 'hover:bg-slate-800/60'
                              : isLight
                                ? 'bg-indigo-50/60 hover:bg-indigo-100'
                                : 'bg-indigo-500/10 hover:bg-indigo-500/15'
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`truncate text-sm font-medium ${
                                  isLight ? 'text-slate-900' : 'text-white'
                                }`}
                              >
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                              )}
                            </div>
                            {notification.type !== 'message-read' &&
                            notification.message ? (
                              <p
                                className={`mt-0.5 line-clamp-2 text-xs ${
                                  isLight ? 'text-slate-500' : 'text-slate-400'
                                }`}
                              >
                                {notification.message}
                              </p>
                            ) : null}
                            <p
                              className={`mt-1 text-[11px] ${
                                isLight ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {new Date(
                                notification.created_at,
                              ).toLocaleString('tr-TR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <ChevronRight
                            className={`mt-1 h-4 w-4 flex-shrink-0 ${
                              isLight ? 'text-slate-400' : 'text-slate-500'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div
              className={`border-t px-4 py-2 text-center ${
                isLight ? 'border-slate-200' : 'border-slate-700'
              }`}
            >
              <Link
                href="/profil"
                onClick={() => setOpen(false)}
                className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                  isLight
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-indigo-300 hover:text-indigo-200'
                }`}
              >
                Tümünü Gör
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
