import type { VisualProofTab } from './types';

type ProofTabSelectorProps = {
  activeTab: VisualProofTab;
  setActiveTab: (tab: VisualProofTab) => void;
  isLight: boolean;
};

export function ProofTabSelector({
  activeTab,
  setActiveTab,
  isLight,
}: ProofTabSelectorProps) {
  return (
    <div
      className={`flex overflow-x-auto border-b px-3 sm:px-6 py-2 gap-1.5 scrollbar-none ${
        isLight
          ? 'bg-slate-100/70 border-slate-200'
          : 'bg-slate-950/40 border-white/10'
      }`}
    >
      <button
        type="button"
        onClick={() => setActiveTab('pythagoras')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
          activeTab === 'pythagoras'
            ? 'bg-brand-primary shadow text-slate-950 dark:text-slate-950'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
        }`}
      >
        📐 Pisagor Teoremi (a² + b² = c²)
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('difference_of_squares')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
          activeTab === 'difference_of_squares'
            ? 'bg-brand-primary shadow text-slate-950 dark:text-slate-950'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
        }`}
      >
        ✂️ İki Kare Farkı (a² - b²)
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('trig_identity')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
          activeTab === 'trig_identity'
            ? 'bg-brand-primary shadow text-slate-950 dark:text-slate-950'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
        }`}
      >
        ⭕ sin²θ + cos²θ = 1
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('pascal_binomial')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
          activeTab === 'pascal_binomial'
            ? 'bg-brand-primary shadow text-slate-950 dark:text-slate-950'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
        }`}
      >
        🔺 Pascal & (a + b)ⁿ
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('circle_sector')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
          activeTab === 'circle_sector'
            ? 'bg-brand-primary shadow text-slate-950 dark:text-slate-950'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
        }`}
      >
        🟡 Daire Dilimi & Yay Uzunluğu
      </button>
    </div>
  );
}
