'use client';

import type { RefObject } from 'react';
import Image from 'next/image';
import { Calculator, Check, CheckCheck, FileText, Reply } from 'lucide-react';
import type { ThreadMessage } from '@/features/messages/types';
import MathText from '@/components/MathText';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { formatTime } from './constants';

export type SupportChatMessageListProps = {
  listRef: RefObject<HTMLDivElement | null>;
  messages: ThreadMessage[];
  hasMoreMessages?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  searchQuery: string;
  peerDisplayName: string;
  peerTyping?: boolean;
  appearance: 'navbar' | 'admin';
  isLight?: boolean;
  onReplySelect: (message: ThreadMessage) => void;
  onOpenLightbox: (imageUrl: string) => void;
};

export function SupportChatMessageList({
  listRef,
  messages,
  hasMoreMessages,
  loadingMore,
  onLoadMore,
  searchQuery,
  peerDisplayName,
  peerTyping,
  appearance,
  isLight = true,
  onReplySelect,
  onOpenLightbox,
}: SupportChatMessageListProps) {
  const listBg =
    appearance === 'navbar'
      ? isLight
        ? 'bg-slate-50/70'
        : 'bg-slate-950/40'
      : 'bg-[var(--bg-soft,#0f172a)]';

  const titleClass =
    appearance === 'navbar'
      ? isLight
        ? 'text-slate-900'
        : 'text-white'
      : 'text-[var(--text-strong)]';

  const subtitleClass =
    appearance === 'navbar'
      ? isLight
        ? 'text-slate-500'
        : 'text-slate-400'
      : 'text-[var(--text-muted)]';

  const ownBubble =
    appearance === 'navbar'
      ? 'rounded-br-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
      : 'rounded-br-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md';

  const peerBubble = (() => {
    if (appearance === 'navbar') {
      return isLight
        ? 'rounded-bl-sm bg-white text-slate-900 ring-1 ring-slate-200/80 shadow-xs'
        : 'rounded-bl-sm bg-slate-800 text-slate-100 ring-1 ring-slate-700/80 shadow-xs';
    }
    return 'rounded-bl-sm bg-[var(--bg-muted)] text-[var(--text)] ring-1 ring-[var(--border)] shadow-xs';
  })();

  return (
    <div
      ref={listRef}
      className={`flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-3 ${listBg}`}
      style={{ minHeight: 0, overscrollBehavior: 'contain' }}
    >
      {/* Daha Eski Mesajları Yükle Butonu */}
      {hasMoreMessages && (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-500 transition hover:bg-indigo-500/20 disabled:opacity-50"
          >
            {loadingMore ? 'Yükleniyor...' : 'Daha eski mesajları göster'}
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Calculator className="h-6 w-6" />
          </div>
          <p className={`text-sm font-semibold mb-1 ${titleClass}`}>
            {searchQuery
              ? 'Eşleşen Mesaj Bulunamadı'
              : 'Uğur Hoca ile Matematik Sohbeti'}
          </p>
          <p className={`text-xs max-w-xs ${subtitleClass}`}>
            {searchQuery
              ? `"${searchQuery}" ifadesiyle ilgili mesaj bulunamadı.`
              : "Takıldığın bir soru, ödev veya çalışma programın hakkında Uğur Hoca'ya doğrudan yazabilirsin."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {messages.map((message) => {
            const isOwn = message.isOwn;

            return (
              <li
                key={message.id}
                className={`group relative flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {/* Yanıtla Butonu */}
                <div
                  className={`absolute -top-3.5 z-10 hidden items-center gap-1 group-hover:flex ${
                    isOwn ? 'right-2' : 'left-2'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onReplySelect(message)}
                    aria-label="Mesajı yanıtla"
                    title="Yanıtla"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Reply className="h-3 w-3" />
                  </button>
                </div>

                <div
                  className={`max-w-[84%] break-words [overflow-wrap:anywhere] rounded-2xl px-3.5 py-2.5 text-sm transition-all ${
                    isOwn ? ownBubble : peerBubble
                  }`}
                >
                  {/* Alıntılanan Mesaj Kutusu */}
                  {message.replyTo ? (
                    <div
                      className={`mb-2 rounded-xl border-l-3 border-indigo-400 px-2.5 py-1 text-xs ${
                        isOwn
                          ? 'bg-black/20 text-indigo-100'
                          : isLight
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-slate-700/50 text-slate-200'
                      }`}
                    >
                      <span className="block font-semibold text-[10px] text-indigo-300">
                        {message.replyTo.senderName || 'Alıntı'}
                      </span>
                      <p className="line-clamp-2 italic text-[11px]">
                        {message.replyTo.text}
                      </p>
                    </div>
                  ) : null}

                  {/* Tekil veya Çoklu Görsel Eki */}
                  {message.imageUrl &&
                  !message.attachments?.some((a) => a.kind === 'image') ? (
                    <button
                      type="button"
                      onClick={() => onOpenLightbox(message.imageUrl || '')}
                      aria-label="Görseli tam ekran incele"
                      className="mb-1.5 block overflow-hidden rounded-xl cursor-zoom-in text-left transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <Image
                        src={message.imageUrl}
                        alt="Ek görsel"
                        width={260}
                        height={190}
                        className="h-auto w-full max-w-[260px] rounded-xl object-cover shadow-xs"
                        unoptimized
                      />
                    </button>
                  ) : null}

                  {/* Ekler Listesi */}
                  {message.attachments && message.attachments.length > 0 ? (
                    <div className="mb-1.5 flex flex-col gap-1.5">
                      {message.attachments.map((att, idx) => {
                        if (att.kind === 'image') {
                          return (
                            <button
                              key={`${att.url}-${idx}`}
                              type="button"
                              onClick={() => onOpenLightbox(att.url)}
                              aria-label="Görseli büyüt"
                              className="block overflow-hidden rounded-xl cursor-zoom-in text-left transition hover:opacity-95"
                            >
                              <Image
                                src={att.url}
                                alt={att.name || 'Ek görsel'}
                                width={260}
                                height={190}
                                className="h-auto w-full max-w-[260px] rounded-xl object-cover shadow-xs"
                                unoptimized
                              />
                            </button>
                          );
                        }

                        if (att.kind === 'file') {
                          return (
                            <a
                              key={`${att.url}-${idx}`}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 rounded-xl p-2 text-xs transition ${
                                isOwn
                                  ? 'bg-white/15 text-white hover:bg-white/25'
                                  : isLight
                                    ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                    : 'bg-slate-700/60 text-slate-100 hover:bg-slate-700'
                              }`}
                            >
                              <FileText className="h-4 w-4 shrink-0 text-red-400" />
                              <span className="truncate font-medium flex-1">
                                {att.name || 'Belge'}
                              </span>
                            </a>
                          );
                        }

                        return null;
                      })}
                    </div>
                  ) : null}

                  {/* Sesli Mesaj Oynatıcısı */}
                  {message.audioUrl && (
                    <VoiceNotePlayer
                      audioUrl={message.audioUrl}
                      isOwn={isOwn}
                      isLight={isLight}
                    />
                  )}

                  {/* Mesaj Metni */}
                  {message.text ? (
                    <div className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                      <MathText>{message.text}</MathText>
                    </div>
                  ) : null}

                  {/* Saat ve Okundu/Teslim Durumu */}
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      isOwn
                        ? 'text-indigo-100/90'
                        : isLight
                          ? 'text-slate-400'
                          : 'text-slate-400'
                    }`}
                  >
                    <span>{formatTime(message.created_at)}</span>

                    {isOwn && (
                      <span
                        title={
                          message.status === 'read' ? 'Okundu' : 'İletildi'
                        }
                      >
                        {message.status === 'read' ? (
                          <CheckCheck
                            className="h-3.5 w-3.5 text-sky-300"
                            strokeWidth={2.4}
                          />
                        ) : (
                          <Check
                            className="h-3 w-3 text-indigo-200/80"
                            strokeWidth={2}
                          />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Karşı Taraf Yazıyor Göstergesi */}
      {peerTyping && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 animate-pulse">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-500">
            {(peerDisplayName[0] || 'U').toUpperCase()}
          </div>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            {peerDisplayName} yazıyor
          </span>
          <span className="flex gap-1 items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
          </span>
        </div>
      )}
    </div>
  );
}
