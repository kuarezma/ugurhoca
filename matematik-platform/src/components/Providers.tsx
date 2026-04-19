'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import AuthCookieSync from '@/components/AuthCookieSync';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FloatingThemeToggle } from '@/components/ThemeToggle';

const CommandPalette = dynamic(() => import('@/components/CommandPalette'), {
  ssr: false,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthCookieSync />
      <ToastProvider>
        {children}
        <FloatingThemeToggle />
        <CommandPalette />
      </ToastProvider>
    </ThemeProvider>
  );
}
