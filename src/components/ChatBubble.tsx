'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  CHAT_USER_STORAGE_KEY,
  UGURHOCA_CHAT_MESSAGES_KEY,
} from '@/lib/chat-constants';
import type { ChatSessionUser } from '@/components/ChatLogin';

const ChatLoginLazy = dynamic(
  () =>
    import('@/components/ChatLogin').then((mod) => ({ default: mod.ChatLogin })),
  { ssr: false }
);

const TAG_TEXT = '@Uğur Hoca';
const BROADCAST_TAG = 'ugurhoca-chat-tag';

type ChatMessage = {
  id: string;
  text: string;
  senderTc: string;
  displayName: string;
  ts: number;
};

function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(UGURHOCA_CHAT_MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages(next: ChatMessage[]) {
  sessionStorage.setItem(UGURHOCA_CHAT_MESSAGES_KEY, JSON.stringify(next));
}

export function ChatBubble() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ChatSessionUser | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const presenceTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const adminTc = process.env.NEXT_PUBLIC_CHAT_ADMIN_TC ?? '';

  const isAdminTc = useCallback(
    (tc: string) => !!adminTc && tc === adminTc,
    [adminTc]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(CHAT_USER_STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as ChatSessionUser);
      else setUser(null);
    } catch {
      setUser(null);
    }
    setMessages(loadMessages());
  }, [mounted]);

  useEffect(() => {
    if (!mounted || typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel(BROADCAST_TAG);
    broadcastRef.current = bc;
    bc.onmessage = (ev: MessageEvent) => {
      const data = ev.data as { text?: string; senderDisplay?: string };
      const raw = sessionStorage.getItem(CHAT_USER_STORAGE_KEY);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as ChatSessionUser;
        if (!isAdminTc(parsed.tc_number)) return;
        if (
          typeof data?.text === 'string' &&
          data.text.includes(TAG_TEXT) &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted'
        ) {
          new Notification('Uğur Hoca Sohbet', {
            body: `${data.senderDisplay ?? 'Bir kullanıcı'} sizi etiketledi.`,
            tag: 'ugurhoca-mention',
          });
        }
      } catch {
        /* ignore */
      }
    };
    return () => {
      bc.close();
      broadcastRef.current = null;
    };
  }, [mounted, isAdminTc]);

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const recomputeOnline = useCallback((channel: ReturnType<typeof supabase.channel>) => {
    const state = channel.presenceState();
    const now = Date.now();
    let n = 0;
    for (const presences of Object.values(state)) {
      for (const p of presences as { last_seen?: number }[]) {
        if (p && now - (p.last_seen ?? 0) < 60000) n += 1;
      }
    }
    setOnlineCount(n);
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;

    const channel = supabase.channel('ugurhoca-chat-presence', {
      config: { presence: { key: user.tc_number } },
    });

    channel
      .on('presence', { event: 'sync' }, () => recomputeOnline(channel))
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            tc: user.tc_number,
            display_name: user.display_name,
            last_seen: Date.now(),
          });
          recomputeOnline(channel);
        }
      });

    const onActivity = () => markActivity();
    window.addEventListener('keydown', onActivity);
    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('visibilitychange', onActivity);

    presenceTickRef.current = setInterval(async () => {
      const idle = Date.now() - lastActivityRef.current > 60000;
      if (idle) {
        await channel.untrack();
        recomputeOnline(channel);
      } else {
        await channel.track({
          tc: user.tc_number,
          display_name: user.display_name,
          last_seen: Date.now(),
        });
        recomputeOnline(channel);
      }
    }, 15000);

    return () => {
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('visibilitychange', onActivity);
      if (presenceTickRef.current) {
        clearInterval(presenceTickRef.current);
        presenceTickRef.current = null;
      }
      void channel.unsubscribe();
    };
  }, [mounted, user, markActivity, recomputeOnline]);

  useEffect(() => {
    if (!open) return;
    markActivity();
  }, [open, markActivity]);

  useEffect(() => {
    if (!mounted) return;
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, mounted]);

  const deleteMessage = (id: string) => {
    const next = messages.filter((m) => m.id !== id);
    setMessages(next);
    saveMessages(next);
    markActivity();
  };

  const sendMessage = () => {
    if (!user) return;
    const text = input.trim();
    if (!text) return;

    const msg: ChatMessage = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      text,
      senderTc: user.tc_number,
      displayName: user.display_name,
      ts: Date.now(),
    };
    const next = [...messages, msg];
    setMessages(next);
    saveMessages(next);
    setInput('');
    markActivity();

    if (text.includes(TAG_TEXT)) {
      broadcastRef.current?.postMessage({
        text,
        senderDisplay: user.display_name,
      });
      if (isAdminTc(user.tc_number) && Notification.permission === 'granted') {
        new Notification('Uğur Hoca Sohbet', {
          body: 'Mesajınızda @Uğur Hoca geçiyor.',
          tag: 'ugurhoca-self-tag',
        });
      }
    }
  };

  const handleTagClick = async () => {
    setInput((prev) => (prev ? `${prev} ${TAG_TEXT} ` : `${TAG_TEXT} `));
    markActivity();
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  if (!mounted) {
    return null;
  }

  const panelBody = !user ? (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center border-b border-[var(--border)] px-3 py-2.5">
        <h2 className="text-sm font-semibold text-[var(--text-strong)]">Sohbet</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-muted)] hover:text-[var(--text)]"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatLoginLazy
          onSuccess={(u) => {
            setUser(u);
            setMessages(loadMessages());
            markActivity();
          }}
        />
      </div>
    </div>
  ) : (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] px-3 py-2.5">
        <h2 className="text-sm font-semibold text-[var(--text-strong)]">Sohbet</h2>
        <span className="rounded-full bg-[var(--bg-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
          {onlineCount} kişi çevrimiçi
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-muted)] hover:text-[var(--text)]"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2">
        {messages.length === 0 && (
          <p className="text-center text-xs text-[var(--text-muted)]">
            Henüz mesaj yok. Merhaba deyin 👋
          </p>
        )}
        {messages.map((m) => {
          const mineAdmin = isAdminTc(m.senderTc);
          return (
            <div
              key={m.id}
              className={`flex w-full ${mineAdmin ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  mineAdmin
                    ? 'rounded-br-md bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
                    : 'rounded-bl-md bg-[var(--bg-muted)] text-[var(--text)]'
                }`}
              >
                {!mineAdmin && (
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                    {m.displayName}
                  </p>
                )}
                {mineAdmin && (
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold text-white/90">{m.displayName}</p>
                    <button
                      type="button"
                      onClick={() => deleteMessage(m.id)}
                      className="rounded p-0.5 text-white/80 hover:bg-white/10 hover:text-white"
                      aria-label="Mesajı sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={listEndRef} />
      </div>

      <div className="shrink-0 border-t border-[var(--border)] p-2">
        <div className="mb-2 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              markActivity();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Mesajınız..."
            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-violet-500/25 focus:ring-2"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleTagClick}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-2 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--bg-soft)]"
          >
            👋 Etiketle
          </button>
          <button
            type="button"
            onClick={sendMessage}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 hover:opacity-95"
          >
            <Send className="h-4 w-4" />
            Gönder
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.button
        type="button"
        initial={false}
        animate={{ scale: open ? 0.9 : 1 }}
        whileHover={{ scale: open ? 0.9 : 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          setOpen((o) => !o);
          markActivity();
        }}
        className="fixed bottom-6 right-6 z-[100] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/30"
        aria-label={open ? 'Sohbeti kapat' : 'Sohbeti aç'}
      >
        <MessageCircle className="h-7 w-7" strokeWidth={2} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed bottom-24 right-6 z-[100] flex h-[550px] w-[380px] max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl"
            style={{ boxShadow: '0 25px 50px var(--shadow, rgba(0,0,0,0.2))' }}
          >
            {panelBody}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatBubble;
