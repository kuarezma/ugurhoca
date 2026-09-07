'use client';

import { Check, Bookmark, Sparkles } from 'lucide-react';

type QuizQuestionPaletteProps = {
  totalQuestions: number;
  currentIndex: number;
  answers: { [key: number]: number };
  flaggedQuestions: Set<number>;
  onSelectQuestion: (index: number) => void;
  onToggleFlag: (index: number) => void;
};

export function QuizQuestionPalette({
  totalQuestions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectQuestion,
  onToggleFlag,
}: QuizQuestionPaletteProps) {
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.size;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-primary dark:text-brand-primary-soft" />
          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Soru Haritası
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            {answeredCount}/{totalQuestions} Çözüldü
          </span>
          {flaggedCount > 0 && (
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
              <Bookmark className="h-3 w-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
              {flaggedCount} Şüpheli
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = answers[index] !== undefined;
          const isFlagged = flaggedQuestions.has(index);

          let buttonStyle = 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/10';
          if (isAnswered) {
            buttonStyle = 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40 hover:bg-emerald-100 dark:hover:bg-emerald-500/30';
          }
          if (isCurrent) {
            buttonStyle = 'bg-brand-primary text-white border-brand-primary ring-2 ring-brand-primary/50 shadow-md font-bold';
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectQuestion(index)}
              className={`relative flex h-10 w-full items-center justify-center rounded-xl border text-sm font-medium transition-all ${buttonStyle}`}
              aria-label={`Soru ${index + 1}${isAnswered ? ', cevaplandı' : ''}${isFlagged ? ', şüpheli olarak işaretlendi' : ''}`}
            >
              <span>{index + 1}</span>

              {isAnswered && !isCurrent && (
                <Check className="absolute bottom-1 right-1 h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              )}

              {isFlagged && (
                <span
                  className="pointer-events-none absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-slate-950 font-black shadow"
                  aria-hidden="true"
                >
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-2 text-xs">
        <button
          type="button"
          onClick={() => onToggleFlag(currentIndex)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
        >
          <Bookmark
            className={`h-3.5 w-3.5 ${
              flaggedQuestions.has(currentIndex)
                ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          {flaggedQuestions.has(currentIndex)
            ? 'Şüpheli işaretini kaldır'
            : 'Bu soruyu şüpheli işaretle'}
        </button>
        <span className="text-slate-500 dark:text-slate-400">Tek tıkla soruya atla</span>
      </div>
    </div>
  );
}
