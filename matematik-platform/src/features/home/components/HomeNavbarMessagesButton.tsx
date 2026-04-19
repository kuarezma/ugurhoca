'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';
import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { supabase } from '@/lib/supabase/client';
import { sendSupportMessage } from '@/features/home/queries';
import { useNavbarMessages } from '@/features/home/hooks/useNavbarMessages';
import type { DashboardNotification } from '@/types/dashboard';

type HomeNavbarMessagesButtonProps = {
  userId: string;
  userName: string;
  userEmail: string;
  isLight: boolean;
};

const formatTime = (value: string) =>
  new Date(value).toLocaleString('tr-TR', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  });

const getBubbleImage = (message: DashboardNotification) => {
  const attachments = (message.metadata?.attachments as unknown[]) || [];
  if (Array.isArray(attachments)) {
    const image = attachments.find(
      (item): item is { kind: string; url: string; name?: string } =>
        Boolean(
          item &&
            typeof item === 'object' &&
            'kind' in item &&
            (item as { kind?: string }).kind === 'image' &&
            'url' in item &&
            typeof (item as { url?: string }).url === 'string',
        ),
    );
    if (image) return image.url;
  }
  if (message.metadata?.image_url) return message.metadata.image_url;
  return null;
};

export function HomeNavbarMessagesButton({
  userId,
  userName,
  userEmail,
  isLight,
}: HomeNavbarMessagesButtonProps) {
  const { appendMessage, markAllAsRead, messages, unreadCount } =
    useNavbarMessages(userId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    if (unreadCount > 0) {
      void markAllAsRead();
    }
  }, [open, unreadCount, markAllAsRead]);

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
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages.length]);

  const chronologicalMessages = useMemo(() => messages, [messages]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = draft.trim();
      if (!text || sending) return;

      setSending(true);
      setError(null);

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          throw new Error('Oturum açmanız gerekiyor.');
        }

        const sentRow = await sendSupportMessage(
          {
            attachments: [],
            sender_email: userEmail || '',
            sender_id: userId,
            sender_name: userName || 'Öğrenci',
            text,
          },
          session.access_token,
        );

        if (sentRow && typeof sentRow === 'object' && 'id' in sentRow) {
          appendMessage(sentRow as DashboardNotification);
        } else {
          appendMessage({
            created_at: new Date().toISOString(),
            id: `local-${Date.now()}`,
            is_read: true,
            message: text,
            metadata: {
              sender_id: userId,
              sender_name: userName || 'Sen',
            },
            title: 'Uğur Hoca için mesajın',
            type: 'sent-message',
            user_id: userId,
          });
        }

        setDraft('');
      } catch (sendError) {
        setError(
          sendError instanceof Error
            ? sendError.message
            : 'Mesaj gönderilemedi.',
        );
      } finally {
        setSending(false);
      }
    },
    [appendMessage, draft, sending, userEmail, userId, userName],
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
            ? `Mesajlar: ${unreadCount} okunmamış`
            : 'Mesajlar'
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        className={buttonClasses}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
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
            role="dialog"
            aria-label="Uğur Hoca ile mesajlaşma"
            className={`fixed left-4 right-4 top-[calc(3.5rem+0.25rem+env(safe-area-inset-top))] z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-2xl border shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[24rem] md:w-[26rem] ${
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
                <Image
                  src="/ugur.jpeg"
                  alt="Uğur Hoca"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-semibold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Uğur Hoca
                  </span>
                  <span
                    className={`text-[11px] ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Mesajlaşma
                  </span>
                </div>
              </div>
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

            <div
              ref={listRef}
              className={`flex-1 overflow-y-auto px-3 py-3 ${
                isLight ? 'bg-slate-50/60' : 'bg-slate-950/30'
              }`}
              style={{ maxHeight: 'calc(80vh - 8.5rem)' }}
            >
              {chronologicalMessages.length === 0 ? (
                <p
                  className={`py-10 text-center text-sm ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Henüz mesaj yok. Uğur Hoca'ya yazmak için aşağıdaki kutuyu
                  kullan.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {chronologicalMessages.map((message) => {
                    const isSent = message.type === 'sent-message';
                    const imageUrl = getBubbleImage(message);

                    return (
                      <li
                        key={message.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                            isSent
                              ? 'rounded-br-sm bg-indigo-500 text-white'
                              : isLight
                                ? 'rounded-bl-sm bg-white text-slate-900 ring-1 ring-slate-200'
                                : 'rounded-bl-sm bg-slate-800 text-slate-100 ring-1 ring-slate-700'
                          }`}
                        >
                          {!isSent && message.title && (
                            <p
                              className={`mb-1 text-[11px] font-semibold ${
                                isLight ? 'text-indigo-600' : 'text-indigo-300'
                              }`}
                            >
                              {message.metadata?.sender_name || 'Uğur Hoca'}
                            </p>
                          )}
                          {imageUrl ? (
                            <a
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mb-1 block overflow-hidden rounded-lg"
                            >
                              <Image
                                src={imageUrl}
                                alt="Ek görsel"
                                width={240}
                                height={180}
                                className="h-auto w-full max-w-[240px] rounded-lg object-cover"
                                unoptimized
                              />
                            </a>
                          ) : null}
                          {message.message ? (
                            <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                              {message.message}
                            </p>
                          ) : null}
                          <p
                            className={`mt-1 text-[10px] ${
                              isSent
                                ? 'text-indigo-100/80'
                                : isLight
                                  ? 'text-slate-400'
                                  : 'text-slate-500'
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
              onSubmit={handleSubmit}
              className={`border-t px-3 py-2 ${
                isLight ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-900'
              }`}
            >
              {error ? (
                <p className="mb-1 text-[11px] text-red-500">{error}</p>
              ) : null}
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
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
                  placeholder="Uğur Hoca'ya mesaj yaz..."
                  rows={1}
                  className={`max-h-32 flex-1 resize-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    isLight
                      ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                      : 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500'
                  }`}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || draft.trim().length === 0}
                  aria-label="Gönder"
                  className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
