'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  ChevronRight,
  X,
  BookOpen,
  FileText,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DashboardNotification } from '@/types/dashboard';
import { getNotificationStyle } from '@/features/profile/utils/getNotificationStyle';
import { useNavbarNotifications } from '@/features/home/hooks/useNavbarNotifications';

type HomeNavbarNotificationBellProps = {
  userId: string;
};

type NotificationFilterTab = 'all' | 'unread' | 'assignments' | 'worksheets';

function formatRelativeTime(isoDate: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
    if (diff < 172800) return 'Dün';
    if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
    return new Date(isoDate).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

export function isAssignmentNotification(notification: DashboardNotification): boolean {
  const type = notification.type;
  const title = (notification.title || '').toLowerCase();
  const msg = (notification.message || '').toLowerCase();
  return type === 'assignment' || title.includes('ödev') || msg.includes('ödev');
}

export function isWorksheetNotification(notification: DashboardNotification): boolean {
  if (isAssignmentNotification(notification)) return false;
  const type = notification.type;
  const title = (notification.title || '').toLowerCase();
  const msg = (notification.message || '').toLowerCase();
  return (
    type === 'document' ||
    title.includes('yaprak test') ||
    msg.includes('yaprak test') ||
    title.includes('test') ||
    msg.includes('test')
  );
}

export function resolveNotificationTarget(notification: DashboardNotification): {
  path: string;
} {
  if (isAssignmentNotification(notification)) {
    return { path: '/odevler' };
  }

  const metaHref = (notification.metadata as { href?: string })?.href;
  if (metaHref) {
    return { path: metaHref };
  }

  return { path: '/icerikler' };
}

export function HomeNavbarNotificationBell({
  userId,
}: HomeNavbarNotificationBellProps) {
  const router = useRouter();
  const {
    markAllAsRead,
    markAsRead,
    notifications,
    unreadCount,
  } = useNavbarNotifications(userId);
  const [open, setOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<NotificationFilterTab>('all');
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
    (notification: DashboardNotification) => {
      setOpen(false);
      if (!notification.is_read) {
        void markAsRead(notification.id);
      }
      const target = resolveNotificationTarget(notification);
      if (target.path) {
        router.push(target.path);
      }
    },
    [markAsRead, router],
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filterTab === 'unread') {
        return !n.is_read;
      }
      if (filterTab === 'assignments') {
        return isAssignmentNotification(n);
      }
      if (filterTab === 'worksheets') {
        return isWorksheetNotification(n);
      }
      return true;
    });
  }, [notifications, filterTab]);

  const buttonClasses = `relative inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white`;

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
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white dark:text-white">
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
            className="fixed left-4 right-4 top-[calc(3.5rem+0.25rem+env(safe-area-inset-top))] z-[110] max-h-[75vh] overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[420px]"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b px-4 py-3 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 gap-2"
            >
              <div className="flex items-center gap-2 min-w-0 shrink">
                <h3
                  className="font-bold text-sm text-slate-900 dark:text-white whitespace-nowrap"
                >
                  Bildirimler
                </h3>
                {unreadCount > 0 && (
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                    {unreadCount} yeni
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      void markAllAsRead();
                    }}
                    title="Tümünü okundu işaretle"
                    aria-label="Tümünü oku"
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300 shrink-0"
                  >
                    <CheckCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Tümünü oku</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Kapat"
                  className="rounded-lg p-1.5 transition-colors text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white shrink-0"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Filtre Sekmeleri */}
            <div
              className="flex items-center gap-1.5 border-b px-3 py-2 text-xs border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/40 overflow-x-auto scrollbar-none"
            >
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`shrink-0 px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                  filterTab === 'all'
                    ? 'bg-brand-primary font-bold shadow-xs text-slate-950 dark:text-slate-950'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('unread')}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                  filterTab === 'unread'
                    ? 'bg-brand-primary font-bold shadow-xs text-slate-950 dark:text-slate-950'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                <span>Okunmamış</span>
                {unreadCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      filterTab === 'unread'
                        ? 'bg-slate-950 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('assignments')}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                  filterTab === 'assignments'
                    ? 'bg-brand-primary font-bold shadow-xs text-slate-950 dark:text-slate-950'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                Ödevler
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('worksheets')}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                  filterTab === 'worksheets'
                    ? 'bg-brand-primary font-bold shadow-xs text-slate-950 dark:text-slate-950'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                Yaprak Testler
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto sm:max-h-96">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <Bell className="h-5 w-5 opacity-40" />
                  </div>
                  <p
                    className="text-sm font-medium text-slate-600 dark:text-slate-400"
                  >
                    {filterTab === 'unread'
                      ? 'Harika! Okunmamış yeni bildiriminiz yok.'
                      : filterTab === 'assignments'
                        ? 'Henüz yeni bir ödeviniz bulunmuyor.'
                        : filterTab === 'worksheets'
                          ? 'Henüz yeni bir yaprak test bulunmuyor.'
                          : 'Henüz yeni bir ödev veya yaprak test bulunmuyor.'}
                  </p>
                </div>
              ) : (
                <ul
                  className="divide-y divide-slate-100 dark:divide-slate-800"
                >
                  {filteredNotifications.map((notification) => {
                    const style = getNotificationStyle(notification);
                    const Icon = style.icon;

                    return (
                      <li
                        key={notification.id}
                        className="relative"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleNotificationClick(notification);
                          }}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                            notification.is_read
                              ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                              : 'bg-indigo-50/60 hover:bg-indigo-100/70 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20'
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.iconWrap}`}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </div>
                            {!notification.is_read && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className="truncate text-sm font-semibold text-slate-900 dark:text-white"
                              >
                                {notification.title}
                              </p>
                            </div>
                            {notification.type !== 'message-read' &&
                            notification.message ? (
                              <p
                                className="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-300"
                              >
                                {notification.message}
                              </p>
                            ) : null}
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{formatRelativeTime(notification.created_at)}</span>
                              <span>•</span>
                              <span className="capitalize font-semibold text-indigo-600 dark:text-indigo-400">
                                {isAssignmentNotification(notification)
                                  ? 'Ödev'
                                  : 'Yaprak Test'}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div
              className="border-t px-4 py-2.5 text-center border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80"
            >
              <SafeLink
                href="/profil"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-semibold transition-colors text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Tümünü Gör
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </SafeLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
