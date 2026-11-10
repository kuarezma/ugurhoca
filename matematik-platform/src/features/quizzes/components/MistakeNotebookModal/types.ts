import type { QuizQuestion } from '@/types/quiz';
import type { MistakeReason } from '@/features/quizzes/lib/mistakeStorage';

export type MistakeNotebookModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartRetakeQuiz?: (questions: QuizQuestion[]) => void;
};

export type FilterType = 'due' | 'pending' | 'mastered' | 'all';

export type ReasonBreakdown = {
  total: number;
  careless: number;
  concept: number;
  reading: number;
  time: number;
  untagged: number;
  carelessPct: number;
  conceptPct: number;
  readingPct: number;
  timePct: number;
  untaggedPct: number;
  dominant: {
    key: MistakeReason;
    count: number;
    pct: number;
    label: string;
  } | null;
  advice: {
    title: string;
    desc: string;
    icon: string;
  } | null;
};
