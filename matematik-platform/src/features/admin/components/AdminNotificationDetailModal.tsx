'use client';

import { Ban, Flag, Paperclip, Send, Trash2, VolumeX, X } from 'lucide-react';
import type {
  AdminNotification,
  ModerationPayload,
} from '@/features/admin/types';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

type SenderActionStatus = {
  blocked: boolean;
  expires_at: string | null;
  muted: boolean;
};

type AdminNotificationDetailModalProps = {
  getMetadataText: (value: unknown) => string;
  getNotificationBody: (notification: AdminNotification | null) => string;
  notification: AdminNotification;
  onClose: () => void;
  onDelete: (notificationId: string) => void;
  onModerationAction: (action: 'block' | 'mute' | 'report') => void;
  onReplyTextChange: (value: string) => void;
  onSendReply: () => void;
  payload: ModerationPayload | null;
  replyText: string;
  status: SenderActionStatus;
};

export default function AdminNotificationDetailModal({
  getMetadataText,
  getNotificationBody,
  notification,
  onClose,
  onDelete,
  onModerationAction,
  onReplyTextChange,
  onSendReply,
  payload,
  replyText,
  status,
}: AdminNotificationDetailModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(true, onClose);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-notification-title"
        tabIndex={-1}
        className="relative w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-fade-up"
      >
        <div className="p-5 border-b border-slate-700 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-300 mb-2">
              Öğrenci Mesajı
            </p>
            <h3 id="admin-notification-title" className="text-2xl font-bold text-white">
              {notification.title}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {new Date(notification.created_at).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(notification.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-red-300 hover:bg-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              Sil
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-slate-200 whitespace-pre-line leading-relaxed">
            {getNotificationBody(notification)}
          </p>
          {payload?.metadata && (
            <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-3 text-xs text-slate-300 space-y-1">
              <p>IP: {getMetadataText(payload.metadata.ip)}</p>
              <p className="truncate">
                Cihaz: {getMetadataText(payload.metadata.user_agent)}
              </p>
              <p>
                Zaman:{' '}
                {new Date(
                  payload.created_at || notification.created_at,
                ).toLocaleString('tr-TR')}
              </p>
            </div>
          )}
          {payload?.sender_id && (
            <div className="flex flex-wrap items-center gap-2">
              {status.blocked && (
                <span className="px-2 py-1 rounded-full text-[11px] bg-red-500/20 text-red-300">
                  Bu kullanıcı engelli
                </span>
              )}
              {status.muted && status.expires_at && (
                <span className="px-2 py-1 rounded-full text-[11px] bg-amber-500/20 text-amber-300">
                  Sessizde (bitiş:{' '}
                  {new Date(status.expires_at).toLocaleDateString('tr-TR')})
                </span>
              )}
            </div>
          )}
          {(payload?.attachments?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">Ekler</p>
              <div className="flex flex-wrap gap-2">
                {payload?.attachments?.map((file) => (
                  <a
                    key={file.url}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                    {file.name}
                  </a>
                ))}
              </div>
            </div>
          )}
          {notification.type === 'message' && payload?.sender_id && (
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onModerationAction('report')}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-700/60 px-3 py-2 text-slate-200 hover:bg-slate-700"
                >
                  <Flag className="w-4 h-4" />
                  Raporla
                </button>
                <button
                  type="button"
                  onClick={() => onModerationAction('mute')}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-3 py-2 text-amber-300 hover:bg-amber-500/30"
                >
                  <VolumeX className="w-4 h-4" />7 Gün Sessize Al
                </button>
                <button
                  type="button"
                  onClick={() => onModerationAction('block')}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-red-300 hover:bg-red-500/30"
                >
                  <Ban className="w-4 h-4" />
                  Engelle
                </button>
              </div>
              <label
                htmlFor="admin-notification-reply"
                className="block text-slate-300 text-sm"
              >
                Cevap yaz
              </label>
              <textarea
                id="admin-notification-reply"
                rows={4}
                value={replyText}
                onChange={(event) => onReplyTextChange(event.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                placeholder="Öğrenciye cevap yaz..."
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onSendReply}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Gönder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
