import {
  type MistakeReason,
  type SavedMistakeQuestion,
  MISTAKE_REASON_LABELS,
} from '@/features/quizzes/lib/mistakeStorage';
import type { FilterType } from './types';

type MistakeFilterTabsProps = {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  reasonFilter: MistakeReason | 'all';
  setReasonFilter: (reason: MistakeReason | 'all') => void;
  stats: {
    total: number;
    mastered: number;
    pending: number;
    due: number;
  };
  mistakes: SavedMistakeQuestion[];
  confirmingClearAll: boolean;
  setConfirmingClearAll: (confirming: boolean) => void;
  onClearAll: () => void;
};

export function MistakeFilterTabs({
  filter,
  setFilter,
  reasonFilter,
  setReasonFilter,
  stats,
  mistakes,
  confirmingClearAll,
  setConfirmingClearAll,
  onClearAll,
}: MistakeFilterTabsProps) {
  return (
    <div className="no-print flex flex-col gap-2.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] px-5 py-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('due')}
            className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
              filter === 'due'
                ? 'bg-brand-primary shadow-sm text-slate-950 dark:text-slate-950'
                : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
            }`}
          >
            🧠 Bugün Tekrar ({stats.due})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
              filter === 'pending'
                ? 'bg-brand-primary shadow-sm text-slate-950 dark:text-slate-950'
                : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
            }`}
          >
            Bekleyen ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setFilter('mastered')}
            className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
              filter === 'mastered'
                ? 'bg-brand-primary shadow-sm text-slate-950 dark:text-slate-950'
                : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
            }`}
          >
            Öğrenilenler ({stats.mastered})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
              filter === 'all'
                ? 'bg-brand-primary shadow-sm text-slate-950 dark:text-slate-950'
                : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
            }`}
          >
            Tümü ({stats.total})
          </button>
        </div>

        {stats.total > 0 &&
          (confirmingClearAll ? (
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={onClearAll}
                className="rounded-lg border border-red-500/30 bg-red-500/15 px-2.5 py-1 font-bold text-red-700 dark:text-red-300 hover:bg-red-500/25 transition-colors"
              >
                Emin misin? Evet, Temizle
              </button>
              <button
                type="button"
                onClick={() => setConfirmingClearAll(false)}
                className="rounded-lg px-2 py-1 font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              >
                Vazgeç
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingClearAll(true)}
              className="text-slate-400 hover:text-red-500 transition-colors font-medium text-[11px]"
            >
              Defteri Boşalt
            </button>
          ))}
      </div>

      {/* Hata Nedeni Filtresi */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/50 dark:border-white/5 text-[11px]">
        <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1">
          Neden Filtresi:
        </span>
        <button
          type="button"
          onClick={() => setReasonFilter('all')}
          className={`px-2 py-0.5 rounded-md font-medium transition-all ${
            reasonFilter === 'all'
              ? 'bg-slate-800 dark:bg-white/20 text-white font-bold'
              : 'text-slate-500 hover:bg-slate-200/60 dark:hover:bg-white/5'
          }`}
        >
          Tümü
        </button>
        {(['careless', 'concept', 'reading', 'time'] as MistakeReason[]).map(
          (rKey) => {
            const meta = MISTAKE_REASON_LABELS[rKey];
            const count = mistakes.filter((m) => m.reason === rKey).length;
            return (
              <button
                key={rKey}
                type="button"
                onClick={() =>
                  setReasonFilter(reasonFilter === rKey ? 'all' : rKey)
                }
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-all ${
                  reasonFilter === rKey
                    ? 'bg-brand-primary shadow-sm font-bold text-slate-950 dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>
                  {meta.shortLabel} ({count})
                </span>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}
