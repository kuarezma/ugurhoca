import type { QuizQuestion } from '@/types/quiz';

export type SavedMistakeQuestion = {
  id: string;
  question: QuizQuestion;
  quizTitle?: string;
  savedAt: string;
  mastered: boolean;
};

const STORAGE_KEY = 'ugur_hoca_mistakes_bank_v1';

export const getSavedMistakes = (): SavedMistakeQuestion[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveMistakesToBank = (
  questions: QuizQuestion[],
  quizTitle?: string,
): number => {
  if (typeof window === 'undefined' || !questions.length) return 0;
  try {
    const existing = getSavedMistakes();
    const existingMap = new Map(existing.map((m) => [m.question.question, m]));

    let addedCount = 0;
    for (const q of questions) {
      if (!existingMap.has(q.question)) {
        existingMap.set(q.question, {
          id: `mistake_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          question: q,
          quizTitle,
          savedAt: new Date().toISOString(),
          mastered: false,
        });
        addedCount++;
      }
    }

    const nextList = Array.from(existingMap.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    return addedCount;
  } catch {
    return 0;
  }
};

export const markMistakeMastered = (questionText: string, mastered = true): void => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedMistakes();
    const next = existing.map((m) =>
      m.question.question === questionText ? { ...m, mastered } : m,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
};

export const removeMistakeFromBank = (questionText: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedMistakes();
    const next = existing.filter((m) => m.question.question !== questionText);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
};

export const clearAllMistakes = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
