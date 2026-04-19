'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  ADMIN_MESSAGE_BROADCAST_EVENT,
  getStudentMessagesChannelName,
} from '@/lib/realtime/studentMessagesChannel';
import type { DashboardNotification } from '@/types/dashboard';

const MESSAGE_LIMIT = 80;
const MESSAGE_TYPES = ['admin-message', 'sent-message'] as const;

const sortAsc = (items: DashboardNotification[]) =>
  [...items].sort(
    (left, right) =>
      new Date(left.created_at).getTime() -
      new Date(right.created_at).getTime(),
  );

const parseBroadcastPayload = (
  raw: unknown,
): DashboardNotification | null => {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (
    'payload' in obj &&
    obj.payload &&
    typeof obj.payload === 'object' &&
    'id' in (obj.payload as object)
  ) {
    return obj.payload as DashboardNotification;
  }
  if ('id' in obj && 'type' in obj) {
    return raw as DashboardNotification;
  }
  return null;
};

export const useNavbarMessages = (userId: string | null | undefined) => {
  const [messages, setMessages] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async (targetUserId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUserId)
      .in('type', MESSAGE_TYPES as unknown as string[])
      .order('created_at', { ascending: false })
      .limit(MESSAGE_LIMIT);

    setMessages(sortAsc((data ?? []) as DashboardNotification[]));
  }, []);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        await fetchMessages(userId);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    const mergeIncoming = (incoming: DashboardNotification) => {
      if (
        incoming.type !== 'admin-message' &&
        incoming.type !== 'sent-message'
      ) {
        return;
      }
      setMessages((current) => {
        if (current.some((item) => item.id === incoming.id)) {
          return current;
        }
        return sortAsc([...current, incoming]).slice(-MESSAGE_LIMIT);
      });
    };

    const channel = supabase
      .channel(getStudentMessagesChannelName(userId))
      .on(
        'broadcast',
        { event: ADMIN_MESSAGE_BROADCAST_EVENT },
        (payload) => {
          const row = parseBroadcastPayload(payload);
          if (row?.type === 'admin-message') {
            mergeIncoming(row);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          mergeIncoming(payload.new as DashboardNotification);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as DashboardNotification;
          if (
            updated.type !== 'admin-message' &&
            updated.type !== 'sent-message'
          ) {
            return;
          }
          setMessages((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [userId, fetchMessages]);

  const appendMessage = useCallback((message: DashboardNotification) => {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) {
        return current;
      }
      return sortAsc([...current, message]).slice(-MESSAGE_LIMIT);
    });
  }, []);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await fetchMessages(userId);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchMessages]);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = messages
      .filter((item) => item.type === 'admin-message' && !item.is_read)
      .map((item) => item.id);

    if (unreadIds.length === 0) return;

    setMessages((current) =>
      current.map((item) =>
        unreadIds.includes(item.id) ? { ...item, is_read: true } : item,
      ),
    );

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
  }, [messages]);

  const unreadCount = messages.filter(
    (item) => item.type === 'admin-message' && !item.is_read,
  ).length;

  return {
    appendMessage,
    loading,
    markAllAsRead,
    messages,
    refetch,
    unreadCount,
  };
};
