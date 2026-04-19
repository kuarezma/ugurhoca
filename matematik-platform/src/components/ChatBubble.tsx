"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, MessageCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/admin";
import { getClientSession } from "@/lib/auth-client";
import { SupportChatPanel } from "@/features/messages/components/SupportChatPanel";
import { useAdminStudentThread } from "@/features/messages/hooks/useAdminStudentThread";
import {
  parseSupportPayload,
  type ParsedSupportPayload,
} from "@/features/messages/supportChatUtils";

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
    if (!sid) continue;
    const name = m.parsed?.sender_name || "Öğrenci";
    const snippet = m.parsed?.text?.trim() || "—";
    const prev = byStudent.get(sid);
    if (!prev || new Date(m.created_at) > new Date(prev.lastAt)) {
      byStudent.set(sid, {
        lastAt: m.created_at,
        lastSnippet: snippet,
        studentId: sid,
        studentName: name,
        unreadCount: 0,
      });
    }
  }

  for (const m of messages) {
    const sid = m.parsed?.sender_id;
    if (!sid || m.is_read) continue;
    const row = byStudent.get(sid);
    if (row) {
      row.unreadCount += 1;
    }
  }

  return [...byStudent.values()].sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  );
}

function ChatBubble() {
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadMessages = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "message")
      .order("created_at", { ascending: false })
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

  const checkAdmin = useCallback(async () => {
    try {
      const session = await getClientSession();
      if (session?.user && isAdminEmail(session.user.email)) {
        setIsAdmin(true);
        setAdminUserId(session.user.id);
        await loadMessages(session.user.id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [loadMessages]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    void checkAdmin();
  }, [checkAdmin, mounted]);

  useEffect(() => {
    if (!mounted || !adminUserId) return;
    const channel = supabase
      .channel(`admin_inbox_digest_${adminUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          filter: `user_id=eq.${adminUserId}`,
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const row = payload.new as { type?: string };
          if (row.type === "message") {
            void loadMessages(adminUserId);
          }
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [adminUserId, loadMessages, mounted]);

  const conversations = useMemo(
    () => buildConversations(inboxMessages),
    [inboxMessages],
  );

  const totalUnread = useMemo(
    () => inboxMessages.filter((m) => !m.is_read).length,
    [inboxMessages],
  );

  const selectedPeerName = useMemo(() => {
    if (!selectedStudentId) return "Öğrenci";
    return (
      conversations.find((c) => c.studentId === selectedStudentId)
        ?.studentName ?? "Öğrenci"
    );
  }, [conversations, selectedStudentId]);

  const { fetchThread, loading: threadLoading, messages: threadMessages } =
    useAdminStudentThread({
      adminUserId,
      studentId: selectedStudentId,
    });

  const handleSendAdmin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !selectedStudentId || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const session = await getClientSession();
      if (!session?.access_token) {
        throw new Error("Oturum açmanız gerekiyor.");
      }
      const response = await fetch("/api/admin-message", {
        body: JSON.stringify({
          message: text,
          sender_id: session.user?.id ?? "admin",
          sender_name: "Uğur Hoca",
          student_id: selectedStudentId,
          student_name: selectedPeerName,
          title: "Uğur Hoca yazdı",
        }),
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(body?.error || "Mesaj gönderilemedi.");
      }
      setDraft("");
      await fetchThread();
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "Mesaj gönderilemedi.",
      );
    } finally {
      setSending(false);
    }
  };

  if (!mounted || loading || !isAdmin) return null;

  return (
    <>
      <motion.button
        type="button"
        initial={false}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[100] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/30"
        aria-label="Öğrenci mesajları"
      >
        <MessageCircle className="h-7 w-7" strokeWidth={2} />
        {totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-24 right-4 z-[100] flex h-[min(560px,calc(100dvh-7rem))] min-h-0 w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl sm:right-6"
            style={{
              boxShadow: "0 25px 50px var(--shadow, rgba(0,0,0,0.25))",
            }}
          >
            {!selectedStudentId ? (
              <>
                <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                  <h2 className="text-sm font-bold text-[var(--text-strong)]">
                    Sohbetler
                  </h2>
                  {totalUnread > 0 && (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-500">
                      {totalUnread} yeni
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => adminUserId && loadMessages(adminUserId)}
                      className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)]"
                    >
                      Yenile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setSelectedStudentId(null);
                        setDraft("");
                        setSendError(null);
                      }}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-muted)]"
                      aria-label="Kapat"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <MessageCircle className="h-10 w-10 text-[var(--text-soft,#64748b)]" />
                      <p className="text-sm text-[var(--text-muted)]">
                        Henüz öğrenci mesajı yok.
                      </p>
                    </div>
                  ) : (
                    conversations.map((c) => (
                      <button
                        key={c.studentId}
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(c.studentId);
                          setDraft("");
                          setSendError(null);
                        }}
                        className="flex w-full items-start gap-3 border-b border-[var(--border)] px-4 py-3 text-left transition-colors hover:bg-[var(--bg-soft)]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[13px] font-bold text-white shadow-sm">
                          {(c.studentName[0] || "?").toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-[var(--text-strong)]">
                              {c.studentName}
                            </span>
                            {c.unreadCount > 0 ? (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                            ) : null}
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">
                            {c.lastSnippet}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[var(--text-soft,#64748b)]">
                            {new Date(c.lastAt).toLocaleString("tr-TR", {
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : threadLoading && threadMessages.length === 0 ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-16 text-sm text-[var(--text-muted)]">
                Yükleniyor…
              </div>
            ) : (
              <SupportChatPanel
                appearance="admin"
                draft={draft}
                error={sendError}
                inputDisabled={false}
                messages={threadMessages}
                onBack={() => {
                  setSelectedStudentId(null);
                  setDraft("");
                  setSendError(null);
                  if (adminUserId) void loadMessages(adminUserId);
                }}
                onClose={() => {
                  setOpen(false);
                  setSelectedStudentId(null);
                  setDraft("");
                  setSendError(null);
                }}
                onDraftChange={setDraft}
                onSubmit={handleSendAdmin}
                peerAvatarSrc={undefined}
                peerDisplayName={selectedPeerName}
                peerSubtitle="Öğrenci"
                placeholder="Mesaj yaz..."
                sending={sending}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatBubble;
