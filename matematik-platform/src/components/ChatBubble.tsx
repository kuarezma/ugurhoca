'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admin';
import { getClientSession } from '@/lib/auth-client';
import {
  sendSupportMessage,
  uploadSupportFiles,
  validateSupportImageFile,
} from '@/features/home/queries';
import { useNavbarMessages } from '@/features/home/hooks/useNavbarMessages';
import { SupportChatPanel } from '@/features/messages/components/SupportChatPanel';
import { useAdminStudentThread } from '@/features/messages/hooks/useAdminStudentThread';
import { mapStudentNotificationsToThread } from '@/features/messages/mapNotificationsToThread';
import type { DashboardNotification } from '@/types/dashboard';
import {
  parseSupportPayload,
  type ParsedSupportPayload,
} from '@/features/messages/supportChatUtils';

type InboxMessage = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  parsed: ParsedSupportPayload | null;
};

type ConversationPreview = {
  studentId: string;
  studentName: string;
  lastSnippet: string;
  lastAt: string;
  unreadCount: number;
};

function parseInboxPayload(raw: string): ParsedSupportPayload | null {
  return parseSupportPayload(raw);
}

function buildConversations(messages: InboxMessage[]): ConversationPreview[] {
  const byStudent = new Map<string, ConversationPreview>();

  for (const m of messages) {
    const sid = m.parsed?.sender_id;
    const sname = m.parsed?.sender_name || 'Öğrenci';
    if (!sid) continue;

    const existing = byStudent.get(sid);
    const unread = !m.is_read ? 1 : 0;
    const snippet = m.parsed?.text || m.title || '';

    if (!existing) {
      byStudent.set(sid, {
        studentId: sid,
        studentName: sname,
        lastSnippet: snippet,
        lastAt: m.created_at,
        unreadCount: unread,
      });
    } else {
      existing.unreadCount += unread;
      if (new Date(m.created_at) > new Date(existing.lastAt)) {
        existing.lastAt = m.created_at;
        existing.lastSnippet = snippet;
        existing.studentName = sname;
      }
    }
  }

  return Array.from(byStudent.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  );
}

