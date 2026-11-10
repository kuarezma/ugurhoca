'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import type { GuestQuestion } from '../data/guestQuestions';
import { evaluateShortAnswer } from '@/features/quizzes/utils/answerEvaluation';

const MathText = dynamic(() => import('@/components/MathText'), {
  ssr: false,
  loading: () => <span className="inline-block animate-pulse">...</span>,
});

interface GuestQuestionCardProps {
  question: GuestQuestion;
  index: number;
}

export function GuestQuestionCard({ question, index }: GuestQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [hasEvaluatedShort, setHasEvaluatedShort] = useState(false);
  const [isShortCorrect, setIsShortCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [checkedRubric, setCheckedRubric] = useState<number[]>([]);

  const isMultiple = question.question_type === 'multiple_choice';

  const handleSelectOption = (optIndex: number) => {
    setSelectedOption(optIndex);
    setShowSolution(true);
  };

  const handleEvaluateShort = () => {
    if (!shortAnswerInput.trim()) return;
    const correct = evaluateShortAnswer(
      shortAnswerInput,
      question.expected_answer || '',
    );
    setIsShortCorrect(correct);
    setHasEvaluatedShort(true);
    setShowSolution(true);
  };

  const toggleRubric = (itemIndex: number) => {
    setCheckedRubric((prev) =>
      prev.includes(itemIndex)
        ? prev.filter((i) => i !== itemIndex)
        : [...prev, itemIndex],
    );
  };

  const isAnswered = isMultiple ? selectedOption !== null : hasEvaluatedShort;

  return (
    <article
      aria-labelledby={`guest-q-title-${question.id}`}
      className="p-5 sm:p-6 rounded-3xl bg-surface-1 border border-border-default shadow-xs transition-all space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent-bg text-accent-fg font-bold text-xs">
            {index + 1}
          </span>
          <h3
            id={`guest-q-title-${question.id}`}
            className="text-xs sm:text-sm font-semibold text-secondary"
          >
            {question.outcome}
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-2 text-tertiary">
          {isMultiple ? 'Çoktan Seçmeli' : 'MEB Ortak Yazılı / Açık Uçlu'}
        </span>
      </div>

      <div className="text-sm sm:text-base font-medium text-primary leading-relaxed">
        <MathText>{question.question}</MathText>
      </div>

      {/* Çoktan Seçmeli Şıklar */}
      {isMultiple && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {question.options.map((opt, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const isCorrectOption = optIdx === question.correct_index;

            let btnStyle =
              'bg-surface-0 border-border-default text-primary hover:bg-surface-2';
            if (selectedOption !== null) {
              if (isCorrectOption) {
                btnStyle =
                  'bg-tone-success-bg border-tone-success-border text-tone-success-fg font-bold';
              } else if (isSelected) {
                btnStyle =
                  'bg-tone-danger-bg border-tone-danger-border text-tone-danger-fg';
              } else {
                btnStyle = 'opacity-60 bg-surface-0 border-border-subtle';
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${btnStyle}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-sm font-medium">
                  <MathText>{opt}</MathText>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Kısa Cevap / MEB Açık Uçlu Girişi */}
      {!isMultiple && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={shortAnswerInput}
              onChange={(e) => setShortAnswerInput(e.target.value)}
              placeholder="Cevabınızı girin (örn. 36 veya 2/3)"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-0 border border-border-default text-primary placeholder:text-tertiary text-sm focus:outline-none focus:ring-2 focus:ring-accent-fg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEvaluateShort();
              }}
            />
            <button
              type="button"
              onClick={handleEvaluateShort}
              className="px-4 py-2.5 rounded-2xl bg-accent-bg text-accent-fg font-bold text-sm hover:opacity-90 transition shadow-xs"
            >
              Cevabı Kontrol Et
            </button>
          </div>

          {hasEvaluatedShort && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 border ${
                isShortCorrect
                  ? 'bg-tone-success-bg border-tone-success-border text-tone-success-fg font-semibold'
                  : 'bg-tone-warn-bg border-tone-warn-border text-tone-warn-fg'
              }`}
            >
              {isShortCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Tebrikler! Doğru sonuca ulaştınız.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Farklı bir sonuç bulundu. Doğru cevap:{' '}
                    <strong>{question.expected_answer?.split('|')[0]}</strong>
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sonuç & Çözüm Bölümü */}
      {isAnswered && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowSolution((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-fg hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showSolution
              ? 'Çözüm Açıklamasını Gizle'
              : 'Adım Adım Çözümü İncele'}
            {showSolution ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showSolution && (
            <div className="mt-3 p-4 rounded-2xl bg-surface-2/70 border border-border-default space-y-3 animate-fade-in text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold text-primary">
                <HelpCircle className="w-4 h-4 text-accent-fg" />
                <span>Uğur Hoca Adım Adım Çözümü:</span>
              </div>
              <div className="text-secondary leading-relaxed pl-6">
                <MathText>{question.explanation}</MathText>
              </div>

              {/* Açık Uçlu Soru Puanlama Rubriği (Öz-değerlendirme) */}
              {question.rubric && question.rubric.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border-subtle pl-6 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-primary">
                    <Award className="w-4 h-4 text-accent-fg" />
                    <span>MEB Ortak Yazılı Puanlama Anahtarı (Rubrik):</span>
                  </div>
                  <div className="space-y-1.5">
                    {question.rubric.map((item, rIdx) => {
                      const isChecked = checkedRubric.includes(rIdx);
                      return (
                        <label
                          key={rIdx}
                          className="flex items-start gap-2 cursor-pointer text-xs text-secondary hover:text-primary"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRubric(rIdx)}
                            className="mt-0.5 rounded border-border-default text-accent-fg focus:ring-accent-fg"
                          />
                          <span
                            className={
                              isChecked ? 'line-through opacity-75' : ''
                            }
                          >
                            {item}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-tertiary italic">
                    Çözümündeki her doğru adım için rubrik maddelerini
                    işaretleyip kendi puanını görebilirsin.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
