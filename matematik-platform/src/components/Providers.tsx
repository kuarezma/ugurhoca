'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import AuthCookieSync from '@/components/AuthCookieSync';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FloatingThemeToggle } from '@/components/ThemeToggle';

const CommandPalette = dynamic(() => import('@/components/CommandPalette'), {
  ssr: false,
});

const ChatBubbleLoader = dynamic(
  () => import('@/components/ChatBubbleLoader').then((m) => m.ChatBubbleLoader),
  { ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <AuthCookieSync />
        <ToastProvider>
          {children}
          <FloatingThemeToggle />
          <CommandPalette />
          <ChatBubbleLoader />
        </ToastProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
