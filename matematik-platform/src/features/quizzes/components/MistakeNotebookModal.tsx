'use client';

import { useState, useEffect, useId, useMemo } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  Trash2,
  Play,
  Printer,
} from 'lucide-react';
import MathText from '@/components/MathText';
import type { QuizQuestion } from '@/types/quiz';
import {
  getSavedMistakes,
  markMistakeMastered,
  removeMistakeFromBank,
  clearAllMistakes,
  updateMistakeReason,
  type SavedMistakeQuestion,
  type MistakeReason,
  MISTAKE_REASON_LABELS,
} from '@/features/quizzes/lib/mistakeStorage';
import { PrintableWorksheetModal } from './PrintableWorksheetModal';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

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
  const [reasonFilter, setReasonFilter] = useState<MistakeReason | 'all'>('all');
  const [isWorksheetOpen, setIsWorksheetOpen] = useState(false);
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

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
    return mistakes.filter((m) => {
      if (filter === 'pending' && m.mastered) return false;
      if (filter === 'mastered' && !m.mastered) return false;
      if (reasonFilter !== 'all' && m.reason !== reasonFilter) return false;
      return true;
    });
  }, [mistakes, filter, reasonFilter]);

  const printableQuestions = useMemo<QuizQuestion[]>(() => {
    return filteredList.map((m) => m.question);
  }, [filteredList]);

  if (!isOpen) return null;

  const handleSetReason = (questionText: string, reason?: MistakeReason) => {
    updateMistakeReason(questionText, reason);
    reloadMistakes();
  };

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

  const handleStartPractice = (count?: number) => {
    let pool = filter === 'all'
      ? mistakes
      : filter === 'pending'
      ? mistakes.filter((m) => !m.mastered)
      : mistakes.filter((m) => m.mastered);

    // Önceliklendirme: Kazanım açığı (concept) ve dikkat hataları (attention) en başa
    pool = [...pool].sort((a, b) => {
      if (a.reason === 'concept' && b.reason !== 'concept') return -1;
      if (b.reason === 'concept' && a.reason !== 'concept') return 1;
      return 0;
    });

    const questionsToSolve = (count ? pool.slice(0, count) : pool).map((m) => m.question);

    if (!questionsToSolve.length) return;
    if (onStartRetakeQuiz) {
      onStartRetakeQuiz(questionsToSolve);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        className="fixed inset-0 -z-10 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl transition-all"
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
                Yanlış yaptığın sorular burada toplanır. Nedenini belirle, tekrar çöz ve pekiştir.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stats.pending > 0 ? (
              <>
                {stats.pending > 5 && (
                  <button
                    type="button"
                    onClick={() => handleStartPractice(5)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 shadow-sm transition hover:bg-amber-500/20 active:scale-[0.98]"
                  >
                    <Play className="h-3 w-3 fill-amber-300" />
                    <span>5 Soruluk Hızlı Telafi</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleStartPractice()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Hatalarımdan Test Çöz ({stats.pending})</span>
                </button>
              </>
            ) : null}

            {filteredList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsWorksheetOpen(true)}
                title="Hatalarından A4 Yaprak Test Oluştur & Yazdır"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-[0.98]"
              >
                <Printer className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                <span className="hidden sm:inline">A4 Yaprak Test / PDF</span>
                <span className="sm:hidden">Yazdır / PDF</span>
              </button>
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

        {/* Sayaç ve Filtre Şeridi */}
        <div className="flex flex-col gap-2.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] px-5 py-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
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

          {/* Hata Nedeni Filtresi */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/50 dark:border-white/5 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1">Neden Filtresi:</span>
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
            {(['careless', 'concept', 'reading', 'time'] as MistakeReason[]).map((rKey) => {
              const meta = MISTAKE_REASON_LABELS[rKey];
              const count = mistakes.filter((m) => m.reason === rKey).length;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => setReasonFilter(reasonFilter === rKey ? 'all' : rKey)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-all ${
                    reasonFilter === rKey
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>{meta.shortLabel} ({count})</span>
                </button>
              );
            })}
          </div>
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

                  {/* Hata Nedeni Etiketleme */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                      Hata Nedeni:
                    </span>
                    {(['careless', 'concept', 'reading', 'time'] as MistakeReason[]).map((rKey) => {
                      const isSelected = item.reason === rKey;
                      const meta = MISTAKE_REASON_LABELS[rKey];
                      return (
                        <button
                          key={rKey}
                          type="button"
                          onClick={() => handleSetReason(q.question, isSelected ? undefined : rKey)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm font-bold scale-[1.02]'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                          }`}
                        >
                          <span>{meta.emoji}</span>
                          <span>{meta.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isWorksheetOpen && (
        <PrintableWorksheetModal
          isOpen={isWorksheetOpen}
          onClose={() => setIsWorksheetOpen(false)}
          quiz={{
            id: 'hata-defteri-ozel-test',
            title: 'Hata Defteri Özel Çalışma Testi',
            grade: 8,
            time_limit: Math.max(10, printableQuestions.length * 3),
            difficulty: 'Orta',
            description: 'Akıllı hata defterindeki sorulardan derlenmiş özel yaprak test.',
            is_active: true,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          }}
          questions={printableQuestions}
        />
      )}
    </div>
  );
}