export default function ChatBubble() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Admin state
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Ortak form state
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  // Öğrenci mesaj hook'u (sadece öğrenci ise aktif)
  const studentUserId = currentUser && !currentUser.isAdmin ? currentUser.id : '';
  const {
    appendMessage: appendStudentMessage,
    markAllAsRead: markAllStudentAsRead,
    messages: studentRawMessages,
    refetch: refetchStudentMessages,
    unreadCount: studentUnreadCount,
  } = useNavbarMessages(studentUserId);

  const studentThreadMessages = useMemo(
    () => mapStudentNotificationsToThread(studentRawMessages),
    [studentRawMessages],
  );

  // Admin mesajları yükleme
  const loadAdminMessages = useCallback(async (adminId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', adminId)
      .eq('type', 'message')
      .order('created_at', { ascending: false })
      .limit(120);

    if (data) {
      const formatted: InboxMessage[] = data.map((n) => ({
        created_at: n.created_at,
        id: n.id,
        is_read: n.is_read,
        message: n.message,
        parsed: parseInboxPayload(n.message),
        title: n.title,
      }));
      setInboxMessages(formatted);
    }
  }, []);

  // Oturum kontrolü
  const checkAuth = useCallback(async () => {
    try {
      const session = await getClientSession();
      if (session?.user) {
        const isAdmin = isAdminEmail(session.user.email);
        const displayName =
          (session.user.user_metadata?.name as string) ||
          (session.user.user_metadata?.full_name as string) ||
          session.user.email?.split('@')[0] ||
          'Kullanıcı';

        setCurrentUser({
          id: session.user.id,
          email: session.user.email || '',
          name: displayName,
          isAdmin,
        });

        if (isAdmin) {
          await loadAdminMessages(session.user.id);
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadAdminMessages]);

  useEffect(() => {
    setMounted(true);
    void checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void checkAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  // Ek dosya temizliği
  useEffect(() => {
    return () => {
      if (attachmentPreviewUrl) {
        URL.revokeObjectURL(attachmentPreviewUrl);
      }
    };
  }, [attachmentPreviewUrl]);

  const clearAttachment = useCallback(() => {
    setSelectedImage(null);
    setAttachmentPreviewUrl(null);
  }, []);

  // Web Audio ile yumuşak bildirim tonu
  const playNotificationChime = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08); // A5
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.25);
    } catch {
      // Ses izni yoksa sessiz kal
    }
  }, []);

  const handleAttachmentSelect = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    try {
      validateSupportImageFile(file);
      setSelectedImage(file);
      setAttachmentPreviewUrl(URL.createObjectURL(file));
      setSendError(null);
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : 'Fotoğraf eklenemedi.',
      );
    }
  }, []);

  // Panodan görsel yapıştırma (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (!open) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            try {
              validateSupportImageFile(file);
              setSelectedImage(file);
              setAttachmentPreviewUrl(URL.createObjectURL(file));
              setSendError(null);
            } catch (err) {
              setSendError(
                err instanceof Error ? err.message : 'Fotoğraf eklenemedi.',
              );
            }
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [open]);

  // Test ve Yanlış Defteri ekranlarından "Hocama Sor" butonuyla tetikleme
  useEffect(() => {
    const handleOpenWithQuestion = (event: Event) => {
      const customEvent = event as CustomEvent<{
        questionText?: string;
        quizTitle?: string;
        questionIndex?: number;
      }>;
      const detail = customEvent.detail;
      if (!detail) return;

      setOpen(true);
      const parts: string[] = [];
      if (detail.quizTitle || typeof detail.questionIndex === 'number') {
        const title = detail.quizTitle || 'Test';
        const num =
          typeof detail.questionIndex === 'number'
            ? ` Soru #${detail.questionIndex + 1}`
            : '';
        parts.push(`📌 [${title}${num}]`);
      }
      if (detail.questionText) {
        parts.push(`"${detail.questionText.trim().slice(0, 160)}..."`);
      }
      parts.push('\nHocam, bu sorunun çözümünde şu adımı anlayamadım:\n');
      setDraft(parts.join('\n'));
    };

    window.addEventListener(
      'open-teacher-chat-with-question',
      handleOpenWithQuestion,
    );
    return () => {
      window.removeEventListener(
        'open-teacher-chat-with-question',
        handleOpenWithQuestion,
      );
    };
  }, []);

  // Admin Realtime bildirimleri dinleme
  useEffect(() => {
    if (!mounted || !currentUser?.isAdmin || !currentUser.id) return;
    const channel = supabase
      .channel(`admin_inbox_digest_${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          filter: `user_id=eq.${currentUser.id}`,
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const row = payload.new as { type?: string };
          if (row.type === 'message') {
            playNotificationChime();
            void loadAdminMessages(currentUser.id);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUser, loadAdminMessages, mounted, playNotificationChime]);

  // ESC ve dışarı tıklama ile kapatma
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(event.target as Node)) {
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

  // Yeni mesaj geldiğinde ses bildirimi
  const prevStudentUnreadRef = useRef(studentUnreadCount);
  useEffect(() => {
    if (studentUnreadCount > prevStudentUnreadRef.current) {
      playNotificationChime();
    }
    prevStudentUnreadRef.current = studentUnreadCount;
  }, [playNotificationChime, studentUnreadCount]);

  // Öğrenci balonu açıldığında okunmamışları sıfırlama ve yenileme
  useEffect(() => {
    if (!open || !currentUser || currentUser.isAdmin) return;
    void refetchStudentMessages();
    if (studentUnreadCount > 0) {
      void markAllStudentAsRead();
    }
  }, [currentUser, markAllStudentAsRead, open, refetchStudentMessages, studentUnreadCount]);

  // Admin: Seçilen öğrenci konuşma geçmişi
  const adminConversations = useMemo(
    () => buildConversations(inboxMessages),
    [inboxMessages],
  );

  const adminTotalUnread = useMemo(
    () => inboxMessages.filter((m) => !m.is_read).length,
    [inboxMessages],
  );

  const selectedPeerName = useMemo(() => {
    if (!selectedStudentId) return 'Öğrenci';
    return (
      adminConversations.find((c) => c.studentId === selectedStudentId)
        ?.studentName ?? 'Öğrenci'
    );
  }, [adminConversations, selectedStudentId]);

  const {
    fetchThread: fetchAdminThread,
    loading: adminThreadLoading,
    messages: adminThreadMessages,
  } = useAdminStudentThread({
    adminUserId: currentUser?.isAdmin ? currentUser.id : null,
    studentId: selectedStudentId,
  });

  // Admin mesaj gönderme
  const handleSendAdmin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = draft.trim();
    if ((!text && !selectedImage) || !selectedStudentId || sending) return;

    setSending(true);
    setSendError(null);
    try {
      const session = await getClientSession();
      if (!session?.access_token) {
        throw new Error('Oturum açmanız gerekiyor.');
      }
      const attachments = selectedImage
        ? await uploadSupportFiles([selectedImage], { imagesOnly: true })
        : [];
      const imageUrl =
        attachments.find((attachment) => attachment.kind === 'image')?.url || null;

      const response = await fetch('/api/admin-message', {
        body: JSON.stringify({
          image_url: imageUrl,
          message: text,
          sender_id: currentUser?.id,
          sender_name: 'Uğur Hoca',
          student_id: selectedStudentId,
          student_name: selectedPeerName,
        }),
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Mesaj gönderilemedi.');
      }

      setDraft('');
      clearAttachment();
      await fetchAdminThread();
      if (currentUser) void loadAdminMessages(currentUser.id);
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : 'Mesaj gönderilirken hata oluştu.',
      );
    } finally {
      setSending(false);
    }
  };

  // Öğrenci: Uğur Hoca'ya mesaj gönderme (Sadece Uğur Hoca ile sohbet)
  const handleSendStudent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = draft.trim();
    if ((!text && !selectedImage) || sending || !currentUser) return;

    setSending(true);
    setSendError(null);
    try {
      const session = await getClientSession();
      if (!session?.access_token) {
        throw new Error('Oturum açmanız gerekiyor.');
      }

      const attachments = selectedImage
        ? await uploadSupportFiles([selectedImage], { imagesOnly: true })
        : [];

      const sentRow = await sendSupportMessage(
        {
          attachments,
          sender_email: currentUser.email || '',
          sender_id: currentUser.id,
          sender_name: currentUser.name || 'Öğrenci',
          text,
        },
        session.access_token,
      );

      if (sentRow && typeof sentRow === 'object' && 'id' in sentRow) {
        appendStudentMessage(sentRow as DashboardNotification);
      } else {
        appendStudentMessage({
          created_at: new Date().toISOString(),
          id: `local-${Date.now()}`,
          is_read: true,
          message:
            text ||
            (attachments[0]?.name
              ? `[Fotoğraf: ${attachments[0].name}]`
              : ''),
          metadata: attachments.length ? { attachments } : undefined,
          title: "Uğur Hoca'ya Mesajınız",
          type: 'sent-message',
          user_id: currentUser.id,
        });
      }

      setDraft('');
      clearAttachment();
      void refetchStudentMessages();
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : 'Mesaj gönderilirken hata oluştu.',
      );
    } finally {
      setSending(false);
    }
  };

  // Canlı ders odasında floating bubble gizlenir (kendi dahili sohbeti vardır)
  if (!mounted || loading || pathname?.startsWith('/canli-ders/d/')) {
    return null;
  }

  const unreadCountBadge = currentUser?.isAdmin
    ? adminTotalUnread
    : currentUser
      ? studentUnreadCount
      : 0;

  return (
    <div ref={bubbleRef}>
      {/* Floating Trigger Button */}
      <motion.button
        type="button"
        initial={false}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex h-14 w-14 sm:h-[60px] sm:w-[60px] items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl shadow-purple-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400"
        aria-label={
          currentUser?.isAdmin
            ? 'Öğrenci mesajları'
            : "Uğur Hoca'ya mesaj yaz"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {!currentUser?.isAdmin ? (
          <div className="relative flex h-full w-full items-center justify-center">
            <Image
              src="/ugur.jpeg"
              alt="Uğur Hoca"
              width={48}
              height={48}
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-white/90 shadow-sm"
            />
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
          </div>
        ) : (
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.2} />
        )}

        {unreadCountBadge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] animate-pulse items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-md">
            {unreadCountBadge > 9 ? '9+' : unreadCountBadge}
          </span>
        )}
      </motion.button>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="fixed bottom-24 sm:bottom-24 right-3 sm:right-6 z-40 flex h-[min(580px,calc(100dvh-7.5rem))] min-h-0 w-[calc(100vw-1.5rem)] sm:w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-2xl shadow-2xl"
          >
            {/* 1. Senaryo: Giriş Yapmamış Ziyaretçi */}
            {!currentUser ? (
              <div className="flex h-full flex-col justify-between p-6 text-center">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    aria-label="Kapat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="my-auto space-y-4">
                  <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border-2 border-purple-500 p-0.5 shadow-lg">
                    <Image
                      src="/ugur.jpeg"
                      alt="Uğur Hoca"
                      width={80}
                      height={80}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">
                      Uğur Hoca ile Sohbet
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      Doğrudan benimle mesajlaşmak, sorularını iletmek veya ders takibi yapmak için giriş yapabilirsin.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col gap-2.5">
                    <Link
                      href="/giris"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all"
                    >
                      <LogIn className="h-4 w-4" /> Giriş Yap
                    </Link>
                    <Link
                      href="/kayit"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
                    >
                      <UserPlus className="h-4 w-4" /> Ücretsiz Hesap Oluştur
                    </Link>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Öğrenciler sadece öğretmenle 1-e-1 güvenli iletişim kurar.
                </p>
              </div>
            ) : currentUser.isAdmin ? (
              /* 2. Senaryo: Admin (Uğur Hoca) Paneli */
              !selectedStudentId ? (
                <>
                  <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 px-4 py-3.5">
                    <h2 className="text-sm font-bold text-white">
                      Öğrenci Sohbetleri
                    </h2>
                    {adminTotalUnread > 0 && (
                      <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[11px] font-bold text-red-400">
                        {adminTotalUnread} yeni
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => currentUser.id && loadAdminMessages(currentUser.id)}
                        className="rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                      >
                        Yenile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          setSelectedStudentId(null);
                          setDraft('');
                          setSendError(null);
                          clearAttachment();
                        }}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        aria-label="Kapat"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {adminConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
                        <MessageCircle className="h-10 w-10 text-slate-600" />
                        <p className="text-sm text-slate-400">
                          Henüz öğrenci mesajı bulunmuyor.
                        </p>
                      </div>
                    ) : (
                      adminConversations.map((c) => (
                        <button
                          key={c.studentId}
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(c.studentId);
                            setDraft('');
                            setSendError(null);
                            clearAttachment();
                          }}
                          className="flex w-full items-start gap-3 border-b border-slate-800/80 px-4 py-3.5 text-left transition-colors hover:bg-slate-800/50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                            {(c.studentName[0] || '?').toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-white">
                                {c.studentName}
                              </span>
                              {c.unreadCount > 0 && (
                                <span className="rounded-full bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 text-[10px] font-bold text-red-300">
                                  {c.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs text-slate-400 mt-0.5">
                              {c.lastSnippet || 'Ek veya mesaj'}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : adminThreadLoading ? (
                <div className="flex flex-1 items-center justify-center py-16 text-sm text-slate-400">
                  Yükleniyor…
                </div>
              ) : (
                <SupportChatPanel
                  appearance="admin"
                  draft={draft}
                  error={sendError}
                  inputDisabled={false}
                  messages={adminThreadMessages}
                  attachmentPreview={
                    selectedImage && attachmentPreviewUrl
                      ? { name: selectedImage.name, url: attachmentPreviewUrl }
                      : null
                  }
                  onAttachmentRemove={clearAttachment}
                  onAttachmentSelect={handleAttachmentSelect}
                  onBack={() => {
                    setSelectedStudentId(null);
                    setDraft('');
                    setSendError(null);
                    clearAttachment();
                    if (currentUser) void loadAdminMessages(currentUser.id);
                  }}
                  onClose={() => {
                    setOpen(false);
                    setSelectedStudentId(null);
                    setDraft('');
                    setSendError(null);
                    clearAttachment();
                  }}
                  onDraftChange={setDraft}
                  onSubmit={handleSendAdmin}
                  peerAvatarSrc={undefined}
                  peerDisplayName={selectedPeerName}
                  peerSubtitle="Öğrenci"
                  placeholder="Öğrenciye yanıt yaz..."
                  sending={sending}
                />
              )
            ) : (
              /* 3. Senaryo: Öğrenci (SADECE UĞUR HOCA İLE 1-E-1 SOHBET) */
              <SupportChatPanel
                appearance="navbar"
                draft={draft}
                error={sendError}
                messages={studentThreadMessages}
                onClose={() => setOpen(false)}
                onAttachmentRemove={clearAttachment}
                onAttachmentSelect={handleAttachmentSelect}
                onDraftChange={setDraft}
                onSubmit={handleSendStudent}
                attachmentPreview={
                  selectedImage && attachmentPreviewUrl
                    ? { name: selectedImage.name, url: attachmentPreviewUrl }
                    : null
                }
                peerAvatarSrc="/ugur.jpeg"
                peerDisplayName="Uğur Hoca"
                peerSubtitle="Çevrim içi • Genellikle 18:00–21:00 arası yanıtlar"
                placeholder="Uğur Hoca'ya mesaj yaz veya soru sor..."
                sending={sending}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
