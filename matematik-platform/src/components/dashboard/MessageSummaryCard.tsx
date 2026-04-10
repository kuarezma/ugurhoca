"use client";

import { motion } from "framer-motion";
import { Bell, ChevronRight, MessageSquareText } from "lucide-react";
import { DashboardNotification, MessageSummaryProps } from "@/types/dashboard";

interface DashboardMessageSummaryCardProps extends MessageSummaryProps {
  notifications: DashboardNotification[];
  onOpenPanel: () => void;
  onOpenLatest: () => void;
}

export default function MessageSummaryCard({
  unreadCount,
  latestTitle,
  latestMessage,
  notifications,
  onOpenPanel,
  onOpenLatest,
}: DashboardMessageSummaryCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-200">
            <MessageSquareText className="h-3.5 w-3.5" />
            Mesajlar & Bildirimler
          </div>
          <h2 className="text-xl font-bold text-white">
            {unreadCount > 0 ? `${unreadCount} yeni bildirim var` : "Tüm bildirimlerin görüldü"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Son mesajlarını ve öğretmen bildirimlerini buradan takip et.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15">
          <Bell className="h-6 w-6 text-violet-300" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">
          {latestTitle || "Henüz mesaj veya bildirim yok"}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
          {latestMessage || "Yeni bir gelişme olduğunda burada kısa özet göreceksin."}
        </p>
      </div>

      {notifications.length > 0 ? (
        <div className="mt-4 space-y-2">
          {notifications.slice(0, 2).map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={onOpenLatest}
              className="flex w-full items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {notification.title}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(notification.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
              {!notification.is_read ? (
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-400" />
              ) : (
                <ChevronRight className="mt-0.5 h-4 w-4 text-slate-500" />
              )}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onOpenLatest}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/20"
        >
          Son Bildirimi Aç
        </button>
        <button
          type="button"
          onClick={onOpenPanel}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
        >
          Tümünü Gör
        </button>
      </div>
    </motion.section>
  );
}
