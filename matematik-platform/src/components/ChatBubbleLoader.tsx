'use client';

import dynamic from 'next/dynamic';

const ChatBubble = dynamic(() => import('@/components/ChatBubble'), {
  ssr: false,
});

export function ChatBubbleLoader() {
  return <ChatBubble />;
}
