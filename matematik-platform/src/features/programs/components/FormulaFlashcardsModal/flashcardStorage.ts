import type { LeitnerBoxLevel, CardLeitnerState } from './types';

export const LEITNER_INTERVALS: Record<LeitnerBoxLevel, number> = {
  1: 1, // 1 gün
  2: 3, // 3 gün
  3: 7, // 7 gün
  4: 14, // 14 gün
  5: 30, // 30 gün (kalıcı)
};

export const LEITNER_STORAGE_KEY = 'ugurhoca_leitner_box_v1';
export const STARRED_FORMULAS_KEY = 'ugurhoca_starred_formulas_v1';
export const LEARNED_FORMULAS_KEY = 'ugurhoca_learned_formulas_v1';

export function getStarredFormulaIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STARRED_FORMULAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLearnedFormulaIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEARNED_FORMULAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLeitnerStates(): Record<string, CardLeitnerState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LEITNER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCardLeitnerState(
  cardId: string,
  result: 'forgot' | 'hard' | 'known',
): CardLeitnerState {
  const all = getLeitnerStates();
  const current = all[cardId] || {
    box: 1,
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: new Date().toISOString(),
    reviewCount: 0,
  };

  let newBox: LeitnerBoxLevel = current.box;
  if (result === 'forgot') {
    newBox = 1;
  } else if (result === 'hard') {
    newBox = current.box;
  } else if (result === 'known') {
    newBox = Math.min(5, current.box + 1) as LeitnerBoxLevel;
  }

  const intervalDays = LEITNER_INTERVALS[newBox];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  const updated: CardLeitnerState = {
    box: newBox,
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: nextDate.toISOString(),
    reviewCount: (current.reviewCount || 0) + 1,
  };

  all[cardId] = updated;
  try {
    localStorage.setItem(LEITNER_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
  return updated;
}
