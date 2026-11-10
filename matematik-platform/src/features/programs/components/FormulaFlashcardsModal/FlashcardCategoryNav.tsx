import { Star, CheckCircle } from 'lucide-react';

export type CategoryFilterType =
  | 'all'
  | 'due'
  | 'starred'
  | 'learned'
  | 'lgs'
  | 'yks';

type FlashcardCategoryNavProps = {
  categoryFilter: CategoryFilterType;
  setCategoryFilter: (cat: CategoryFilterType) => void;
  totalCardsCount: number;
  dueCount: number;
  starredCount: number;
  learnedCount: number;
  filteredCount: number;
  currentIndex: number;
  onResetPage: () => void;
};

export function FlashcardCategoryNav({
  categoryFilter,
  setCategoryFilter,
  totalCardsCount,
  dueCount,
  starredCount,
  learnedCount,
  filteredCount,
  currentIndex,
  onResetPage,
}: FlashcardCategoryNavProps) {
  const handleSelect = (cat: CategoryFilterType) => {
    setCategoryFilter(cat);
    onResetPage();
  };

  return (
    <div className="no-print flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/40 px-4 sm:px-6 py-2 sm:py-2.5">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => handleSelect('all')}
          className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
            categoryFilter === 'all'
              ? 'bg-brand-primary text-slate-950 dark:text-slate-950'
              : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
          }`}
        >
          Tümü ({totalCardsCount})
        </button>
        <button
          type="button"
          onClick={() => handleSelect('due')}
          className={`rounded-xl px-3 py-1 text-xs font-semibold transition flex items-center gap-1 ${
            categoryFilter === 'due'
              ? 'bg-brand-primary font-bold text-slate-950 dark:text-slate-950'
              : 'bg-amber-50 dark:bg-white/5 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-white/10 border border-amber-200 dark:border-transparent'
          }`}
        >
          <span>Tekrar Vakti</span>
          <span className="rounded-full bg-amber-400/30 px-1.5 py-0.2 text-[10px] font-bold">
            {dueCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleSelect('starred')}
          className={`rounded-xl px-3 py-1 text-xs font-semibold transition flex items-center gap-1 ${
            categoryFilter === 'starred'
              ? 'bg-brand-primary font-bold text-slate-950 dark:text-slate-950'
              : 'bg-amber-50 dark:bg-white/5 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-white/10 border border-amber-200 dark:border-transparent'
          }`}
        >
          <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
          <span>Yıldızlılar</span>
          <span className="rounded-full bg-amber-400/30 px-1.5 py-0.2 text-[10px] font-bold">
            {starredCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleSelect('learned')}
          className={`rounded-xl px-3 py-1 text-xs font-semibold transition flex items-center gap-1 ${
            categoryFilter === 'learned'
              ? 'bg-brand-primary font-bold text-slate-950 dark:text-slate-950'
              : 'bg-emerald-50 dark:bg-white/5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-white/10 border border-emerald-200 dark:border-transparent'
          }`}
        >
          <CheckCircle className="h-3 w-3" />
          <span>Öğrenilenler</span>
          <span className="rounded-full bg-emerald-400/30 px-1.5 py-0.2 text-[10px] font-bold">
            {learnedCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleSelect('lgs')}
          className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
            categoryFilter === 'lgs'
              ? 'bg-brand-primary font-bold text-slate-950 dark:text-slate-950'
              : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
          }`}
        >
          LGS (8. Sınıf)
        </button>
        <button
          type="button"
          onClick={() => handleSelect('yks')}
          className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
            categoryFilter === 'yks'
              ? 'bg-brand-primary font-bold text-slate-950 dark:text-slate-950'
              : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
          }`}
        >
          YKS (TYT / AYT)
        </button>
      </div>

      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {filteredCount > 0 ? `${currentIndex + 1} / ${filteredCount}` : '0 / 0'}
      </span>
    </div>
  );
}
