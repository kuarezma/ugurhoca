"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { LiveLessonChatMessage } from "@/features/live-lessons/types";

type Props = {
  lessonId: string;
};

export function LiveLessonChatPanel({ lessonId }: Props) {
  const [messages, setMessages] = useState<LiveLessonChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const mergeMessages = useCallback((nextMessages: LiveLessonChatMessage[]) => {
    setMessages((current) => {
      const byId = new Map(current.map((message) => [message.id, message]));
      for (const message of nextMessages) byId.set(message.id, message);
      return [...byId.values()].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    });
  }, []);

  const loadMessages = useCallback(async () => {
    const response = await fetch(`/api/live-lessons/${lessonId}/chat`, {
      credentials: "same-origin",
    });
    const payload = (await response.json().catch(() => null)) as {
      messages?: LiveLessonChatMessage[];
    } | null;
    setMessages(payload?.messages || []);
  }, [lessonId]);

  useEffect(() => {
    void loadMessages();
    const fallbackId = window.setInterval(() => void loadMessages(), 15000);
    const channel = supabase
      .channel(`live-lesson-chat:${lessonId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          filter: `lesson_id=eq.${lessonId}`,
          schema: "public",
          table: "live_lesson_chat_messages",
        },
        (payload) => {
          mergeMessages([payload.new as LiveLessonChatMessage]);
        },
      )
      .subscribe();

    return () => {
      window.clearInterval(fallbackId);
      void supabase.removeChannel(channel);
    };
  }, [lessonId, loadMessages, mergeMessages]);

  const sendMessage = useCallback(async () => {
    const message = text.trim();
    if (!message) return;
    setSending(true);
    try {
      const response = await fetch(`/api/live-lessons/${lessonId}/chat`, {
        body: JSON.stringify({ message }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: LiveLessonChatMessage;
        } | null;
        setText("");
        if (payload?.message) mergeMessages([payload.message]);
      }
    } finally {
      setSending(false);
    }
  }, [lessonId, mergeMessages, text]);

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold">Ders sohbeti</h2>
      </div>
      <div className="min-h-32 flex-1 space-y-2 overflow-y-auto p-3 text-xs">
        {messages.length === 0 ? (
          <p className="text-foreground/50">Henüz mesaj yok.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="rounded-lg bg-foreground/5 p-2">
              <p className="font-semibold">
                {message.user_name}{" "}
                <span className="font-normal text-foreground/50">
                  {message.role === "teacher" ? "Öğretmen" : "Öğrenci"}
                </span>
              </p>
              <p className="mt-1 break-words text-foreground/80">{message.message}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 border-t border-border p-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void sendMessage();
          }}
          maxLength={500}
          placeholder="Mesaj yaz"
          className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <button
          type="button"
          onClick={() => void sendMessage()}
          disabled={sending || !text.trim()}
          className="rounded-lg bg-brand-primary px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Gönder
        </button>
      </div>
    </section>
  );
}
