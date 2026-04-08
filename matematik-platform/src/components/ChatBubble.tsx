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
  room_id: string;
  sender_tc: string;
  display_name: string;
  text: string;
  ts: number;
  created_at?: string;
};

type ChatRoom = {
  id: string;
  name: string;
  is_private: boolean;
};

// sessionStorage yükleme/kaydetme fonksiyonları kaldırıldı, veritabanı kullanılacak.

export function ChatBubble() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ChatSessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [input, setInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());
  const presenceTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const isAdminTc = useCallback(
    (tc: string) => isAdmin,
    [isAdmin]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const checkAdminAndSetUser = async () => {
      setLoading(true);
      
      try {
        // Check if user is admin
        const { data: { session } } = await supabase.auth.getSession();
        const adminEmails = ['admin@ugurhoca.com', 'admin@matematiklab.com'];
        
        if (session?.user && adminEmails.includes(session.user.email || '')) {
          // Auto-login for admin
          const adminUser: ChatSessionUser = {
            full_name: 'Uğur Hoca',
            grade: 0,
            school_number: 'admin',
            display_name: 'Uğur Hoca'
          };
          setUser(adminUser);
          setIsAdmin(true);
          sessionStorage.setItem(CHAT_USER_STORAGE_KEY, JSON.stringify(adminUser));
        } else {
          // Check for existing student session
          const raw = sessionStorage.getItem(CHAT_USER_STORAGE_KEY);
          if (raw) {
            const sessionUser = JSON.parse(raw) as ChatSessionUser;
            setUser(sessionUser);
            setIsAdmin(false);
          } else {
            setUser(null);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAndSetUser();
  }, [mounted]);

  const initRoomAndMessages = useCallback(async (u: ChatSessionUser) => {
    if (u.school_number === 'admin') return; // Admin için farklı bir mantık gerekebilir

    try {
      setLoading(true);
      // 1. Odayı bul veya oluştur
      let room: ChatRoom | null = null;
      
      const { data: memberData } = await supabase
        .from('chat_room_members')
        .select('room_id, chat_rooms(*)')
        .eq('user_tc', u.school_number)
        .single();

      if (memberData?.chat_rooms) {
        // Supabase bazen join sonuçlarını dizi olarak dönebilir, güvenli atama yapıyoruz.
        const chatRoomData = Array.isArray(memberData.chat_rooms) 
          ? memberData.chat_rooms[0] 
          : memberData.chat_rooms;
        room = chatRoomData as unknown as ChatRoom;
      } else {
        // Oda oluştur
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert([{ name: `${u.display_name} - Sohbet`, is_private: true }])
          .select()
          .single();

        if (roomError) throw roomError;
        room = newRoom;

        // Kendini ekle
        await supabase
          .from('chat_room_members')
          .insert([{ room_id: room?.id, user_tc: u.school_number }]);
          
        // Uğur Hoca'yı da ekleyebiliriz (opsiyonel, admin zaten RLS ile görüyor)
      }

      setActiveRoom(room);

      // 2. Mesajları yükle
      if (room) {
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', room.id)
          .order('ts', { ascending: true })
          .limit(100);
        
        if (msgs) {
          const formattedMsgs: ChatMessage[] = msgs.map(m => ({
            id: m.id,
            room_id: m.room_id,
            sender_tc: m.sender_tc,
            display_name: m.display_name,
            text: m.text,
            ts: Number(m.ts)
          }));
          setMessages(formattedMsgs);
        }
      }
    } catch (err) {
      console.error('Sohbet başlatma hatası:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && user) {
      initRoomAndMessages(user);
    }
  }, [mounted, user, initRoomAndMessages]);

  // Realtime Aboneliği
  useEffect(() => {
    if (!activeRoom) return;

    const channel = supabase
      .channel(`room-${activeRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${activeRoom.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id,
              room_id: newMsg.room_id,
              sender_tc: newMsg.sender_tc,
              display_name: newMsg.display_name,
              text: newMsg.text,
              ts: Number(newMsg.ts)
            }];
          });
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
    return () => {
      void channel.unsubscribe();
    };
  }, [activeRoom]);

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
        if (!isAdminTc(parsed.school_number)) return;
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
      config: { presence: { key: user.school_number } },
    });

    channel
      .on('presence', { event: 'sync' }, () => recomputeOnline(channel))
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            tc: user.school_number,
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
          tc: user.school_number,
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

  const deleteMessage = async (id: string) => {
    try {
      await supabase.from('chat_messages').delete().eq('id', id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      markActivity();
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  };

  const sendMessage = async () => {
    if (!user || !activeRoom) return;
    const text = input.trim();
    if (!text) return;

    const ts = Date.now();
    const tempId = crypto.randomUUID?.() || `${ts}-${Math.random()}`;

    // Optimistik güncelleme (isteğe bağlı, şimdilik doğrudan insert)
    const { error } = await supabase.from('chat_messages').insert([{
      room_id: activeRoom.id,
      sender_tc: user.school_number,
      display_name: user.display_name,
      text,
      ts
    }]);

    if (!error) {
      setInput('');
      markActivity();
      
      if (text.includes(TAG_TEXT)) {
        broadcastRef.current?.postMessage({
          text,
          senderDisplay: user.display_name,
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

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 px-4 py-2 shadow-lg">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-600">Yükleniyor...</span>
        </div>
      </div>
    );
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
            setIsAdmin(false);
            initRoomAndMessages(u);
            markActivity();
          }}
        />
      </div>
    </div>
  ) : (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] px-3 py-2.5">
        <h2 className="text-sm font-semibold text-[var(--text-strong)]">Sohbet</h2>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {onlineCount} çevrimiçi
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto rounded-full p-2 text-[var(--text-muted)] transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--text)]"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        {messages.length === 0 && (
          <p className="text-center text-xs text-[var(--text-muted)]">
            Henüz mesaj yok. Merhaba deyin 👋
          </p>
        )}
        <AnimatePresence>
          {messages.map((m) => {
            const mineAdmin = isAdminTc(m.sender_tc);
            const timeString = new Date(m.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
                className={`flex w-full mb-1 ${mineAdmin ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[85%] px-4 py-2 text-[15px] shadow-sm backdrop-blur-md ${
                    mineAdmin
                      ? 'rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-500/90 to-violet-600/90 text-white border border-indigo-400/30'
                      : 'rounded-2xl rounded-tl-sm bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                  style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}
                >
                  {!mineAdmin && (
                    <p className="mb-0.5 text-[10px] font-bold tracking-wide text-indigo-500 dark:text-indigo-400">
                      ~ {m.display_name}
                    </p>
                  )}
                  {mineAdmin && (
                    <div className="mb-0.5 flex items-center justify-between gap-4">
                      <p className="text-[10px] font-bold text-white/70">~ Sen</p>
                      <button
                        type="button"
                        onClick={() => deleteMessage(m.id)}
                        className="rounded p-0.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                        aria-label="Mesajı sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>
                    <span className={`text-[9px] font-medium self-end mt-1 ${mineAdmin ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>
                      {timeString} {mineAdmin && '✓✓'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
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
