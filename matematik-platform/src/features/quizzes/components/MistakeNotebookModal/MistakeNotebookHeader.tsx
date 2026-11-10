import { X, BookOpen, Play, Printer, Sparkles } from 'lucide-react';

type MistakeNotebookHeaderProps = {
  titleId: string;
  isSyncing: boolean;
  stats: {
    total: number;
    mastered: number;
    pending: number;
    due: number;
  };
  hasFilteredItems: boolean;
  onStartPractice: (count?: number, dueOnly?: boolean) => void;
  onOpenWorksheet: () => void;
  onClose: () => void;
};

export function MistakeNotebookHeader({
  titleId,
  isSyncing,
  stats,
  hasFilteredItems,
  onStartPractice,
  onOpenWorksheet,
  onClose,
}: MistakeNotebookHeaderProps) {
  return (
    <div className="no-print flex flex-col gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white dark:text-white shadow-md">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2
              id={titleId}
              className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white"
            >
              Akıllı Hata Defterim 📓
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-accent-success-ink dark:text-emerald-400">
              {isSyncing ? 'Bulut Eşitleniyor...' : 'Bulut Senkronize ✓'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aralıklı tekrar algoritmasıyla (1-3-7 gün) yanlış yaptığın soruları
            kalıcı öğrenmeye dönüştür.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {stats.due > 0 && (
          <button
            type="button"
            onClick={() => onStartPractice(undefined, true)}
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5 fill-white" />
            <span>Bugünkü Tekrarları Çöz ({stats.due})</span>
          </button>
        )}

        {stats.pending > 0 ? (
          <>
            {stats.pending > 5 && (
              <button
                type="button"
                onClick={() => onStartPractice(5)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-sm transition hover:bg-amber-100 dark:hover:bg-amber-500/20 active:scale-[0.98]"
              >
                <Play className="h-3 w-3 fill-amber-700 dark:fill-amber-300 text-amber-700 dark:text-amber-300" />
                <span>5 Soruluk Telafi</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onStartPractice()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white/10 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 dark:hover:bg-white/20 active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Hatalarımdan Test Çöz ({stats.pending})</span>
            </button>
          </>
        ) : null}

        {hasFilteredItems && (
          <>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              title="Hatalı Sorularını Çözüm ve Kök Neden Alanlarıyla A4 Analiz Föyü Olarak Yazdır"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-sm transition hover:bg-amber-100 dark:hover:bg-amber-500/20 active:scale-[0.98]"
            >
              <Printer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">A4 Hata Analiz Föyü</span>
              <span className="sm:hidden">Analiz Föyü</span>
            </button>

            <button
              type="button"
              onClick={onOpenWorksheet}
              title="Hatalarından A4 Yaprak Test Oluştur & Yazdır"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-[0.98]"
            >
              <Printer className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="hidden sm:inline">A4 Yaprak Test / PDF</span>
              <span className="sm:hidden">Yazdır / PDF</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
