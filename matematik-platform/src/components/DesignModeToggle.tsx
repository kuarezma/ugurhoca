'use client';

import { Sparkles, BookOpen } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface DesignModeToggleProps {
  compact?: boolean;
  className?: string;
}

export function DesignModeToggle({ compact = false, className = '' }: DesignModeToggleProps) {
  const { designMode, toggleDesignMode } = useTheme();
  const isAdventure = designMode === 'adventure';

  return (
    <button
      type="button"
      onClick={toggleDesignMode}
      aria-label={`Tasarım modunu değiştir: Şu an ${isAdventure ? 'Macera Patikası' : 'Klasik Liste'}`}
      title={isAdventure ? 'Klasik platform görünümüne geç' : 'Oyunlaştırılmış macera moduna geç'}
      className={`relative inline-flex items-center gap-1 rounded-full p-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer bg-surface-2 border border-default ${className}`}
    >
      <div
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-300 ${
          isAdventure
            ? 'bg-brand-accent text-slate-950 dark:text-slate-950 shadow-md shadow-brand-accent/30'
            : 'text-secondary hover:text-primary'
        }`}
      >
        <Sparkles className={`h-3.5 w-3.5 ${isAdventure ? 'animate-pulse' : ''}`} />
        <span>Macera</span>
      </div>

      <div
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-300 ${
          !isAdventure
            ? 'bg-brand-secondary text-slate-950 dark:text-slate-950 shadow-md shadow-brand-secondary/30'
            : 'text-secondary hover:text-primary'
        }`}
      >
        <BookOpen className="h-3.5 w-3.5" />
        {!compact && <span>Klasik</span>}
      </div>
    </button>
  );
}

export default DesignModeToggle;
