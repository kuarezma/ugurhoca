'use client';

import { useState, useEffect, useId, useMemo, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toLocalDateKey } from '@/lib/localDate';
import type { QuizQuestion } from '@/types/quiz';
import {
  getSavedMistakes,
  markMistakeMastered,
  removeMistakeFromBank,
  clearAllMistakes,
  updateMistakeReason,
  advanceMistakeReview,
  getSpacedReviewStats,
  type SavedMistakeQuestion,
  type MistakeReason,
} from '@/features/quizzes/lib/mistakeStorage';
import { syncMistakesWithCloud } from '@/features/quizzes/lib/mistakeSync';
import { PrintableWorksheetModal } from './PrintableWorksheetModal';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import type {
  MistakeNotebookModalProps,
  FilterType,
  ReasonBreakdown,
} from './MistakeNotebookModal/types';
import { MistakePrintSection } from './MistakeNotebookModal/MistakePrintSection';
import { MistakeNotebookHeader } from './MistakeNotebookModal/MistakeNotebookHeader';
import { MistakeFilterTabs } from './MistakeNotebookModal/MistakeFilterTabs';
import { MistakeRootCauseAnalysis } from './MistakeNotebookModal/MistakeRootCauseAnalysis';
import { LeitnerStatsBar } from './MistakeNotebookModal/LeitnerStatsBar';
import { MistakeCard } from './MistakeNotebookModal/MistakeCard';

