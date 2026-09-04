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

type MessagesStore = {
  channel: ReturnType<typeof supabase.channel> | null;
  fetchPromise: Promise<void> | null;
  lastFetchedAt: number;
  listeners: Set<() => void>;
  loading: boolean;
  messages: DashboardNotification[];
  refCount: number;
};

const messageStores = new Map<string, MessagesStore>();

const getOrCreateMessageStore = (userId: string): MessagesStore => {
  let store = messageStores.get(userId);
  if (!store) {
    store = {
      channel: null,
      fetchPromise: null,
      lastFetchedAt: 0,
      listeners: new Set(),
      loading: false,
      messages: [],
      refCount: 0,
    };
    messageStores.set(userId, store);
  }
  return store;
};

const notifyMessageStoreListeners = (store: MessagesStore) => {
  store.listeners.forEach((listener) => listener());
};

export const useNavbarMessages = (userId: string | null | undefined) => {
  const [, setTick] = useState(0);

  const store = userId ? getOrCreateMessageStore(userId) : null;

  useEffect(() => {
    if (!userId || !store) {
      return;
    }

    const listener = () => setTick((t) => t + 1);
    store.listeners.add(listener);
    store.refCount += 1;

    const mergeIncoming = (incoming: DashboardNotification) => {
      if (
        incoming.type !== 'admin-message' &&
        incoming.type !== 'sent-message'
      ) {
        return;
      }
      if (store.messages.some((item) => item.id === incoming.id)) {
        return;
      }
      store.messages = sortAsc([...store.messages, incoming]).slice(-MESSAGE_LIMIT);
      notifyMessageStoreListeners(store);
    };

    if (!store.channel) {
      store.channel = supabase
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
            store.messages = store.messages.map((item) =>
              item.id === updated.id ? updated : item,
            );
            notifyMessageStoreListeners(store);
          },
        )
        .subscribe();
    }

    const now = Date.now();
    if (now - store.lastFetchedAt > 15_000 && !store.fetchPromise) {
      store.loading = store.messages.length === 0;
      store.fetchPromise = (async () => {
        try {
          const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .in('type', MESSAGE_TYPES as unknown as string[])
            .order('created_at', { ascending: false })
            .limit(MESSAGE_LIMIT);

          store.messages = sortAsc((data ?? []) as DashboardNotification[]);
          store.lastFetchedAt = Date.now();
        } finally {
          store.loading = false;
          store.fetchPromise = null;
          notifyMessageStoreListeners(store);
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

  const appendMessage = useCallback(
    (message: DashboardNotification) => {
      if (!store) return;
      if (store.messages.some((item) => item.id === message.id)) {
        return;
      }
      store.messages = sortAsc([...store.messages, message]).slice(-MESSAGE_LIMIT);
      notifyMessageStoreListeners(store);
    },
    [store],
  );

  const refetch = useCallback(async () => {
    if (!userId || !store) return;
    store.loading = true;
    notifyMessageStoreListeners(store);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .in('type', MESSAGE_TYPES as unknown as string[])
        .order('created_at', { ascending: false })
        .limit(MESSAGE_LIMIT);

      store.messages = sortAsc((data ?? []) as DashboardNotification[]);
      store.lastFetchedAt = Date.now();
    } finally {
      store.loading = false;
      notifyMessageStoreListeners(store);
    }
  }, [userId, store]);

  const markAllAsRead = useCallback(async () => {
    if (!store) return;
    const unreadIds = store.messages
      .filter((item) => item.type === 'admin-message' && !item.is_read)
      .map((item) => item.id);

    if (unreadIds.length === 0) return;

    store.messages = store.messages.map((item) =>
      unreadIds.includes(item.id) ? { ...item, is_read: true } : item,
    );
    notifyMessageStoreListeners(store);

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
  }, [store]);

  const messages = store ? store.messages : [];
  const loading = store ? store.loading : false;
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
