'use client';

import { MessageCircle, X } from 'lucide-react';
import type { ConversationPreview } from './types';

export type ChatBubbleAdminInboxProps = {
  isLight: boolean;
  adminTotalUnread: number;
  conversations: ConversationPreview[];
  onRefresh: () => void;
  onClose: () => void;
  onSelectStudent: (studentId: string) => void;
};

export function ChatBubbleAdminInbox({
  isLight,
  adminTotalUnread,
  conversations,
  onRefresh,
  onClose,
  onSelectStudent,
}: ChatBubbleAdminInboxProps) {
  return (
    <>
      <div
        className={`flex shrink-0 items-center gap-2 border-b px-4 py-3.5 ${
          isLight
            ? 'border-slate-200 bg-white'
            : 'border-slate-800 bg-slate-900'
        }`}
      >
        <h2
          className={`text-sm font-bold ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Öğrenci Sohbetleri
        </h2>
        {adminTotalUnread > 0 && (
          <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[11px] font-bold text-red-500 dark:text-red-400">
            {adminTotalUnread} yeni
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onRefresh}
            className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
              isLight
                ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Yenile
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-1.5 transition ${
              isLight
                ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
        style={{ overscrollBehavior: 'contain' }}
      >
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
            <MessageCircle className="h-10 w-10 text-slate-400 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Henüz öğrenci mesajı bulunmuyor.
            </p>
          </div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.studentId}
              type="button"
              onClick={() => onSelectStudent(c.studentId)}
              className={`flex w-full items-start gap-3 border-b px-4 py-3.5 text-left transition-colors ${
                isLight
                  ? 'border-slate-100 hover:bg-slate-50'
                  : 'border-slate-800/80 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm bg-brand-secondary text-slate-950 dark:text-slate-950">
                {(c.studentName[0] || '?').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`truncate text-sm font-semibold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {c.studentName}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="rounded-full bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 text-[10px] font-bold text-red-500 dark:text-red-300">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {c.lastSnippet || 'Ek veya mesaj'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}
