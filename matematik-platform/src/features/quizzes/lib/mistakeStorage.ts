import type { QuizQuestion } from '@/types/quiz';

export type MistakeReason = 'careless' | 'concept' | 'reading' | 'time';

export const MISTAKE_REASON_LABELS: Record<
  MistakeReason,
  { label: string; shortLabel: string; emoji: string }
> = {
  careless: { label: 'İşlem Hatası (Dikkatsizlik)', shortLabel: 'İşlem Hatası', emoji: '🔴' },
  concept: { label: 'Konu / Kural Eksikliği', shortLabel: 'Kural Eksikliği', emoji: '🟡' },
  reading: { label: 'Soru Kökünü Yanlış Okuma', shortLabel: 'Yanlış Okuma', emoji: '🔵' },
  time: { label: 'Süre Baskısı / Yetişmedi', shortLabel: 'Süre Baskısı', emoji: '🟣' },
};

export type SavedMistakeQuestion = {
  id: string;
  question: QuizQuestion;
  quizTitle?: string;
  savedAt: string;
  mastered: boolean;
  reason?: MistakeReason;
  reviewStage?: number; // 0: Yeni (1 gün sonra), 1: 1. Tekrar (3 gün sonra), 2: 2. Tekrar (7 gün sonra), 3: Kalıcı Öğrenildi (Mastered)
  nextReviewDate?: string; // YYYY-MM-DD
  lastReviewedAt?: string;
  reviewCount?: number;
};

export const SPACED_INTERVALS_DAYS = [1, 3, 7];

const STORAGE_KEY = 'ugur_hoca_mistakes_bank_v1';
const MAX_MISTAKES = 200;

export const getSavedMistakes = (): SavedMistakeQuestion[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is SavedMistakeQuestion =>
        Boolean(item && typeof item === 'object' && item.question && typeof item.question === 'object')
      );
    }
    // Bozuk veri varsa temizle ve kendini onar
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch {
    return [];
  }
};

export const getDueMistakes = (): SavedMistakeQuestion[] => {
  const mistakes = getSavedMistakes();
  const today = new Date().toISOString().split('T')[0];
  return mistakes.filter(
    (m) => !m.mastered && (!m.nextReviewDate || m.nextReviewDate <= today)
  );
};

export const advanceMistakeReview = (questionText: string, correct = true): void => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedMistakes();
    const today = new Date();
    const next = existing.map((m) => {
      if (m.question.question !== questionText) return m;
      if (correct) {
        const nextStage = (m.reviewStage ?? 0) + 1;
        if (nextStage >= 3) {
          return {
            ...m,
            reviewStage: 3,
            mastered: true,
            lastReviewedAt: today.toISOString(),
            reviewCount: (m.reviewCount || 0) + 1,
          };
        }
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + (SPACED_INTERVALS_DAYS[nextStage] || 7));
        return {
          ...m,
          reviewStage: nextStage,
          mastered: false,
          nextReviewDate: nextDate.toISOString().split('T')[0],
          lastReviewedAt: today.toISOString(),
          reviewCount: (m.reviewCount || 0) + 1,
        };
      } else {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return {
          ...m,
          reviewStage: 0,
          mastered: false,
          nextReviewDate: tomorrow.toISOString().split('T')[0],
          lastReviewedAt: today.toISOString(),
          reviewCount: (m.reviewCount || 0) + 1,
        };
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let addedCount = 0;
    for (const q of questions) {
      if (!existingMap.has(q.question)) {
        existingMap.set(q.question, {
          id: `mistake_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          question: q,
          quizTitle,
          savedAt: new Date().toISOString(),
          mastered: false,
          reviewStage: 0,
          nextReviewDate: tomorrowStr,
          reviewCount: 0,
        });
        addedCount++;
      }
    }

    // Kota aşımını önlemek için en fazla MAX_MISTAKES soru sakla (FIFO)
    const nextList = Array.from(existingMap.values()).slice(-MAX_MISTAKES);
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

export const updateMistakeReason = (
  questionText: string,
  reason?: MistakeReason,
): void => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedMistakes();
    const next = existing.map((m) =>
      m.question.question === questionText ? { ...m, reason } : m,
    );
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
