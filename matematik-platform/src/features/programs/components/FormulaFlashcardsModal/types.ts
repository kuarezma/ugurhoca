export type Flashcard = {
  id: string;
  category: 'lgs' | 'yks';
  subject: string;
  title: string;
  frontText: string;
  formula: string;
  tip: string;
  example?: string;
};

export type LeitnerBoxLevel = 1 | 2 | 3 | 4 | 5;

export type CardLeitnerState = {
  box: LeitnerBoxLevel;
  lastReviewedAt: string;
  nextReviewAt: string;
  reviewCount: number;
};

export type FormulaFlashcardsModalProps = {
  initialSubject?: string;
  isOpen: boolean;
  onClose: () => void;
};
