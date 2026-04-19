'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { ThreadMessage } from '@/features/messages/types';
import { parseSupportPayload } from '@/features/messages/supportChatUtils';

function rowToIncomingThreadMessage(row: {
  id: string;
  created_at: string;
  message: string;
}): ThreadMessage {
  const parsed = parseSupportPayload(row.message);
  const imageUrl =
    parsed?.attachments?.find((a) => a.kind === 'image')?.url ?? null;
  return {
    created_at: row.created_at,
    id: `in-${row.id}`,
    imageUrl,
    isOwn: false,
    text: parsed?.text || '',
  };
}

function rowToOutgoingThreadMessage(row: {
  id: string;
  created_at: string;
  message: string | null;
  metadata?: { image_url?: string | null } | null;
}): ThreadMessage {
  return {
    created_at: row.created_at,
    id: `out-${row.id}`,
    imageUrl: row.metadata?.image_url ?? null,
    isOwn: true,
    text: row.message || '',
  };
}

async function markAdminInboxReadForStudent(
  adminId: string,
  studentId: string,
) {
  const { data } = await supabase
    .from('notifications')
    .select('id, message, is_read')
    .eq('user_id', adminId)
    .eq('type', 'message')
    .eq('is_read', false);

  const rows = (data || []).filter(
    (n) => parseSupportPayload(n.message)?.sender_id === studentId,
  );

  for (const row of rows) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', row.id);

    await supabase.from('notifications').insert({
      is_read: false,
      message: '',
      title: 'Uğur Hoca mesajını gördü',
      type: 'message-read',
      user_id: studentId,
    });
  }
}

type UseAdminStudentThreadOptions = {
  adminUserId: string | null;
  studentId: string | null;
};

export function useAdminStudentThread({
  adminUserId,
  studentId,
}: UseAdminStudentThreadOptions) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchThread = useCallback(async () => {
    if (!adminUserId || !studentId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setMessages([]);
        return;
      }

      const res = await fetch(
        `/api/admin-conversation-thread?student_id=${encodeURIComponent(studentId)}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const json = (await res.json().catch(() => null)) as
        | { data?: { messages?: ThreadMessage[] }; error?: { message?: string } }
        | null;

      if (!res.ok || !json) {
        setMessages([]);
        return;
      }

      const merged = json.data?.messages ?? [];
      setMessages(merged);

      await markAdminInboxReadForStudent(adminUserId, studentId);
    } finally {
      setLoading(false);
    }
  }, [adminUserId, studentId]);

  useEffect(() => {
    void fetchThread();
  }, [fetchThread]);

  useEffect(() => {
    if (!adminUserId || !studentId) {
      return;
    }

    const mergeIncoming = (row: ThreadMessage) => {
      setMessages((current) => {
        if (current.some((m) => m.id === row.id)) {
          return current;
        }
        return [...current, row].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      });
    };

    const channel = supabase
      .channel(`admin_thread_${adminUserId}_${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          filter: `user_id=eq.${adminUserId}`,
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            type: string;
            message: string;
            created_at: string;
          };
          if (row.type !== 'message') return;
          const parsed = parseSupportPayload(row.message);
          if (parsed?.sender_id !== studentId) return;
          mergeIncoming(rowToIncomingThreadMessage(row));
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          filter: `user_id=eq.${studentId}`,
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            type: string;
            message: string | null;
            created_at: string;
            metadata?: { image_url?: string | null } | null;
          };
          if (row.type !== 'admin-message') return;
          mergeIncoming(rowToOutgoingThreadMessage(row));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [adminUserId, studentId]);

  return { fetchThread, loading, messages, setMessages };
}
