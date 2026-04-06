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
  const label = isDark ? 'Aydinlik moda gec' : 'Karanlik moda gec';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={[
        'theme-toggle inline-flex items-center justify-center gap-2 rounded-xl border transition-colors',
        compact ? 'h-10 w-10' : 'px-4 py-2.5',
        className,
      ].join(' ')}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      {!compact && <span className="text-sm font-semibold">{isDark ? 'Acik Mod' : 'Koyu Mod'}</span>}
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
