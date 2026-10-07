'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, MessageSquareText } from 'lucide-react';
import type {
  DashboardNotification,
  DashboardNotificationFilter,
} from '@/types/dashboard';

interface DashboardMessageSummaryCardProps {
  notifications: DashboardNotification[];
  onMarkAllAsRead: () => void;
  onOpenNotification: (notification: DashboardNotification) => void;
  onOpenPanel: () => void;
  unreadCount: number;
}

const filters: Array<{
  id: DashboardNotificationFilter;
  label: string;
}> = [
  { id: 'all', label: 'Tümü' },
  { id: 'messages', label: 'Mesajlar' },
  { id: 'assignments', label: 'Ödev' },
  { id: 'documents', label: 'Belgeler' },
];

const matchesFilter = (
  notification: DashboardNotification,
  filter: DashboardNotificationFilter,
) => {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'messages') {
    return (
      notification.type === 'message' ||
      notification.type === 'admin-message' ||
      notification.type === 'message-read'
    );
  }

  if (filter === 'assignments') {
    return notification.type === 'assignment';
  }

  return notification.type === 'document';
};

export default function MessageSummaryCard({
  notifications,
  onMarkAllAsRead,
  onOpenNotification,
  onOpenPanel,
  unreadCount,
}: DashboardMessageSummaryCardProps) {
  const [activeFilter, setActiveFilter] =
    useState<DashboardNotificationFilter>('all');

  const filteredNotifications = useMemo(
    () =>
      notifications
        .filter((notification) => matchesFilter(notification, activeFilter))
        .slice(0, 4),
    [activeFilter, notifications],
  );

  const latestNotification =
    filteredNotifications[0] || notifications[0] || null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-200 border border-violet-500/20 dark:border-transparent">
            <MessageSquareText className="h-3.5 w-3.5" />
            Bildirim Akışı
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {unreadCount > 0
              ? `${unreadCount} okunmamış bildirim var`
              : 'Bildirimlerin güncel'}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Mesaj, ödev ve belge sinyallerini tek blokta yönet.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15">
          <Bell className="h-6 w-6 text-violet-600 dark:text-violet-300" />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
              activeFilter === filter.id
                ? 'bg-brand-primary dark:bg-brand-primary/20 text-slate-950 dark:text-brand-primary-soft'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/90 p-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {latestNotification?.title || 'Henüz bildirim görünmüyor'}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          {latestNotification?.message ||
            'Yeni bir hareket olduğunda burada kısa özetini göreceksin.'}
        </p>
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="mt-4 space-y-2">
          {filteredNotifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => onOpenNotification(notification)}
              className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/90 px-4 py-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {notification.title}
                  </p>
                  {!notification.is_read ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-500 dark:bg-violet-400" />
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                  {notification.type === 'message-read' && !notification.message
                    ? 'Mesajının görüldüğüne dair kısa bilgi.'
                    : notification.message || 'Ek içerik bulunmuyor.'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(notification.created_at).toLocaleDateString(
                    'tr-TR',
                  )}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 px-5 py-7 text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Bu filtrede bildirim yok
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Farklı bir filtre seçebilir ya da tüm akışı açabilirsin.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onOpenPanel}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-700 dark:text-violet-200 border border-violet-500/20 transition-colors hover:bg-violet-500/25"
        >
          Tüm Akışı Aç
        </button>
        <button
          type="button"
          disabled={unreadCount === 0}
          onClick={onMarkAllAsRead}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white transition-colors hover:bg-slate-200 dark:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tümünü Okundu Yap
        </button>
      </div>
    </motion.section>
  );
}
