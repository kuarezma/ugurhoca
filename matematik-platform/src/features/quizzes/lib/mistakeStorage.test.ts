import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedMistakes,
  saveMistakesToBank,
  markMistakeMastered,
  removeMistakeFromBank,
  clearAllMistakes,
  updateMistakeReason,
} from './mistakeStorage';
import type { QuizQuestion } from '@/types/quiz';

const mockQuestion: QuizQuestion = {
  id: 'q-1',
  quiz_id: 'quiz-1',
  question_order: 1,
  question: '5x + 10 = 25 ise x kaçtır?',
  options: ['1', '2', '3', '4'],
  correct_index: 2,
  explanation: '5x = 15 => x = 3',
  created_at: '2026-01-01T00:00:00Z',
};

describe('mistakeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves mistakes and prevents duplicates', () => {
    const addedFirst = saveMistakesToBank([mockQuestion], 'Denklem Testi');
    expect(addedFirst).toBe(1);

    const saved = getSavedMistakes();
    expect(saved).toHaveLength(1);
    expect(saved[0].question.question).toBe(mockQuestion.question);
    expect(saved[0].mastered).toBe(false);

    // Tekrar eklendiğinde duplikasyon olmamalı
    const addedSecond = saveMistakesToBank([mockQuestion], 'Denklem Testi');
    expect(addedSecond).toBe(0);
    expect(getSavedMistakes()).toHaveLength(1);
  });

  it('marks a mistake as mastered', () => {
    saveMistakesToBank([mockQuestion]);
    markMistakeMastered(mockQuestion.question, true);

    const saved = getSavedMistakes();
    expect(saved[0].mastered).toBe(true);
  });

  it('removes a mistake from bank', () => {
    saveMistakesToBank([mockQuestion]);
    expect(getSavedMistakes()).toHaveLength(1);

    removeMistakeFromBank(mockQuestion.question);
    expect(getSavedMistakes()).toHaveLength(0);
  });

  it('clears all mistakes', () => {
    saveMistakesToBank([mockQuestion]);
    clearAllMistakes();
    expect(getSavedMistakes()).toHaveLength(0);
  });

  it('updates mistake reason', () => {
    saveMistakesToBank([mockQuestion]);
    updateMistakeReason(mockQuestion.question, 'careless');

    const saved = getSavedMistakes();
    expect(saved[0].reason).toBe('careless');

    // Neden kaldırılabilir
    updateMistakeReason(mockQuestion.question, undefined);
    expect(getSavedMistakes()[0].reason).toBeUndefined();
  });
});
