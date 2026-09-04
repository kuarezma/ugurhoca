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

type NotificationStore = {
  notifications: DashboardNotification[];
  loading: boolean;
  channel: ReturnType<typeof supabase.channel> | null;
  listeners: Set<() => void>;
  fetchPromise: Promise<void> | null;
  lastFetchedAt: number;
  refCount: number;
};

const stores = new Map<string, NotificationStore>();

const getOrCreateStore = (userId: string): NotificationStore => {
  let store = stores.get(userId);
  if (!store) {
    store = {
      channel: null,
      fetchPromise: null,
      lastFetchedAt: 0,
      listeners: new Set(),
      loading: false,
      notifications: [],
      refCount: 0,
    };
    stores.set(userId, store);
  }
  return store;
};

const notifyStoreListeners = (store: NotificationStore) => {
  store.listeners.forEach((listener) => listener());
};

export const useNavbarNotifications = (userId: string | null | undefined) => {
  const [, setTick] = useState(0);

  const store = userId ? getOrCreateStore(userId) : null;

  useEffect(() => {
    if (!userId || !store) {
      return;
    }

    const listener = () => setTick((t) => t + 1);
    store.listeners.add(listener);
    store.refCount += 1;

    if (!store.channel) {
      store.channel = supabase
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
            store.notifications = sortDesc([
              incoming,
              ...store.notifications.filter((item) => item.id !== incoming.id),
            ]).slice(0, NOTIFICATION_LIMIT);
            notifyStoreListeners(store);
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
            store.notifications = store.notifications.map((item) =>
              item.id === updated.id ? updated : item,
            );
            notifyStoreListeners(store);
          },
        )
        .subscribe();
    }

    const now = Date.now();
    if (now - store.lastFetchedAt > 15_000 && !store.fetchPromise) {
      store.loading = store.notifications.length === 0;
      store.fetchPromise = (async () => {
        try {
          const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(NOTIFICATION_LIMIT);

          store.notifications = sortDesc((data ?? []) as DashboardNotification[]);
          store.lastFetchedAt = Date.now();
        } finally {
          store.loading = false;
          store.fetchPromise = null;
          notifyStoreListeners(store);
        }
      })();
    }

    return () => {
      store.listeners.delete(listener);
      store.refCount -= 1;
      if (store.refCount <= 0) {
        store.refCount = 0;
        if (store.channel) {
          void supabase.removeChannel(store.channel);
          store.channel = null;
        }
      }
    };
  }, [userId, store]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!store) return;
      store.notifications = store.notifications.map((item) =>
        item.id === id ? { ...item, is_read: true } : item,
      );
      notifyStoreListeners(store);

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    },
    [store],
  );

  const markAllAsRead = useCallback(async () => {
    if (!store) return;
    const unreadIds = store.notifications
      .filter((item) => !item.is_read)
      .map((item) => item.id);

    if (unreadIds.length === 0) return;

    store.notifications = store.notifications.map((item) =>
      unreadIds.includes(item.id) ? { ...item, is_read: true } : item,
    );
    notifyStoreListeners(store);

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
  }, [store]);

  const notifications = store ? store.notifications : [];
  const loading = store ? store.loading : false;
  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return {
    loading,
    markAllAsRead,
    markAsRead,
    notifications,
    unreadCount,
  };
};
