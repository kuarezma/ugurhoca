'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FloatingThemeToggle } from '@/components/ThemeToggle';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
        <FloatingThemeToggle />
      </ToastProvider>
    </ThemeProvider>
  );
}
