"use client";

import { motion } from "framer-motion";
import {
  Bell,
  BellOff,
  BellRing,
  Check,
  CheckCheck,
  MessageSquareText,
  Reply,
} from "lucide-react";
import type { AdminNotification } from "@/features/admin/types";

type AdminNotificationsPanelProps = {
  formatRelativeTime: (dateStr: string | Date | number) => string;
  getNotificationBody: (
    notification: AdminNotification | null,
  ) => string;
  isIncomingAdminMessage: (notification: AdminNotification) => boolean;
  notifications: AdminNotification[];
  onSelectNotification: (notification: AdminNotification) => void;
  unreadCount: number;
};

export default function AdminNotificationsPanel({
  formatRelativeTime,
  getNotificationBody,
  isIncomingAdminMessage,
  notifications,
  onSelectNotification,
  unreadCount,
}: AdminNotificationsPanelProps) {
  const incomingNotifications = notifications.filter(isIncomingAdminMessage);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed top-20 right-4 left-4 sm:left-auto sm:w-[450px] z-50 max-h-[75vh] flex flex-col rounded-3xl border border-slate-700/60 bg-[#0f172a]/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
    >
      <div className="p-5 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Bildirimler</h3>
            <p className="text-indigo-200/60 text-xs font-medium">
              Öğrenci mesajları ve istekler
            </p>
          </div>
        </div>
        <div className="bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-bold shadow-inner">
          {unreadCount} Okunmamış
        </div>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar pb-2">
        {incomingNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center opacity-70">
            <BellOff className="w-16 h-16 text-slate-500 mb-4" />
            <p className="text-slate-300 font-medium text-lg">Tertemiz!</p>
            <p className="text-slate-500 text-sm mt-1">
              Sistemde mesaj veya bildirim bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 p-2">
            {incomingNotifications.map((notification) => {
              const isReadReceipt = notification.title
                .toLowerCase()
                .includes("okundu");
              const isSubmission = notification.title
                .toLowerCase()
                .includes("teslim");
              const isReply = notification.title
                .toLowerCase()
                .includes("cevapladı");
              const isMessage = notification.title
                .toLowerCase()
                .includes("sana yazdı");
              const isNew = !notification.is_read;

              return (
                <button
                  key={notification.id}
                  onClick={() => onSelectNotification(notification)}
                  className={`relative w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                    !isNew
                      ? "bg-slate-800/10 border-transparent hover:bg-slate-800/40 text-slate-400"
                      : "bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/20 shadow-sm"
                  }`}
                >
                  {isNew && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  )}

                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner ${
                        !isNew
                          ? "bg-slate-800 border-slate-700/50 text-slate-500"
                          : isReply
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
                            : isReadReceipt
                              ? "bg-blue-500/20 border-blue-500/30 text-blue-400 shadow-blue-500/10"
                              : isSubmission
                                ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 shadow-cyan-500/10"
                                : isMessage
                                  ? "bg-purple-500/20 border-purple-500/30 text-purple-400 shadow-purple-500/10"
                                  : "bg-indigo-500/20 border-indigo-500/30 text-indigo-400 shadow-indigo-500/10"
                      }`}
                    >
                      {isReadReceipt ? (
                        <CheckCheck className="w-6 h-6" />
                      ) : isSubmission ? (
                        <Check className="w-6 h-6" />
                      ) : isReply ? (
                        <Reply className="w-6 h-6" />
                      ) : isMessage ? (
                        <MessageSquareText className="w-6 h-6" />
                      ) : (
                        <Bell className="w-6 h-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p
                          className={`font-semibold text-sm truncate ${
                            !isNew ? "text-slate-400" : "text-white"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {isNew ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold mt-0.5 shadow-sm border border-amber-500/10">
                            Yeni
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap mt-1">
                            {formatRelativeTime(notification.created_at)}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs line-clamp-2 leading-relaxed ${
                          !isNew ? "text-slate-500" : "text-slate-300"
                        }`}
                      >
                        {getNotificationBody(notification)}
                      </p>
                      {isNew && (
                        <span className="text-[10px] text-indigo-400/80 font-medium whitespace-nowrap mt-2 block">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
