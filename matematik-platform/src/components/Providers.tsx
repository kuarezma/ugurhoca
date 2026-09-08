'use client';

import { ReactNode } from 'react';
import AuthCookieSync from '@/components/AuthCookieSync';
import { ChatBubbleLoader } from '@/components/ChatBubbleLoader';
import { CommandPaletteLoader } from '@/components/CommandPaletteLoader';
import CookieBanner from '@/components/CookieBanner';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FloatingThemeToggle } from '@/components/ThemeToggle';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthCookieSync />
      <ToastProvider>
        {children}
        <FloatingThemeToggle />
        <CommandPaletteLoader />
        <ChatBubbleLoader />
        <CookieBanner />
      </ToastProvider>
    </ThemeProvider>
  );
}
