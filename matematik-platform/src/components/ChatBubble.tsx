"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/admin";
import { getClientSession } from "@/lib/auth-client";

type ParsedPayload = {
  sender_id: string;
  sender_name: string;
  sender_email?: string;
  text: string;
  attachments?: { name: string; url: string }[];
};

type InboxMessage = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  parsed: ParsedPayload | null;
};

function parsePayload(raw: string): ParsedPayload | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ChatBubble() {
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<InboxMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadMessages = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "message")
      .order("created_at", { ascending: false })
      .limit(60);

    if (data) {
      const formatted: InboxMessage[] = data.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        is_read: n.is_read,
        created_at: n.created_at,
        parsed: parsePayload(n.message),
      }));
      setMessages(formatted);
      setUnreadCount(formatted.filter((m) => !m.is_read).length);
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
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [loadMessages]);

  useEffect(() => {
    if (!mounted) return;
    checkAdmin();
  }, [checkAdmin, mounted]);

  const markAsRead = useCallback(async (msg: InboxMessage) => {
    if (msg.is_read) return;

    // DB'de okundu yap
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", msg.id);

    // Öğrenciye sadece "Uğur Hoca mesajını gördü" bildir — içerik YOK
    if (msg.parsed?.sender_id) {
      await supabase.from("notifications").insert({
        user_id: msg.parsed.sender_id,
        title: "Uğur Hoca mesajını gördü",
        message: "",
        type: "message-read",
        is_read: false,
      });
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const handleExpand = async (msg: InboxMessage) => {
    const next = expandedId === msg.id ? null : msg.id;
    setExpandedId(next);

    if (next && !msg.is_read) {
      await markAsRead(msg);
    }
    if (!next) {
      setReplyingTo(null);
      setReplyText("");
    }
  };

  const sendReply = async () => {
    if (!replyingTo?.parsed?.sender_id || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const session = await getClientSession();
      await fetch("/api/admin-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: replyingTo.parsed.sender_id,
          student_name: replyingTo.parsed.sender_name,
          title: "Uğur Hoca yazdı",
          message: replyText.trim(),
          sender_id: session?.user?.id ?? "admin",
          sender_name: "Uğur Hoca",
        }),
      });
      setReplyText("");
      setReplyingTo(null);
    } finally {
      setSendingReply(false);
    }
  };

  // Admin değilse hiçbir şey render etme
  if (!mounted || loading || !isAdmin) return null;

  return (
    <>
      {/* Tetikleyici buton */}
      <motion.button
        type="button"
        initial={false}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[100] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/30"
        aria-label="Gelen kutusu"
      >
        <MessageCircle className="h-7 w-7" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-24 right-4 z-[100] flex h-[min(560px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl sm:right-6"
            style={{ boxShadow: "0 25px 50px var(--shadow, rgba(0,0,0,0.25))" }}
          >
            {/* Başlık */}
            <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] px-4 py-3">
              <h2 className="text-sm font-bold text-[var(--text-strong)]">
                Öğrenci Mesajları
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-500">
                  {unreadCount} yeni
                </span>
              )}
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adminUserId && loadMessages(adminUserId)}
                  className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors"
                >
                  Yenile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setExpandedId(null);
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-muted)]"
                  aria-label="Kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Gelen kutusu */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <MessageCircle className="h-10 w-10 text-[var(--text-soft,#64748b)]" />
                  <p className="text-sm text-[var(--text-muted)]">
                    Henüz mesaj yok.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`border-b border-[var(--border)] transition-colors ${
                      !msg.is_read ? "bg-violet-500/5" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleExpand(msg)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[var(--bg-soft)] transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[13px] font-bold text-white shadow-sm">
                        {(msg.parsed?.sender_name || "?")[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`truncate text-sm font-semibold ${
                              !msg.is_read
                                ? "text-[var(--text-strong)]"
                                : "text-[var(--text)]"
                            }`}
                          >
                            {msg.parsed?.sender_name || msg.title}
                          </span>
                          {!msg.is_read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                          )}
                          {msg.is_read && (
                            <CheckCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">
                          {msg.parsed?.text || "—"}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--text-soft,#64748b)]">
                          {new Date(msg.created_at).toLocaleString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {expandedId === msg.id ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                      )}
                    </button>

                    {/* Açılır içerik */}
                    <AnimatePresence>
                      {expandedId === msg.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 px-4 pb-4">
                            <p className="whitespace-pre-wrap rounded-xl bg-[var(--bg-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--text)]">
                              {msg.parsed?.text || "—"}
                            </p>

                            {/* Ekler */}
                            {msg.parsed?.attachments &&
                              msg.parsed.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {msg.parsed.attachments.map((att, i) => (
                                    <a
                                      key={i}
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-lg bg-[var(--bg-soft)] px-2 py-1 text-xs text-[var(--text)] hover:underline"
                                    >
                                      📎 {att.name}
                                    </a>
                                  ))}
                                </div>
                              )}

                            {/* Cevap formu */}
                            {replyingTo?.id === msg.id ? (
                              <div className="space-y-2">
                                <textarea
                                  rows={3}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Cevabınız..."
                                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-violet-500"
                                  // eslint-disable-next-line jsx-a11y/no-autofocus -- sohbet açılınca cevap alanına otomatik odak
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyText("");
                                    }}
                                    className="flex-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors"
                                  >
                                    İptal
                                  </button>
                                  <button
                                    type="button"
                                    onClick={sendReply}
                                    disabled={sendingReply || !replyText.trim()}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 disabled:opacity-60"
                                  >
                                    <Send className="h-3 w-3" />
                                    {sendingReply
                                      ? "Gönderiliyor..."
                                      : "Gönder"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setReplyingTo(msg)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-600 hover:bg-violet-500/20 transition-colors dark:text-violet-400"
                              >
                                <Send className="h-3 w-3" />
                                Cevapla
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatBubble;
