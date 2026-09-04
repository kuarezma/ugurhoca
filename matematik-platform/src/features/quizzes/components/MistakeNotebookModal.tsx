'use client';

import { useState, useEffect, useId, useMemo } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import MathText from '@/components/MathText';
import type { QuizQuestion } from '@/types/quiz';
import {
  getSavedMistakes,
  markMistakeMastered,
  removeMistakeFromBank,
  clearAllMistakes,
  type SavedMistakeQuestion,
} from '@/features/quizzes/lib/mistakeStorage';

type MistakeNotebookModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartRetakeQuiz?: (questions: QuizQuestion[]) => void;
};

export function MistakeNotebookModal({
  isOpen,
  onClose,
  onStartRetakeQuiz,
}: MistakeNotebookModalProps) {
  const titleId = useId();
  const [mistakes, setMistakes] = useState<SavedMistakeQuestion[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'mastered'>('pending');

  const reloadMistakes = () => {
    setMistakes(getSavedMistakes());
  };

  useEffect(() => {
    if (isOpen) {
      reloadMistakes();
    }
  }, [isOpen]);

  const stats = useMemo(() => {
    const total = mistakes.length;
    const mastered = mistakes.filter((m) => m.mastered).length;
    const pending = total - mastered;
    return { total, mastered, pending };
  }, [mistakes]);

  const filteredList = useMemo(() => {
    if (filter === 'pending') return mistakes.filter((m) => !m.mastered);
    if (filter === 'mastered') return mistakes.filter((m) => m.mastered);
    return mistakes;
  }, [mistakes, filter]);

  if (!isOpen) return null;

  const handleToggleMastered = (questionText: string, current: boolean) => {
    markMistakeMastered(questionText, !current);
    reloadMistakes();
  };

  const handleRemove = (questionText: string) => {
    removeMistakeFromBank(questionText);
    reloadMistakes();
  };

  const handleClearAll = () => {
    if (window.confirm('Tüm hata defterini temizlemek istediğine emin misin?')) {
      clearAllMistakes();
      reloadMistakes();
    }
  };

  const handleStartPractice = () => {
    const questionsToSolve = (
      filter === 'all'
        ? mistakes
        : filter === 'pending'
        ? mistakes.filter((m) => !m.mastered)
        : mistakes.filter((m) => m.mastered)
    ).map((m) => m.question);

    if (!questionsToSolve.length) return;
    if (onStartRetakeQuiz) {
      onStartRetakeQuiz(questionsToSolve);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md sm:p-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="flex flex-col gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 id={titleId} className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Akıllı Hata Defterim 📓
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Testlerde yanlış yaptığın sorular burada birikir. Tekrar çözerek eksiklerini kalıcı kapat.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onStartRetakeQuiz && stats.pending > 0 ? (
              <button
                type="button"
                onClick={handleStartPractice}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition-transform active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Hatalarımdan Test Çöz ({stats.pending})</span>
              </button>
            ) : null}

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

        {/* Sayaç ve Filtre Şeridi */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] px-5 py-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                filter === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              Tekrar Bekleyen ({stats.pending})
            </button>
            <button
              type="button"
              onClick={() => setFilter('mastered')}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                filter === 'mastered'
                  ? 'bg-emerald-500 text-white shadow-sm'
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
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              Tümü ({stats.total})
            </button>
          </div>

          {stats.total > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-slate-400 hover:text-red-500 transition-colors font-medium text-[11px]"
            >
              Defteri Boşalt
            </button>
          )}
        </div>

        {/* Soru Listesi (Kaydırılabilir) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 [scrollbar-width:thin]">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mb-3">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-200">
                {filter === 'pending' ? 'Harika! Tekrar bekleyen hiç yanlış soru yok.' : 'Henüz bu kategoride soru bulunmuyor.'}
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Test çözerken yanlış yaptığın ya da boş bıraktığın sorular burada güvenle birikir ve dilediğin zaman pratik yapabilirsin.
              </p>
            </div>
          ) : (
            filteredList.map((item, index) => {
              const q = item.question;
              return (
                <div
                  key={item.id || index}
                  className={`rounded-2xl border p-4 transition-all ${
                    item.mastered
                      ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/15'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 dark:bg-white/10 text-xs font-bold">
                        {index + 1}
                      </span>
                      {item.quizTitle && (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {item.quizTitle}
                        </span>
                      )}
                      {item.mastered && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          Öğrenildi
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleMastered(q.question, item.mastered)}
                        title={item.mastered ? 'Bekleyene Al' : 'Öğrenildi Olarak İşaretle'}
                        className={`flex h-7 px-2.5 items-center gap-1 rounded-lg text-xs font-semibold transition-colors ${
                          item.mastered
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{item.mastered ? 'Tekrar Aç' : 'Öğrendim'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(q.question)}
                        title="Defterden Sil"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Soru Metni */}
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-100 py-1">
                    <MathText>{q.question}</MathText>
                  </div>

                  {/* Seçenekler */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correct_index;
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 rounded-xl p-2.5 border ${
                            isCorrect
                              ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold'
                              : 'border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/10'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">
                            <MathText>{opt}</MathText>
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Doğru Cevap
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Çözüm Açıklaması (varsa) */}
                  {q.explanation && (
                    <div className="mt-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-500/20 p-2.5 text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-bold">Çözüm İpucu: </span>
                      <MathText>{q.explanation}</MathText>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
