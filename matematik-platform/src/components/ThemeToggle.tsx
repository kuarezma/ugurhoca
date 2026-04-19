'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={[
        'theme-toggle inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        compact ? 'h-11 w-11' : 'h-11 px-4',
        className,
      ].join(' ')}
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
      {!compact && <span className="text-sm font-semibold">{isDark ? 'Açık Mod' : 'Koyu Mod'}</span>}
    </button>
  );
}

export function FloatingThemeToggle() {
  return (
    <div className="fixed bottom-4 left-4 z-[90] sm:bottom-6 sm:left-6">
      <ThemeToggle className="shadow-lg backdrop-blur-lg" />
    </div>
  );
}
