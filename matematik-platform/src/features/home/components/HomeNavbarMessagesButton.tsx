'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { supabase } from '@/lib/supabase/client';
import { sendSupportMessage } from '@/features/home/queries';
import { useNavbarMessages } from '@/features/home/hooks/useNavbarMessages';
import { SupportChatPanel } from '@/features/messages/components/SupportChatPanel';
import { mapStudentNotificationsToThread } from '@/features/messages/mapNotificationsToThread';
import type { DashboardNotification } from '@/types/dashboard';

type HomeNavbarMessagesButtonProps = {
  userId: string;
  userName: string;
  userEmail: string;
  isLight: boolean;
};

export function HomeNavbarMessagesButton({
  userId,
  userName,
  userEmail,
  isLight,
}: HomeNavbarMessagesButtonProps) {
  const { appendMessage, markAllAsRead, messages, refetch, unreadCount } =
    useNavbarMessages(userId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const threadMessages = useMemo(
    () => mapStudentNotificationsToThread(messages),
    [messages],
  );

  useEffect(() => {
    if (!open) return;
    void refetch();
  }, [open, refetch]);

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
            className={`fixed left-4 right-4 top-[calc(3.5rem+0.25rem+env(safe-area-inset-top))] z-50 flex h-[min(80vh,28rem)] min-h-0 flex-col overflow-hidden rounded-2xl border shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[24rem] md:w-[26rem] ${
              isLight
                ? 'border-slate-200 bg-white'
                : 'border-slate-700 bg-slate-900'
            }`}
          >
            <SupportChatPanel
              appearance="navbar"
              draft={draft}
              error={error}
              isLight={isLight}
              messages={threadMessages}
              onClose={() => setOpen(false)}
              onDraftChange={setDraft}
              onSubmit={handleSubmit}
              peerAvatarSrc="/ugur.jpeg"
              peerDisplayName="Uğur Hoca"
              peerSubtitle="Mesajlaşma"
              placeholder="Uğur Hoca'ya mesaj yaz..."
              sending={sending}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
