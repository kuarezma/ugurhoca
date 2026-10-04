'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Temayı değiştir"
      title="Temayı değiştir"
      className={[
        'theme-toggle inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        compact ? 'h-11 w-11' : 'h-11 px-4',
        className,
      ].join(' ')}
    >
      <Sun className="h-5 w-5 hidden dark:block" aria-hidden="true" />
      <Moon className="h-5 w-5 block dark:hidden" aria-hidden="true" />
      {!compact && (
        <>
          <span className="text-sm font-semibold hidden dark:inline">Açık Mod</span>
          <span className="text-sm font-semibold inline dark:hidden">Koyu Mod</span>
        </>
      )}
    </button>
  );
}

export function FloatingThemeToggle() {
  return (
    <div className="hidden md:block fixed bottom-6 left-6 z-[90]">
      <ThemeToggle className="shadow-lg backdrop-blur-lg" />
    </div>
  );
}
