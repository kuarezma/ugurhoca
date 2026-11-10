import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';

import { Quiz, QuizQuestion } from '@/types/quiz';

type UseQuizKeyboardProps = {
  quizStarted: boolean;
  showResult: boolean;
  selectedQuiz: Quiz | null;
  setIsGlossaryOpen: Dispatch<SetStateAction<boolean>>;
  clearAnswer: (targetQuestionIndex?: number) => void;
  currentQuestion: number;
  setIsOpticalDocked: Dispatch<SetStateAction<boolean>>;
  setIsOpticalSheetOpen: Dispatch<SetStateAction<boolean>>;
  setIsHintLadderOpen: Dispatch<SetStateAction<boolean>>;
  toggleDyslexicMode: () => void;
  quizQuestions: QuizQuestion[];
  selectAnswer: (index: number, targetQuestionIndex?: number) => void;
  isShortcutsOpen: boolean;
  isScratchpadOpen: boolean;
  isGlossaryOpen: boolean;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setIsDrawingOverlayActive: Dispatch<SetStateAction<boolean>>;
  setIsScratchpadOpen: Dispatch<SetStateAction<boolean>>;
  toggleFlagQuestion: (index: number) => void;
  setIsShortcutsOpen: Dispatch<SetStateAction<boolean>>;
  isOpticalSheetOpen: boolean;
  isOpticalDocked: boolean;
  answers: { [key: number]: number };
};

export function useQuizKeyboard({
  quizStarted,
  showResult,
  selectedQuiz,
  setIsGlossaryOpen,
  clearAnswer,
  currentQuestion,
  setIsOpticalDocked,
  setIsOpticalSheetOpen,
  setIsHintLadderOpen,
  toggleDyslexicMode,
  quizQuestions,
  selectAnswer,
  isShortcutsOpen,
  isScratchpadOpen,
  isGlossaryOpen,
  nextQuestion,
  previousQuestion,
  setIsDrawingOverlayActive,
  setIsScratchpadOpen,
  toggleFlagQuestion,
  setIsShortcutsOpen,
  isOpticalSheetOpen,
  isOpticalDocked,
  answers,
}: UseQuizKeyboardProps) {
  useEffect(() => {
    if (!quizStarted || showResult || !selectedQuiz) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toUpperCase();

      if (e.shiftKey && key === 'K') {
        e.preventDefault();
        setIsGlossaryOpen((prev) => !prev);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        clearAnswer(currentQuestion);
      } else if (key === 'O') {
        e.preventDefault();
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
          setIsOpticalDocked((prev) => !prev);
        } else {
          setIsOpticalSheetOpen((prev) => !prev);
        }
      } else if (key === 'I' || key === 'H') {
        e.preventDefault();
        setIsHintLadderOpen((prev) => !prev);
      } else if (key === 'D') {
        e.preventDefault();
        toggleDyslexicMode();
      } else if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        const optionIndex = key.charCodeAt(0) - 65;
        const currentQ = quizQuestions[currentQuestion];
        if (
          currentQ &&
          currentQ.options &&
          optionIndex < currentQ.options.length
        ) {
          e.preventDefault();
          selectAnswer(optionIndex);
        }
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const optionIndex = parseInt(e.key, 10) - 1;
        const currentQ = quizQuestions[currentQuestion];
        if (
          currentQ &&
          currentQ.options &&
          optionIndex < currentQ.options.length
        ) {
          e.preventDefault();
          selectAnswer(optionIndex);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!isShortcutsOpen && !isScratchpadOpen && !isGlossaryOpen) {
          e.preventDefault();
          nextQuestion();
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isShortcutsOpen && !isScratchpadOpen && !isGlossaryOpen) {
          e.preventDefault();
          previousQuestion();
        }
      } else if (e.shiftKey && key === 'S') {
        e.preventDefault();
        setIsDrawingOverlayActive((prev) => !prev);
      } else if (key === 'K' || key === 'S') {
        e.preventDefault();
        setIsScratchpadOpen((prev) => !prev);
      } else if (key === 'F' || key === 'B') {
        e.preventDefault();
        toggleFlagQuestion(currentQuestion);
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsScratchpadOpen(false);
        setIsDrawingOverlayActive(false);
        setIsGlossaryOpen(false);
        setIsOpticalSheetOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quizStarted,
    showResult,
    selectedQuiz,
    currentQuestion,
    quizQuestions,
    isShortcutsOpen,
    isScratchpadOpen,
    isGlossaryOpen,
    isOpticalSheetOpen,
    isOpticalDocked,
    answers,
    toggleDyslexicMode,
  ]);
}
