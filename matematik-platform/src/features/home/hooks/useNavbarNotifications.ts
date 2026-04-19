'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { DashboardNotification } from '@/types/dashboard';

const NOTIFICATION_LIMIT = 20;

const sortDesc = (items: DashboardNotification[]) =>
  [...items].sort(
    (left, right) =>
      new Date(right.created_at).getTime() -
      new Date(left.created_at).getTime(),
  );

export const useNavbarNotifications = (userId: string | null | undefined) => {
  const [notifications, setNotifications] = useState<DashboardNotification[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async (targetUserId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(NOTIFICATION_LIMIT);

    setNotifications(sortDesc((data ?? []) as DashboardNotification[]));
  }, []);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        await fetchNotifications(userId);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    const channel = supabase
      .channel(`navbar-notifications-${userId}`)
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
          setNotifications((current) =>
            sortDesc([
              incoming,
              ...current.filter((item) => item.id !== incoming.id),
            ]).slice(0, NOTIFICATION_LIMIT),
          );
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
          setNotifications((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, is_read: true } : item,
      ),
    );

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter((item) => !item.is_read)
      .map((item) => item.id);

    if (unreadIds.length === 0) return;

    setNotifications((current) =>
      current.map((item) =>
        unreadIds.includes(item.id) ? { ...item, is_read: true } : item,
      ),
    );

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
  }, [notifications]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return {
    loading,
    markAllAsRead,
    markAsRead,
    notifications,
    unreadCount,
  };
};
