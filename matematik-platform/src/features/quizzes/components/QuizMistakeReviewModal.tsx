'use client';

import { X, RotateCcw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import MathText from '@/components/MathText';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import type { QuizQuestion } from '@/types/quiz';

type QuizMistakeReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  answers: { [key: number]: number };
  onStartRetakeMistakes: (mistakeQuestions: QuizQuestion[]) => void;
};

export function QuizMistakeReviewModal({
  isOpen,
  onClose,
  questions,
  answers,
  onStartRetakeMistakes,
}: QuizMistakeReviewModalProps) {
  const containerRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const mistakes = questions
    .map((q, idx) => ({
      question: q,
      index: idx,
      userAnswer: answers[idx],
      isCorrect: answers[idx] === q.correct_index,
    }))
    .filter((item) => !item.isCorrect);

  const handleStartMistakesQuiz = () => {
    onStartRetakeMistakes(mistakes.map((m) => m.question));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-label="Yanlış Soru İnceleme ve Tekrar Havuzu"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Hata Defteri & Tekrar Havuzu
              </h2>
              <p className="text-xs text-slate-400">
                {mistakes.length === 0
                  ? 'Harika! Bu testte hiç yanlışın yok.'
                  : `${mistakes.length} soruyu tekrar inceleyebilir veya yeniden çözebilirsin.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mistakes.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="font-display text-lg font-bold text-white">Tebrikler!</p>
              <p className="mt-1 text-sm text-slate-300">
                Tüm soruları doğru tamamladın. Hata defterin tertemiz.
              </p>
            </div>
          ) : (
            mistakes.map(({ question, index, userAnswer }) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Soru {index + 1}</span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <XCircle className="h-3.5 w-3.5" />
                    {userAnswer === undefined ? 'Boş Bırakıldı' : 'Yanlış Cevaplandı'}
                  </span>
                </div>

                <div className="text-sm font-medium text-white">
                  <MathText>{question.question}</MathText>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                  {question.options.map((opt, optIdx) => {
                    const isUserChoice = userAnswer === optIdx;
                    const isCorrectChoice = question.correct_index === optIdx;

                    let optBg = 'bg-white/5 border-white/10 text-slate-300';
                    if (isUserChoice && !isCorrectChoice) {
                      optBg = 'bg-rose-500/20 border-rose-500/50 text-rose-200 font-semibold';
                    }
                    if (isCorrectChoice) {
                      optBg = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-semibold';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 ${optBg}`}
                      >
                        <span className="font-bold">
                          {String.fromCharCode(65 + optIdx)})
                        </span>
                        <div className="flex-1 truncate">
                          <MathText>{opt}</MathText>
                        </div>
                        {isCorrectChoice && (
                          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                            Doğru
                          </span>
                        )}
                        {isUserChoice && !isCorrectChoice && (
                          <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">
                            Seçimin
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (
                  <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/10 p-3 text-xs text-brand-primary-soft">
                    <span className="font-bold text-white block mb-1">Çözüm / İpucu:</span>
                    <MathText>{question.explanation}</MathText>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/80 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Pencereyi Kapat
          </button>

          {mistakes.length > 0 && (
            <button
              type="button"
              onClick={handleStartMistakesQuiz}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg transition hover:scale-[1.02]"
            >
              <RotateCcw className="h-4 w-4" />
              Sadece Bu {mistakes.length} Yanlışı Tekrar Çöz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
