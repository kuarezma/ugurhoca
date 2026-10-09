'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { DashboardNotification } from '@/types/dashboard';
import { loadNavbarRows } from '@/features/home/hooks/navbarRows';

const NOTIFICATION_LIMIT = 20;

/**
 * Bildirim çanında sadece Yaprak Test ve Ödev bildirimleri gösterilir.
 * Sohbet mesajları bağımsız Sohbet Balonuna (ChatBubble) aittir.
 * Canlı ders veya diğer genel duyurular zili tetiklemez.
 */
export function isBellNotification(notification: DashboardNotification): boolean {
  const type = notification.type;

  // Mesaj/sohbet bildirimleri kesinlikle zilde gösterilmez (sohbet balonu yönetir)
  if (
    type === 'message' ||
    type === 'admin-message' ||
    type === 'message-read' ||
    type === 'sent-message'
  ) {
    return false;
  }

  // Canlı ders bildirimleri zilde gösterilmez
  if (type === 'live-lesson') {
    return false;
  }

  const title = (notification.title || '').toLowerCase();
  const message = (notification.message || '').toLowerCase();

  // 1. Ödev bildirimleri
  if (type === 'assignment' || title.includes('ödev') || message.includes('ödev')) {
    return true;
  }

  // 2. Yaprak test / test bildirimleri
  if (
    type === 'document' ||
    title.includes('yaprak test') ||
    message.includes('yaprak test') ||
    title.includes('test') ||
    message.includes('test')
  ) {
    return true;
  }

  return false;
}

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

const getStores = (): Map<string, NotificationStore> => {
  const g = globalThis as unknown as {
    __ugurhoca_notification_stores__?: Map<string, NotificationStore>;
  };
  if (!g.__ugurhoca_notification_stores__) {
    g.__ugurhoca_notification_stores__ = new Map();
  }
  return g.__ugurhoca_notification_stores__;
};

const getOrCreateStore = (userId: string): NotificationStore => {
  const stores = getStores();
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
      const channelName = `navbar-notifications-${userId}`;
      if (typeof supabase.getChannels === 'function') {
        const existing = supabase
          .getChannels()
          .find((c) => c.topic === `realtime:${channelName}` || c.topic === channelName);
        if (existing) {
          void supabase.removeChannel(existing);
        }
      }
      store.channel = supabase
        .channel(channelName)
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
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const deletedId = (payload.old as { id?: string })?.id;
            if (deletedId) {
              store.notifications = store.notifications.filter(
                (item) => item.id !== deletedId,
              );
              notifyStoreListeners(store);
            }
          },
        )
        .subscribe();
    }

    const now = Date.now();
    if (now - store.lastFetchedAt > 30_000 && !store.fetchPromise) {
      store.loading = store.notifications.length === 0;
      store.fetchPromise = (async () => {
        try {
          const rows = await loadNavbarRows(userId);

          store.notifications = sortDesc(rows.slice(0, NOTIFICATION_LIMIT));
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
        setTimeout(() => {
          if (store.refCount <= 0 && store.channel) {
            void supabase.removeChannel(store.channel);
            store.channel = null;
          }
        }, 5000);
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
      .filter((item) => isBellNotification(item) && !item.is_read)
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

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!store) return;
      store.notifications = store.notifications.filter((item) => item.id !== id);
      notifyStoreListeners(store);

      await supabase.from('notifications').delete().eq('id', id);
    },
    [store],
  );

  const notifications = useMemo(
    () => (store ? store.notifications.filter(isBellNotification) : []),
    [store],
  );
  const loading = store ? store.loading : false;
  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return {
    deleteNotification,
    loading,
    markAllAsRead,
    markAsRead,
    notifications,
    unreadCount,
  };
};
