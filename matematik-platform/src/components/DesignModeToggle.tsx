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
      className={`relative inline-flex items-center gap-1.5 rounded-full p-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
        isAdventure
          ? 'bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-400/40 shadow-sm shadow-amber-500/10'
          : 'bg-surface-2 border border-default hover:bg-surface-3'
      } ${className}`}
    >
      <div
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-300 ${
          isAdventure
            ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-md shadow-pink-500/25 scale-[1.02]'
            : 'text-secondary hover:text-primary'
        }`}
      >
        <Sparkles className={`h-3.5 w-3.5 ${isAdventure ? 'text-amber-200 animate-pulse' : ''}`} />
        <span>Macera</span>
      </div>

      <div
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-300 ${
          !isAdventure
            ? 'bg-surface-1 text-primary shadow-sm border border-default font-bold'
            : 'text-tertiary hover:text-secondary'
        }`}
      >
        <BookOpen className="h-3.5 w-3.5" />
        {!compact && <span>Klasik</span>}
      </div>
    </button>
  );
}

export default DesignModeToggle;
