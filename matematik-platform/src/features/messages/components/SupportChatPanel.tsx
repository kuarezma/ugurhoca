'use client';

import { ArrowLeft, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useLayoutEffect, useRef, type FormEvent } from 'react';
import type { ThreadMessage } from '@/features/messages/types';

const formatTime = (value: string) =>
  new Date(value).toLocaleString('tr-TR', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });

export type SupportChatPanelProps = {
  peerDisplayName: string;
  peerSubtitle?: string;
  peerAvatarSrc?: string;
  messages: ThreadMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  sending: boolean;
  error: string | null;
  onClose?: () => void;
  onBack?: () => void;
  appearance: 'navbar' | 'admin';
  isLight?: boolean;
  placeholder?: string;
  inputDisabled?: boolean;
};

export function SupportChatPanel({
  peerDisplayName,
  peerSubtitle,
  peerAvatarSrc,
  messages,
  draft,
  onDraftChange,
  onSubmit,
  sending,
  error,
  onClose,
  onBack,
  appearance,
  isLight = true,
  placeholder = "Mesaj yaz...",
  inputDisabled = false,
}: SupportChatPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const headerBorder =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200'
        : 'border-slate-700'
      : 'border-[var(--border)]';

  const headerBg =
    appearance === 'navbar'
      ? isLight
        ? 'bg-white'
        : 'bg-slate-900'
      : 'bg-[var(--bg-elevated)]';

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

  const listBg =
    appearance === 'navbar'
      ? isLight
        ? 'bg-slate-50/60'
        : 'bg-slate-950/30'
      : 'bg-[var(--bg-soft,#0f172a)]';

  const emptyText =
    appearance === 'navbar'
      ? isLight
        ? 'text-slate-500'
        : 'text-slate-400'
      : 'text-[var(--text-muted)]';

  const formBorder =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200 bg-white'
        : 'border-slate-700 bg-slate-900'
      : 'border-[var(--border)] bg-[var(--bg-elevated)]';

  const textareaClass =
    appearance === 'navbar'
      ? isLight
        ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
        : 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500'
      : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text)] placeholder:text-[var(--text-muted)]';

  const ownBubble =
    appearance === 'navbar'
      ? 'rounded-br-sm bg-indigo-500 text-white'
      : 'rounded-br-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white';

  const peerBubble = (() => {
    if (appearance === 'navbar') {
      return isLight
        ? 'rounded-bl-sm bg-white text-slate-900 ring-1 ring-slate-200'
        : 'rounded-bl-sm bg-slate-800 text-slate-100 ring-1 ring-slate-700';
    }
    return 'rounded-bl-sm bg-[var(--bg-muted)] text-[var(--text)] ring-1 ring-[var(--border)]';
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${headerBorder} ${headerBg}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Geri"
              className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                appearance === 'navbar'
                  ? isLight
                    ? 'text-slate-500 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-white/5'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          {peerAvatarSrc ? (
            <Image
              src={peerAvatarSrc}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white ${
                appearance === 'admin' ? 'shadow-sm' : ''
              }`}
              aria-hidden
            >
              {(peerDisplayName.trim()[0] || '?').toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className={`block truncate text-sm font-semibold ${titleClass}`}>
              {peerDisplayName}
            </span>
            {peerSubtitle ? (
              <span className={`block truncate text-[11px] ${subtitleClass}`}>
                {peerSubtitle}
              </span>
            ) : null}
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className={`shrink-0 rounded-lg p-1.5 transition-colors ${
              appearance === 'navbar'
                ? isLight
                  ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
            }`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div
        ref={listRef}
        className={`flex-1 overflow-y-auto px-3 py-3 ${listBg}`}
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 ? (
          <p className={`py-10 text-center text-sm ${emptyText}`}>
            Henüz mesaj yok. Aşağıdan yazarak başlayın.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((message) => {
              const isOwn = message.isOwn;
              return (
                <li
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      isOwn ? ownBubble : peerBubble
                    }`}
                  >
                    {message.imageUrl ? (
                      <a
                        href={message.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-1 block overflow-hidden rounded-lg"
                      >
                        <Image
                          src={message.imageUrl}
                          alt="Ek görsel"
                          width={240}
                          height={180}
                          className="h-auto w-full max-w-[240px] rounded-lg object-cover"
                          unoptimized
                        />
                      </a>
                    ) : null}
                    {message.text ? (
                      <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                        {message.text}
                      </p>
                    ) : null}
                    <p
                      className={`mt-1 text-[10px] ${
                        isOwn
                          ? appearance === 'navbar'
                            ? 'text-indigo-100/80'
                            : 'text-white/80'
                          : appearance === 'navbar'
                            ? isLight
                              ? 'text-slate-400'
                              : 'text-slate-500'
                            : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className={`border-t px-3 py-2 ${formBorder}`}
      >
        {error ? (
          <p className="mb-1 text-[11px] text-red-500">{error}</p>
        ) : null}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                (
                  event.currentTarget.form as HTMLFormElement | null
                )?.requestSubmit();
              }
            }}
            placeholder={placeholder}
            rows={1}
            autoComplete="off"
            autoCorrect="on"
            enterKeyHint="send"
            disabled={sending || inputDisabled}
            className={`max-h-32 min-h-[2.5rem] flex-1 resize-none appearance-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${textareaClass}`}
          />
          <button
            type="submit"
            disabled={
              sending ||
              inputDisabled ||
              draft.trim().length === 0
            }
            aria-busy={sending}
            aria-label={sending ? 'Gönderiliyor' : 'Gönder'}
            className="inline-flex h-10 min-w-[5.25rem] flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-3 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              'Gönder'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