export function MistakeNotebookModal({
  isOpen,
  onClose,
  onStartRetakeQuiz,
}: MistakeNotebookModalProps) {
  const titleId = useId();
  const [mistakes, setMistakes] = useState<SavedMistakeQuestion[]>([]);
  const [filter, setFilter] = useState<FilterType>('due');
  const [reasonFilter, setReasonFilter] = useState<MistakeReason | 'all'>(
    'all',
  );
  const [isWorksheetOpen, setIsWorksheetOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmingClearAll, setConfirmingClearAll] = useState(false);
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  const reloadMistakes = useCallback(() => {
    const list = getSavedMistakes();
    setMistakes(list);
    const today = toLocalDateKey();
    const dueCount = list.filter(
      (m) => !m.mastered && (!m.nextReviewDate || m.nextReviewDate <= today),
    ).length;
    if (dueCount === 0 && filter === 'due') {
      setFilter('pending');
    }
  }, [filter]);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    reloadMistakes();
    setIsSyncing(true);
    void syncMistakesWithCloud()
      .then((res) => {
        if (active && res.success && res.mistakes) {
          setMistakes(res.mistakes);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsSyncing(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, reloadMistakes]);

  const stats = useMemo(() => {
    const today = toLocalDateKey();
    const total = mistakes.length;
    const mastered = mistakes.filter((m) => m.mastered).length;
    const pending = total - mastered;
    const due = mistakes.filter(
      (m) => !m.mastered && (!m.nextReviewDate || m.nextReviewDate <= today),
    ).length;
    return { total, mastered, pending, due };
  }, [mistakes]);

  const spacedStats = useMemo(() => getSpacedReviewStats(mistakes), [mistakes]);

  const reasonBreakdown = useMemo<ReasonBreakdown | null>(() => {
    const total = mistakes.length;
    if (total === 0) return null;
    const careless = mistakes.filter((m) => m.reason === 'careless').length;
    const concept = mistakes.filter((m) => m.reason === 'concept').length;
    const reading = mistakes.filter((m) => m.reason === 'reading').length;
    const time = mistakes.filter((m) => m.reason === 'time').length;
    const untagged = total - (careless + concept + reading + time);

    const carelessPct = Math.round((careless / total) * 100);
    const conceptPct = Math.round((concept / total) * 100);
    const readingPct = Math.round((reading / total) * 100);
    const timePct = Math.round((time / total) * 100);
    const untaggedPct = Math.max(
      0,
      100 - (carelessPct + conceptPct + readingPct + timePct),
    );

    const tagged = [
      {
        key: 'careless' as const,
        count: careless,
        pct: carelessPct,
        label: 'İşlem Hatası',
      },
      {
        key: 'concept' as const,
        count: concept,
        pct: conceptPct,
        label: 'Kural / Konu Eksikliği',
      },
      {
        key: 'reading' as const,
        count: reading,
        pct: readingPct,
        label: 'Soru Kökünü Yanlış Okuma',
      },
      {
        key: 'time' as const,
        count: time,
        pct: timePct,
        label: 'Süre Baskısı',
      },
    ].sort((a, b) => b.count - a.count);

    const dominant = tagged[0].count > 0 ? tagged[0] : null;

    let advice: { title: string; desc: string; icon: string } | null = null;
    if (!dominant || dominant.count === 0) {
      advice = {
        title: 'Kişisel Teşhis İçin Hatalarını Etiketle',
        desc: 'Soruların altındaki butonlarla hatanın nedenini (işlem, kural, okuma, süre) belirle; platform sana özel çalışma reçetesi çıkarsın.',
        icon: '🎯',
      };
    } else if (dominant.key === 'concept') {
      advice = {
        title: 'Öncelik: Konu Kavrama & Formül Pekiştirme',
        desc: 'Hatalarının önemli bölümü kural ve konu eksiğinden kaynaklanıyor. Yeni nesil zor sorulara geçmeden önce formül özet kartlarını tekrar et ve temel kavrama testleri çöz.',
        icon: '📚',
      };
    } else if (dominant.key === 'careless') {
      advice = {
        title: 'Öncelik: İşlem Disiplini & Adım Adım Yazım',
        desc: 'Bilgi eksiğin yok ancak zihinden yapılan işlemlerde hata payı artıyor. Karalama alanını aktif kullan, her işlemi alt alta yaz ve son satırdaki işaret değişimlerini gözden geçir.',
        icon: '✏️',
      };
    } else if (dominant.key === 'reading') {
      advice = {
        title: 'Öncelik: Soru Kökü Odaklanması',
        desc: 'Soruların mantığını anlıyorsun ancak "hangisi olamaz", "kesinlikle", "en az" gibi kritik yönergeler kaçabiliyor. Soru kökünün altını çiz ve ne istendiğini kendi cümlenle özetle.',
        icon: '🔍',
      };
    } else if (dominant.key === 'time') {
      advice = {
        title: 'Öncelik: Turlama Tekniği & Zaman Yönetimi',
        desc: 'Süre baskısı hata yapmana yol açıyor. Takıldığın soruda 2 dakikayı geçme; işaret koyup geçerek önce rahat yapabildiğin soruları cebe at, zor sorulara ikinci turda dön.',
        icon: '⏱️',
      };
    }

    return {
      total,
      careless,
      concept,
      reading,
      time,
      untagged,
      carelessPct,
      conceptPct,
      readingPct,
      timePct,
      untaggedPct,
      dominant,
      advice,
    };
  }, [mistakes]);

  const filteredList = useMemo(() => {
    const today = toLocalDateKey();
    return mistakes.filter((m) => {
      if (filter === 'due') {
        if (m.mastered) return false;
        if (m.nextReviewDate && m.nextReviewDate > today) return false;
      }
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
    clearAllMistakes();
    setConfirmingClearAll(false);
    reloadMistakes();
  };

  const handleAdvanceReview = (questionText: string, correct: boolean) => {
    advanceMistakeReview(questionText, correct);
    reloadMistakes();
  };

  const handleStartPractice = (count?: number, dueOnly = false) => {
    const today = toLocalDateKey();
    let pool = dueOnly
      ? mistakes.filter(
          (m) =>
            !m.mastered && (!m.nextReviewDate || m.nextReviewDate <= today),
        )
      : filter === 'due'
        ? mistakes.filter(
            (m) =>
              !m.mastered && (!m.nextReviewDate || m.nextReviewDate <= today),
          )
        : filter === 'all'
          ? mistakes
          : filter === 'pending'
            ? mistakes.filter((m) => !m.mastered)
            : mistakes.filter((m) => m.mastered);

    pool = [...pool].sort((a, b) => {
      if (a.reason === 'concept' && b.reason !== 'concept') return -1;
      if (b.reason === 'concept' && a.reason !== 'concept') return 1;
      return 0;
    });

    const questionsToSolve = (count ? pool.slice(0, count) : pool).map(
      (m) => m.question,
    );

    if (!questionsToSolve.length) return;
    if (onStartRetakeQuiz) {
      onStartRetakeQuiz(questionsToSolve);
      onClose();
    }
  };

  const handleAskTeacher = (
    index: number,
    questionText: string,
    quizTitle?: string,
  ) => {
    onClose();
    window.dispatchEvent(
      new CustomEvent('open-teacher-chat-with-question', {
        detail: {
          questionIndex: index,
          questionText,
          quizTitle: quizTitle || 'Yanlış Defteri',
        },
      }),
    );
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-mistake-analysis-area, .print-mistake-analysis-area * { visibility: visible !important; }
          .print-mistake-analysis-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 8mm !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>
      <button
        type="button"
        aria-label="Pencereyi kapat"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md no-print"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="print-mistake-analysis-area relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl transition-all"
      >
        <MistakePrintSection
          filteredList={filteredList}
          reasonBreakdown={reasonBreakdown}
        />

        <MistakeNotebookHeader
          titleId={titleId}
          isSyncing={isSyncing}
          stats={stats}
          hasFilteredItems={filteredList.length > 0}
          onStartPractice={handleStartPractice}
          onOpenWorksheet={() => setIsWorksheetOpen(true)}
          onClose={onClose}
        />

        <MistakeFilterTabs
          filter={filter}
          setFilter={setFilter}
          reasonFilter={reasonFilter}
          setReasonFilter={setReasonFilter}
          stats={stats}
          mistakes={mistakes}
          confirmingClearAll={confirmingClearAll}
          setConfirmingClearAll={setConfirmingClearAll}
          onClearAll={handleClearAll}
        />

        {mistakes.length > 0 && reasonBreakdown && (
          <MistakeRootCauseAnalysis reasonBreakdown={reasonBreakdown} />
        )}

        {mistakes.length > 0 && <LeitnerStatsBar spacedStats={spacedStats} />}

        <div className="no-print flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 [scrollbar-width:thin]">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 text-accent-success-ink mb-3">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-200">
                {filter === 'pending'
                  ? 'Harika! Tekrar bekleyen hiç yanlış soru yok.'
                  : 'Henüz bu kategoride soru bulunmuyor.'}
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Test çözerken yanlış yaptığın ya da boş bıraktığın sorular
                burada güvenle birikir ve dilediğin zaman pratik yapabilirsin.
              </p>
            </div>
          ) : (
            filteredList.map((item, index) => (
              <MistakeCard
                key={item.id || index}
                item={item}
                index={index}
                onAdvanceReview={handleAdvanceReview}
                onToggleMastered={handleToggleMastered}
                onRemove={handleRemove}
                onSetReason={handleSetReason}
                onAskTeacher={handleAskTeacher}
              />
            ))
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
            description:
              'Akıllı hata defterindeki sorulardan derlenmiş özel yaprak test.',
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
