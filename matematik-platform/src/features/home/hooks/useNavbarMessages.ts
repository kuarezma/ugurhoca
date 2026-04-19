'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { DashboardNotification } from '@/types/dashboard';

const MESSAGE_LIMIT = 80;
const MESSAGE_TYPES = ['admin-message', 'sent-message'] as const;

const sortAsc = (items: DashboardNotification[]) =>
  [...items].sort(
    (left, right) =>
      new Date(left.created_at).getTime() -
      new Date(right.created_at).getTime(),
  );

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

    const channel = supabase
      .channel(`navbar-messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const incoming = payload.new as DashboardNotification;
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
    unreadCount,
  };
};
