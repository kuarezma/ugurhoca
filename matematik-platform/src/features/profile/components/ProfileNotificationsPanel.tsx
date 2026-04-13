'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { DashboardNotification } from '@/types/dashboard';
import { getNotificationStyle } from '@/features/profile/utils/getNotificationStyle';

type ProfileNotificationsPanelProps = {
  notifications: DashboardNotification[];
  unreadCount: number;
  onNotificationClick: (notification: DashboardNotification) => void;
};

export default function ProfileNotificationsPanel({
  notifications,
  unreadCount,
  onNotificationClick,
}: ProfileNotificationsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed left-4 right-4 top-14 z-50 max-h-96 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl sm:left-auto sm:right-4 sm:w-80"
    >
      <div className="flex items-center justify-between border-b border-slate-700 p-4">
        <h3 className="font-bold text-white">Bildirimler</h3>
        <span className="text-xs text-slate-400">{unreadCount} okunmamış</span>
      </div>

      {notifications.length === 0 ? (
        <p className="py-8 text-center text-slate-400">Henüz bildirim yok</p>
      ) : (
        <div className="divide-y divide-slate-700">
          {notifications.map((notification) => {
            const style = getNotificationStyle(notification);
            const Icon = style.icon;

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => onNotificationClick(notification)}
                className={`w-full border-l-4 p-4 text-left transition-colors ${style.wrapper}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.badge}`}
                      >
                        {style.status}
                      </span>
                    </div>
                    {notification.type !== 'message-read' &&
                    notification.message ? (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                        {notification.message}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(notification.created_at).toLocaleDateString(
                        'tr-TR',
                      )}
                    </p>
                  </div>
                  <ChevronRight
                    className={`mt-1 h-4 w-4 ${
                      notification.is_read
                        ? 'text-emerald-400'
                        : 'text-amber-300'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
