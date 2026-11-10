import { X, Shuffle, Sparkles, Printer, Zap } from 'lucide-react';

type FlashcardHeaderProps = {
  onOpenSpeedDrill: () => void;
  onShuffle: () => void;
  onClose: () => void;
};

export function FlashcardHeader({
  onOpenSpeedDrill,
  onShuffle,
  onClose,
}: FlashcardHeaderProps) {
  return (
    <div className="no-print flex items-center justify-between gap-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/80 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl shadow-md bg-brand-secondary text-slate-950 dark:text-slate-950">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            Formül & Bilgi Kartları
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            Leitner aralıklı tekrar sistemiyle kalıcı matematik hafızası
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenSpeedDrill}
          title="60 Saniye Hızlı Formül Eşleştirme Antrenmanı"
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
        >
          <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          <span className="hidden sm:inline">60s Hız Antrenmanı</span>
        </button>
        <button
          type="button"
          onClick={() => typeof window !== 'undefined' && window.print()}
          aria-label="A4 Formül Kitapçığı Yazdır"
          title="Tüm formülleri A4 formatında yazdır veya PDF al"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Printer className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">A4 Yazdır</span>
        </button>
        <button
          type="button"
          onClick={onShuffle}
          aria-label="Kartları karıştır"
          title="Rastgele kart seç"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
        >
          <Shuffle className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
