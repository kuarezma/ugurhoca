'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import MathText from '@/components/MathText';
import type { ScratchpadQuestionContext } from './types';

type ScratchpadQuestionPanelProps = {
  questionContext: ScratchpadQuestionContext;
  showQuestionPanel: boolean;
  isLight: boolean;
  eliminatedOptions: Set<number>;
  onToggleEliminateOption: (idx: number) => void;
};

export function ScratchpadQuestionPanel({
  questionContext,
  showQuestionPanel,
  isLight,
  eliminatedOptions,
  onToggleEliminateOption,
}: ScratchpadQuestionPanelProps) {
  if (!showQuestionPanel) return null;

  return (
    <div
      className={`w-full md:w-80 lg:w-96 shrink-0 border-r p-4 overflow-y-auto hidden md:flex flex-col gap-4 ${
        isLight
          ? 'border-slate-200 bg-slate-50 text-slate-800'
          : 'border-white/10 bg-slate-950/70 text-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
          Aktif Soru Metni
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Şıklara tıklayarak eleyebilirsin
        </span>
      </div>

      <div
        className={`rounded-2xl border p-4 text-sm font-medium leading-relaxed ${
          isLight
            ? 'border-slate-200 bg-white text-slate-900 shadow-sm'
            : 'border-white/10 bg-slate-900/80 text-white'
        }`}
      >
        <MathText>{questionContext.questionText}</MathText>
      </div>

      {questionContext.imageUrl && (
        <div
          className={`relative h-36 w-full overflow-hidden rounded-xl border ${
            isLight
              ? 'border-slate-200 bg-white'
              : 'border-white/10 bg-slate-900'
          }`}
        >
          <Image
            src={questionContext.imageUrl}
            alt="Soru Görseli"
            fill
            sizes="20rem"
            className="object-contain p-2"
          />
        </div>
      )}

      {/* Şıklar ve Eleme */}
      {questionContext.options && questionContext.options.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Şıklar & Eleme:
          </span>
          <div className="space-y-1.5">
            {questionContext.options.map((opt, idx) => {
              const optLabel = String.fromCharCode(65 + idx);
              const isEliminated = eliminatedOptions.has(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onToggleEliminateOption(idx)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition border ${
                    isEliminated
                      ? 'bg-rose-50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-300/60 line-through'
                      : isLight
                        ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                      isEliminated
                        ? 'bg-rose-500/20 text-rose-500'
                        : isLight
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {optLabel}
                  </span>
                  <span className="min-w-0 flex-1 overflow-x-auto break-words">
                    <MathText>{opt}</MathText>
                  </span>
                  {isEliminated && (
                    <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
