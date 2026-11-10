import { Triangle, CircleDot, TrendingUp, Sliders } from 'lucide-react';
import type { LabTab } from './types';

type LabTabSelectorProps = {
  activeTab: LabTab;
  setActiveTab: (tab: LabTab) => void;
  isLight: boolean;
};

export function LabTabSelector({
  activeTab,
  setActiveTab,
  isLight,
}: LabTabSelectorProps) {
  return (
    <div className="flex overflow-x-auto border-b border-default dark:border-white/10 px-4 py-2 gap-1.5 scrollbar-none">
      <button
        type="button"
        onClick={() => setActiveTab('pythagoras')}
        className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
          activeTab === 'pythagoras'
            ? 'bg-brand-primary shadow-md text-slate-950 dark:text-slate-950'
            : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <Triangle className="h-3.5 w-3.5" />
        Pisagor & Üçgen Bağıntısı
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('circle')}
        className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
          activeTab === 'circle'
            ? 'bg-brand-primary shadow-md text-slate-950 dark:text-slate-950'
            : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <CircleDot className="h-3.5 w-3.5" />
        Birim Çember & Açı
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('parabola')}
        className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
          activeTab === 'parabola'
            ? 'bg-brand-primary shadow-md text-slate-950 dark:text-slate-950'
            : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <TrendingUp className="h-3.5 w-3.5" />
        Parabol & Tepe Noktası
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('slope')}
        className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
          activeTab === 'slope'
            ? 'bg-brand-primary shadow-md text-slate-950 dark:text-slate-950'
            : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <Sliders className="h-3.5 w-3.5" />
        Eğim & Doğru Denklemi
      </button>
    </div>
  );
}
