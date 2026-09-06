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
  reviewStage?: number; // 0: 1. Kutu (1 gün), 1: 2. Kutu (3 gün), 2: 3. Kutu (7 gün), 3: 4. Kutu (14 gün), 4: 5. Kutu (30 gün), 5: Kalıcı Öğrenildi (Mastered)
  nextReviewDate?: string; // YYYY-MM-DD
  lastReviewedAt?: string;
  reviewCount?: number;
  userSelectedOption?: number;
};

export const SPACED_INTERVALS_DAYS = [1, 3, 7, 14, 30];

export type LeitnerBoxInfo = {
  box: number;
  label: string;
  days: number;
  description: string;
};

export const LEITNER_BOXES: LeitnerBoxInfo[] = [
  { box: 1, label: '1. Kutu', days: 1, description: '1 Gün Sonra' },
  { box: 2, label: '2. Kutu', days: 3, description: '3 Gün Sonra' },
  { box: 3, label: '3. Kutu', days: 7, description: '1 Hafta Sonra' },
  { box: 4, label: '4. Kutu', days: 14, description: '2 Hafta Sonra' },
  { box: 5, label: '5. Kutu', days: 30, description: '1 Ay Sonra' },
];

export type SpacedReviewStats = {
  box1: number;
  box2: number;
  box3: number;
  box4: number;
  box5: number;
  mastered: number;
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
};

export const getSpacedReviewStats = (mistakes: SavedMistakeQuestion[]): SpacedReviewStats => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  const weekDate = new Date();
  weekDate.setDate(weekDate.getDate() + 7);
  const nextWeek = weekDate.toISOString().split('T')[0];

  const stats: SpacedReviewStats = {
    box1: 0,
    box2: 0,
    box3: 0,
    box4: 0,
    box5: 0,
    mastered: 0,
    dueToday: 0,
    dueTomorrow: 0,
    dueThisWeek: 0,
  };

  for (const m of mistakes) {
    if (m.mastered || (m.reviewStage && m.reviewStage >= 5)) {
      stats.mastered++;
      continue;
    }

    const stage = m.reviewStage ?? 0;
    if (stage === 0) stats.box1++;
    else if (stage === 1) stats.box2++;
    else if (stage === 2) stats.box3++;
    else if (stage === 3) stats.box4++;
    else if (stage === 4) stats.box5++;
    else stats.mastered++;

    if (!m.nextReviewDate || m.nextReviewDate <= today) {
      stats.dueToday++;
    } else if (m.nextReviewDate === tomorrow) {
      stats.dueTomorrow++;
    } else if (m.nextReviewDate <= nextWeek) {
      stats.dueThisWeek++;
    }
  }

  return stats;
};

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
        if (nextStage >= 5) {
          return {
            ...m,
            reviewStage: 5,
            mastered: true,
            lastReviewedAt: today.toISOString(),
            reviewCount: (m.reviewCount || 0) + 1,
          };
        }
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + (SPACED_INTERVALS_DAYS[nextStage] || 30));
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
  userAnswers?: Record<string, number>,
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
          userSelectedOption: userAnswers?.[q.id],
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

export const saveMistakesList = (items: SavedMistakeQuestion[]): void => {
  if (typeof window === 'undefined') return;
  try {
    const limited = items.slice(-MAX_MISTAKES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
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
