'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle2, Bookmark, Trash2, ArrowRight } from 'lucide-react';

interface QuizOpticalSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, number>;
  flaggedQuestions: Set<number>;
  onSelectQuestion: (index: number) => void;
  onSelectAnswer: (questionIndex: number, optionIndex: number) => void;
  onClearAnswer: (questionIndex: number) => void;
  quizTitle?: string;
  studentName?: string;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuizOpticalSheetModal: React.FC<QuizOpticalSheetModalProps> = ({
  isOpen,
  onClose,
  totalQuestions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectQuestion,
  onSelectAnswer,
  onClearAnswer,
  quizTitle = 'LGS Deneme Sınavı',
  studentName = 'Öğrenci',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Optical Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="optical-sheet-title"
        className="relative z-10 w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border border-amber-500/30 bg-amber-50/95 dark:bg-slate-900/95 text-slate-900 dark:text-white shadow-2xl shadow-amber-950/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header - Styled like standard official exam sheet header */}
        <div className="border-b border-amber-200 dark:border-slate-800 bg-amber-100/70 dark:bg-slate-950/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white dark:bg-amber-600">
                  OPTİK FORM
                </span>
                <h2 id="optical-sheet-title" className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Cevap Kağıdı Simülasyonu
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate max-w-sm">
                {quizTitle} · {studentName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Exam Info & Counter Pills */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Kitapçık: <strong>A</strong>
              </span>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-400">
                Ders: <strong>Matematik</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {answeredCount}/{totalQuestions} İşaretlendi
              </span>
            </div>
          </div>
        </div>

        {/* Optical Sheet Body - Grid of question bubble rows */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-amber-50/40 dark:bg-slate-900/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: totalQuestions }).map((_, qIdx) => {
              const selectedChoice = answers[qIdx];
              const isCurrent = qIdx === currentIndex;
              const isFlagged = flaggedQuestions.has(qIdx);

              return (
                <div
                  key={qIdx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 ring-1 ring-indigo-500/50'
                      : selectedChoice !== undefined
                        ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/10'
                        : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/50'
                  }`}
                >
                  {/* Question Number & Jump Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectQuestion(qIdx);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group mr-2"
                    title="Bu soruya git"
                  >
                    <span className="w-6 text-right">{qIdx + 1}.</span>
                    {isFlagged && (
                      <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500" />
                    )}
                  </button>

                  {/* Bubble Options (A, B, C, D) */}
                  <div className="flex items-center gap-2">
                    {OPTION_LETTERS.map((letter, optIdx) => {
                      const isBubbled = selectedChoice === optIdx;

                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => onSelectAnswer(qIdx, optIdx)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isBubbled
                              ? 'bg-slate-900 text-white dark:bg-emerald-400 dark:text-slate-950 ring-2 ring-slate-900 dark:ring-emerald-400 scale-105 shadow-sm'
                              : 'border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-500 dark:hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                          title={`${qIdx + 1}. Soru için ${letter} şıkkını işaretle`}
                        >
                          {letter}
                        </button>
                      );
                    })}

                    {/* Clear Button */}
                    {selectedChoice !== undefined && (
                      <button
                        type="button"
                        onClick={() => onClearAnswer(qIdx)}
                        aria-label={`${qIdx + 1}. Sorunun işaretini temizle`}
                        className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors ml-1"
                        title="İşareti sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-amber-200 dark:border-slate-800 bg-amber-100/50 dark:bg-slate-950/80 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            İşaretlenen şıklar anında teste kaydedilir.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-lg shadow-indigo-600/20"
          >
            <span>Teste Devam Et</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
