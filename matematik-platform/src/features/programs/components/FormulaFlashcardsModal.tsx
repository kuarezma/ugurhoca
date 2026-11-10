'use client';

import { useState, useEffect } from 'react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import FormulaSpeedDrillModal from './FormulaSpeedDrillModal';
import { useFormulaSpeech } from '../utils/mathSpeechSynthesizer';
import type {
  Flashcard,
  LeitnerBoxLevel,
  CardLeitnerState,
  FormulaFlashcardsModalProps,
} from './FormulaFlashcardsModal/types';
import {
  LEITNER_INTERVALS,
  LEITNER_STORAGE_KEY,
  STARRED_FORMULAS_KEY,
  LEARNED_FORMULAS_KEY,
  getStarredFormulaIds,
  getLearnedFormulaIds,
  getLeitnerStates,
  saveCardLeitnerState,
} from './FormulaFlashcardsModal/flashcardStorage';
import { FLASHCARDS_DATA } from './FormulaFlashcardsModal/flashcardData';
import { FlashcardPrintSection } from './FormulaFlashcardsModal/FlashcardPrintSection';
import { FlashcardHeader } from './FormulaFlashcardsModal/FlashcardHeader';
import {
  FlashcardCategoryNav,
  type CategoryFilterType,
} from './FormulaFlashcardsModal/FlashcardCategoryNav';
import { FlashcardViewer } from './FormulaFlashcardsModal/FlashcardViewer';

export type { Flashcard, LeitnerBoxLevel, CardLeitnerState };
export {
  LEITNER_INTERVALS,
  LEITNER_STORAGE_KEY,
  STARRED_FORMULAS_KEY,
  LEARNED_FORMULAS_KEY,
  getStarredFormulaIds,
  getLearnedFormulaIds,
  getLeitnerStates,
  saveCardLeitnerState,
  FLASHCARDS_DATA,
};

