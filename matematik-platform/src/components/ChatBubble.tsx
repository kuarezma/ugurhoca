'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admin';
import { getClientSession } from '@/lib/auth-client';
import {
  sendSupportMessage,
  uploadSupportFiles,
} from '@/features/home/queries';
import { useNavbarMessages } from '@/features/home/hooks/useNavbarMessages';
import { useScrollContainment } from '@/hooks/useScrollContainment';
import { useAdminStudentThread } from '@/features/messages/hooks/useAdminStudentThread';
import { mapStudentNotificationsToThread } from '@/features/messages/mapNotificationsToThread';
import type { DashboardNotification } from '@/types/dashboard';
import type { InboxMessage } from './ChatBubble/types';
import {
  buildConversations,
  parseInboxPayload,
  playNotificationChime,
  useSafeTheme,
} from './ChatBubble/utils';
import { ChatBubbleTrigger } from './ChatBubble/ChatBubbleTrigger';
import { ChatBubbleModal } from './ChatBubble/ChatBubbleModal';
import { useChatBubbleTyping } from './ChatBubble/useChatBubbleTyping';
import { useChatBubbleAttachments } from './ChatBubble/useChatBubbleAttachments';

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
  const isLight = useSafeTheme();

  // Admin state
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  // Form & Ekler state
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  useScrollContainment(panelRef, { enabled: open });

  // Ek dosya hook'u
  const {
    selectedFiles,
    attachmentPreviews,
    clearAttachments,
    handleAttachmentRemove,
    handleAttachmentSelect,
  } = useChatBubbleAttachments({ open, setSendError });

  // Realtime Canlı Yazıyor (Typing) Hook'u
  const { peerTyping, triggerTyping } = useChatBubbleTyping({
    currentUser,
    open,
    selectedStudentId,
  });

  // Öğrenci mesaj hook'u (sadece öğrenci ise aktif)
  const studentUserId =
    currentUser && !currentUser.isAdmin ? currentUser.id : '';
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
    const handleOpenChat = () => {
      setOpen(true);
    };
    window.addEventListener('open-chat-bubble', handleOpenChat);
    return () => {
      window.removeEventListener(
        'open-teacher-chat-with-question',
        handleOpenWithQuestion,
      );
      window.removeEventListener('open-chat-bubble', handleOpenChat);
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
  }, [currentUser, loadAdminMessages, mounted]);

  // ESC ve dışarı tıklama ile kapatma
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bubbleRef.current &&
        !bubbleRef.current.contains(event.target as Node)
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

  // Dialog Erişilebilirliği: Açıldığında Focus Trap ve Auto-focus
  useEffect(() => {
    if (!open || !bubbleRef.current) return;

    const modal = bubbleRef.current;
    const textarea = modal.querySelector<HTMLTextAreaElement>('textarea');
    if (textarea) {
      setTimeout(() => textarea.focus(), 150);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Yeni mesaj geldiğinde ses bildirimi
  const prevStudentUnreadRef = useRef(studentUnreadCount);
  useEffect(() => {
    if (studentUnreadCount > prevStudentUnreadRef.current) {
      playNotificationChime();
    }
    prevStudentUnreadRef.current = studentUnreadCount;
  }, [studentUnreadCount]);

  // Öğrenci balonu açıldığında okunmamışları sıfırlama ve yenileme
  useEffect(() => {
    if (!open || !currentUser || currentUser.isAdmin) return;
    void refetchStudentMessages();
    if (studentUnreadCount > 0) {
      void markAllStudentAsRead();
    }
  }, [
    currentUser,
    markAllStudentAsRead,
    open,
    refetchStudentMessages,
    studentUnreadCount,
  ]);

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
    if ((!text && selectedFiles.length === 0) || !selectedStudentId || sending)
      return;

    setSending(true);
    setSendError(null);
    try {
      const session = await getClientSession();
      if (!session?.access_token) {
        throw new Error('Oturum açmanız gerekiyor.');
      }
      const attachments =
        selectedFiles.length > 0 ? await uploadSupportFiles(selectedFiles) : [];
      const imageUrl =
        attachments.find((attachment) => attachment.kind === 'image')?.url ||
        null;

      const response = await fetch('/api/admin-message', {
        body: JSON.stringify({
          attachments,
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
      clearAttachments();
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
    if ((!text && selectedFiles.length === 0) || sending || !currentUser)
      return;

    setSending(true);
    setSendError(null);
    try {
      const session = await getClientSession();
      if (!session?.access_token) {
        throw new Error('Oturum açmanız gerekiyor.');
      }

      const attachments =
        selectedFiles.length > 0 ? await uploadSupportFiles(selectedFiles) : [];

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
            (attachments[0]?.name ? `[Ek: ${attachments[0].name}]` : ''),
          metadata: attachments.length ? { attachments } : undefined,
          title: "Uğur Hoca'ya Mesajınız",
          type: 'sent-message',
          user_id: currentUser.id,
        });
      }

      setDraft('');
      clearAttachments();
      void refetchStudentMessages();
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : 'Mesaj gönderilirken hata oluştu.',
      );
    } finally {
      setSending(false);
    }
  };

  // Sesli Mesaj Gönderimi
  const handleVoiceRecordComplete = useCallback(
    async (audioFile: File) => {
      if (!currentUser) return;
      setSending(true);
      setSendError(null);

      try {
        const session = await getClientSession();
        if (!session?.access_token) {
          throw new Error('Oturum açmanız gerekiyor.');
        }

        const uploaded = await uploadSupportFiles([audioFile]);
        const audioAttachment = uploaded[0];
        if (!audioAttachment) throw new Error('Ses kaydı yüklenemedi.');

        if (currentUser.isAdmin && selectedStudentId) {
          const response = await fetch('/api/admin-message', {
            body: JSON.stringify({
              attachments: [audioAttachment],
              image_url: null,
              message: '🎤 [Sesli Mesaj]',
              sender_id: currentUser.id,
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
            throw new Error('Sesli mesaj gönderilemedi.');
          }
          await fetchAdminThread();
        } else {
          const sentRow = await sendSupportMessage(
            {
              attachments: [audioAttachment],
              sender_email: currentUser.email || '',
              sender_id: currentUser.id,
              sender_name: currentUser.name || 'Öğrenci',
              text: '🎤 [Sesli Mesaj]',
            },
            session.access_token,
          );

          if (sentRow && typeof sentRow === 'object' && 'id' in sentRow) {
            appendStudentMessage(sentRow as DashboardNotification);
          }
          void refetchStudentMessages();
        }
      } catch (err) {
        setSendError(
          err instanceof Error ? err.message : 'Sesli mesaj gönderilemedi.',
        );
      } finally {
        setSending(false);
      }
    },
    [
      appendStudentMessage,
      currentUser,
      fetchAdminThread,
      refetchStudentMessages,
      selectedPeerName,
      selectedStudentId,
    ],
  );

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
      <ChatBubbleTrigger
        open={open}
        onToggle={() => setOpen((o) => !o)}
        isAdmin={Boolean(currentUser?.isAdmin)}
        unreadCount={unreadCountBadge}
      />

      {/* Floating Chat Panel Modal */}
      <ChatBubbleModal
        open={open}
        panelRef={panelRef}
        isLight={isLight}
        currentUser={currentUser}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={setSelectedStudentId}
        adminTotalUnread={adminTotalUnread}
        adminConversations={adminConversations}
        loadAdminMessages={loadAdminMessages}
        adminThreadLoading={adminThreadLoading}
        adminThreadMessages={adminThreadMessages}
        studentThreadMessages={studentThreadMessages}
        attachmentPreviews={attachmentPreviews}
        draft={draft}
        setDraft={setDraft}
        sendError={sendError}
        setSendError={setSendError}
        clearAttachments={clearAttachments}
        handleAttachmentRemove={handleAttachmentRemove}
        handleAttachmentSelect={handleAttachmentSelect}
        setOpen={setOpen}
        handleSendAdmin={handleSendAdmin}
        handleSendStudent={handleSendStudent}
        handleTriggerTyping={triggerTyping}
        handleVoiceRecordComplete={handleVoiceRecordComplete}
        selectedPeerName={selectedPeerName}
        peerTyping={peerTyping}
        sending={sending}
      />
    </div>
  );
}
