'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

const ChatBubble = lazy(() => import('@/components/ChatBubble'));

type ChatQuestionContext = {
  questionText?: string;
  quizTitle?: string;
  questionIndex?: number;
};

type PendingChatEvent = {
  id: number;
  name: 'open-chat-bubble' | 'open-teacher-chat-with-question';
  detail?: ChatQuestionContext;
};

let pendingEventId = 0;
const REPLAYED_CHAT_EVENT = Symbol('replayed-chat-event');

type ReplayableChatDetail = ChatQuestionContext & {
  [REPLAYED_CHAT_EVENT]?: boolean;
};

function isReplayedChatEvent(event: Event): boolean {
  return Boolean(
    (event as CustomEvent<ReplayableChatDetail>).detail?.[REPLAYED_CHAT_EVENT],
  );
}

function ChatEventReplay({ event }: { event: PendingChatEvent }) {
  useEffect(() => {
    const replayTimer = window.setTimeout(() => {
      const detail: ReplayableChatDetail = {
        ...event.detail,
        [REPLAYED_CHAT_EVENT]: true,
      };
      window.dispatchEvent(new CustomEvent(event.name, { detail }));
    }, 0);

    return () => window.clearTimeout(replayTimer);
  }, [event]);

  return null;
}

export function ChatBubbleLoader() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<PendingChatEvent>();

  useEffect(() => {
    let idleHandle: number | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const loadChat = () => setShouldLoad(true);
    const cancelScheduledLoad = () => {
      if (idleHandle !== null) {
        window.cancelIdleCallback(idleHandle);
        idleHandle = null;
      }
      if (fallbackTimer !== null) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };
    const openChat = (event: Event) => {
      if (isReplayedChatEvent(event)) return;
      cancelScheduledLoad();
      setShouldLoad(true);
      setPendingEvent({ id: ++pendingEventId, name: 'open-chat-bubble' });
    };
    const openChatWithQuestion = (event: Event) => {
      if (isReplayedChatEvent(event)) return;
      cancelScheduledLoad();
      const detail = (event as CustomEvent<ChatQuestionContext>).detail;
      setShouldLoad(true);
      setPendingEvent({
        id: ++pendingEventId,
        name: 'open-teacher-chat-with-question',
        detail,
      });
    };
    const scheduleLoad = () => {
      if ('requestIdleCallback' in window) {
        idleHandle = window.requestIdleCallback(loadChat, { timeout: 2_000 });
        return;
      }

      fallbackTimer = setTimeout(loadChat, 750);
    };

    if (document.readyState === 'complete') {
      scheduleLoad();
    } else {
      window.addEventListener('load', scheduleLoad, { once: true });
    }
    window.addEventListener('open-chat-bubble', openChat);
    window.addEventListener(
      'open-teacher-chat-with-question',
      openChatWithQuestion,
    );

    return () => {
      window.removeEventListener('load', scheduleLoad);
      window.removeEventListener('open-chat-bubble', openChat);
      window.removeEventListener(
        'open-teacher-chat-with-question',
        openChatWithQuestion,
      );
      cancelScheduledLoad();
    };
  }, []);

  return shouldLoad ? (
    <Suspense fallback={null}>
      <ChatBubble />
      {pendingEvent ? <ChatEventReplay event={pendingEvent} /> : null}
    </Suspense>
  ) : null;
}