export function FormulaFlashcardsModal({
  initialSubject,
  isOpen,
  onClose,
}: FormulaFlashcardsModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilterType>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeedDrillOpen, setIsSpeedDrillOpen] = useState(false);
  const [starredCards, setStarredCards] = useState<Set<string>>(new Set());
  const [learnedCards, setLearnedCards] = useState<Set<string>>(new Set());
  const [leitnerStates, setLeitnerStates] = useState<
    Record<string, CardLeitnerState>
  >({});

  const {
    isSpeaking,
    isSupported: isSpeechSupported,
    toggle: toggleSpeech,
    stop: stopSpeech,
  } = useFormulaSpeech();

  useEffect(() => {
    if (isOpen) {
      setStarredCards(new Set(getStarredFormulaIds()));
      setLearnedCards(new Set(getLearnedFormulaIds()));
      setLeitnerStates(getLeitnerStates());
    } else {
      stopSpeech();
    }
  }, [isOpen, stopSpeech]);

  const toggleStarred = (id: string) => {
    setStarredCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(
          STARRED_FORMULAS_KEY,
          JSON.stringify(Array.from(next)),
        );
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleLearned = (id: string) => {
    setLearnedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(
          LEARNED_FORMULAS_KEY,
          JSON.stringify(Array.from(next)),
        );
      } catch {
        // ignore
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const now = new Date();

  const isDueCard = (card: Flashcard) => {
    const st = leitnerStates[card.id];
    if (!st) return true;
    return new Date(st.nextReviewAt) <= now;
  };

  const dueCount = FLASHCARDS_DATA.filter(isDueCard).length;

  const filteredCards = FLASHCARDS_DATA.filter((card) => {
    if (initialSubject && card.subject !== initialSubject) return false;
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'due') return isDueCard(card);
    if (categoryFilter === 'starred') return starredCards.has(card.id);
    if (categoryFilter === 'learned')
      return (
        learnedCards.has(card.id) || (leitnerStates[card.id]?.box || 1) >= 4
      );
    return card.category === categoryFilter;
  });

  const currentCard = filteredCards[currentIndex] || filteredCards[0];
  const currentLeitner = currentCard
    ? leitnerStates[currentCard.id] || {
        box: 1,
        lastReviewedAt: '',
        nextReviewAt: '',
        reviewCount: 0,
      }
    : null;

  const handleNext = () => {
    stopSpeech();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const handlePrev = () => {
    stopSpeech();
    setIsFlipped(false);
    setCurrentIndex(
      (prev) =>
        (prev - 1 + (filteredCards.length || 1)) % (filteredCards.length || 1),
    );
  };

  const handleShuffle = () => {
    stopSpeech();
    setIsFlipped(false);
    const rand = Math.floor(Math.random() * (filteredCards.length || 1));
    setCurrentIndex(rand);
  };

  const handleLeitnerReview = (
    cardId: string,
    result: 'forgot' | 'hard' | 'known',
  ) => {
    const updated = saveCardLeitnerState(cardId, result);
    setLeitnerStates((prev) => ({ ...prev, [cardId]: updated }));
    if (result === 'known' && updated.box >= 4) {
      setLearnedCards((prev) => {
        const next = new Set(prev).add(cardId);
        try {
          localStorage.setItem(
            LEARNED_FORMULAS_KEY,
            JSON.stringify(Array.from(next)),
          );
        } catch {
          // ignore
        }
        return next;
      });
    }
    handleNext();
  };

  const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  FLASHCARDS_DATA.forEach((c) => {
    const b = leitnerStates[c.id]?.box || 1;
    boxCounts[b as 1 | 2 | 3 | 4 | 5]++;
  });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden !important; }
          .print-flashcards-area, .print-flashcards-area * { visibility: visible !important; }
          .print-flashcards-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-height: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 8mm !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `,
        }}
      />

      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Matematik Formül & Bilgi Kartları"
        className="relative z-10 print-flashcards-area flex h-full max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 shadow-2xl"
      >
        <ErrorBoundary
          fallback={({ reset }) => (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-600 dark:text-slate-300 gap-4">
              <p className="text-sm">
                Formül kartları yüklenirken beklenmedik bir durum oluştu.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 rounded-xl font-semibold text-xs transition bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
                >
                  Yeniden Dene
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl text-slate-700 dark:text-white font-semibold text-xs transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        >
          <FlashcardPrintSection
            categoryFilter={categoryFilter}
            filteredCards={filteredCards}
          />

          <FlashcardHeader
            onOpenSpeedDrill={() => setIsSpeedDrillOpen(true)}
            onShuffle={handleShuffle}
            onClose={onClose}
          />

          <FlashcardCategoryNav
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            totalCardsCount={FLASHCARDS_DATA.length}
            dueCount={dueCount}
            starredCount={starredCards.size}
            learnedCount={learnedCards.size}
            filteredCount={filteredCards.length}
            currentIndex={currentIndex}
            onResetPage={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          />

          <FlashcardViewer
            currentCard={currentCard}
            currentLeitner={currentLeitner}
            isFlipped={isFlipped}
            setIsFlipped={setIsFlipped}
            isSpeaking={isSpeaking}
            isSpeechSupported={isSpeechSupported}
            toggleSpeech={toggleSpeech}
            starredCards={starredCards}
            toggleStarred={toggleStarred}
            learnedCards={learnedCards}
            toggleLearned={toggleLearned}
            onLeitnerReview={handleLeitnerReview}
          />

          {/* Alt Navigasyon & Leitner Dağılımı */}
          <div className="no-print flex items-center justify-between border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/80 px-3 sm:px-6 py-3 sm:py-4 gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Önceki Kart"
              disabled={filteredCards.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-40 shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>
                Önceki <span className="hidden sm:inline">Kart</span>
              </span>
            </button>

            <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="text-slate-500 font-sans hidden sm:inline">
                Hafıza Kutuları:
              </span>
              <span
                className="px-1.5 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                title="Kutu 1: Günlük"
              >
                K1:{boxCounts[1]}
              </span>
              <span
                className="px-1.5 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                title="Kutu 2: 3 Günlük"
              >
                K2:{boxCounts[2]}
              </span>
              <span
                className="px-1.5 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                title="Kutu 3: 7 Günlük"
              >
                K3:{boxCounts[3]}
              </span>
              <span
                className="px-1.5 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                title="Kutu 4: 14 Günlük"
              >
                K4:{boxCounts[4]}
              </span>
              <span
                className="px-1.5 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-accent-success-ink dark:text-emerald-400"
                title="Kutu 5: Kalıcı (30 Gün)"
              >
                K5:{boxCounts[5]}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Sonraki Kart"
              disabled={filteredCards.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold disabled:opacity-40 shrink-0 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
            >
              <span>
                Sonraki <span className="hidden sm:inline">Kart</span>
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </ErrorBoundary>
      </div>

      <FormulaSpeedDrillModal
        isOpen={isSpeedDrillOpen}
        onClose={() => setIsSpeedDrillOpen(false)}
        onOpenFlashcards={() => setIsSpeedDrillOpen(false)}
      />
    </div>
  );
}
