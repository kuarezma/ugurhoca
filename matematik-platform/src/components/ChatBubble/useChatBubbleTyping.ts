'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  getStudentMessagesChannelName,
  TYPING_BROADCAST_EVENT,
  type TypingPayload,
} from '@/lib/realtime/studentMessagesChannel';

export type UseChatBubbleTypingOptions = {
  open: boolean;
  currentUser: {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
  } | null;
  selectedStudentId: string | null;
};

export function useChatBubbleTyping({
  open,
  currentUser,
  selectedStudentId,
}: UseChatBubbleTypingOptions) {
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null,
  );
  const lastTypingBroadcastRef = useRef<number | null>(null);

  const activeStudentIdForChannel = currentUser?.isAdmin
    ? selectedStudentId
    : currentUser?.id;

  useEffect(() => {
    setPeerTyping(false);
    if (!activeStudentIdForChannel || !open) return;

    const channelName = getStudentMessagesChannelName(
      activeStudentIdForChannel,
    );
    const channel = supabase.channel(channelName);
    typingChannelRef.current = channel;

    channel
      .on('broadcast', { event: TYPING_BROADCAST_EVENT }, (payload) => {
        const data = payload?.payload as TypingPayload | undefined;
        if (typingChannelRef.current !== channel) return;
        if (data && data.senderId !== currentUser?.id) {
          setPeerTyping(Boolean(data.isTyping));
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          if (data.isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setPeerTyping(false);
            }, 3000);
          }
        }
      })
      .subscribe();

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (broadcastTypingTimeoutRef.current)
        clearTimeout(broadcastTypingTimeoutRef.current);
      typingTimeoutRef.current = null;
      broadcastTypingTimeoutRef.current = null;
      typingChannelRef.current = null;
      lastTypingBroadcastRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [activeStudentIdForChannel, currentUser?.id, open]);

  const handleTriggerTyping = useCallback(() => {
    const channel = typingChannelRef.current;
    if (!channel || !currentUser || !open) return;

    const now = Date.now();
    if (
      typeof channel.send === 'function' &&
      (lastTypingBroadcastRef.current === null ||
        now - lastTypingBroadcastRef.current >= 800)
    ) {
      lastTypingBroadcastRef.current = now;
      void channel.send({
        event: TYPING_BROADCAST_EVENT,
        payload: {
          isTyping: true,
          senderId: currentUser.id,
          senderName: currentUser.name,
        },
        type: 'broadcast',
      });
    }

    if (broadcastTypingTimeoutRef.current) {
      clearTimeout(broadcastTypingTimeoutRef.current);
    }
    broadcastTypingTimeoutRef.current = setTimeout(() => {
      if (typingChannelRef.current !== channel) return;
      broadcastTypingTimeoutRef.current = null;
      lastTypingBroadcastRef.current = null;
      if (typeof channel.send === 'function') {
        void channel.send({
          event: TYPING_BROADCAST_EVENT,
          payload: {
            isTyping: false,
            senderId: currentUser.id,
            senderName: currentUser.name,
          },
          type: 'broadcast',
        });
      }
    }, 2500);
  }, [currentUser, open]);

  return { peerTyping, triggerTyping: handleTriggerTyping };
}
