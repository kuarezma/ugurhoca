'use client';

import { ReactNode } from 'react';
import AuthCookieSync from '@/components/AuthCookieSync';
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
      </ToastProvider>
    </ThemeProvider>
  );
}
