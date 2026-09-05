import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedMistakes,
  saveMistakesToBank,
  markMistakeMastered,
  removeMistakeFromBank,
  clearAllMistakes,
  updateMistakeReason,
  advanceMistakeReview,
  getDueMistakes,
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
    expect(getSavedMistakes()).toHaveLength(1);

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

  it('self-heals when localStorage contains corrupted non-array data', () => {
    localStorage.setItem('ugur_hoca_mistakes_bank_v1', '{"invalid":"object"}');
    const result = getSavedMistakes();
    expect(result).toEqual([]);
    expect(localStorage.getItem('ugur_hoca_mistakes_bank_v1')).toBeNull();
  });

  it('self-heals when localStorage contains invalid JSON string', () => {
    localStorage.setItem('ugur_hoca_mistakes_bank_v1', 'not valid json {{{');
    const result = getSavedMistakes();
    expect(result).toEqual([]);
  });

  it('advances spaced repetition stage on correct answer and completes on stage 3', () => {
    saveMistakesToBank([mockQuestion]);
    const initial = getSavedMistakes()[0];
    expect(initial.reviewStage).toBe(0);
    expect(initial.mastered).toBe(false);

    // 1. Doğru çözüm -> Aşama 1
    advanceMistakeReview(mockQuestion.question, true);
    let current = getSavedMistakes()[0];
    expect(current.reviewStage).toBe(1);
    expect(current.mastered).toBe(false);
    expect(current.reviewCount).toBe(1);

    // 2. Doğru çözüm -> Aşama 2
    advanceMistakeReview(mockQuestion.question, true);
    current = getSavedMistakes()[0];
    expect(current.reviewStage).toBe(2);
    expect(current.mastered).toBe(false);
    expect(current.reviewCount).toBe(2);

    // 3. Doğru çözüm -> Aşama 3 (Kalıcı Öğrenildi / mastered = true)
    advanceMistakeReview(mockQuestion.question, true);
    current = getSavedMistakes()[0];
    expect(current.reviewStage).toBe(3);
    expect(current.mastered).toBe(true);
    expect(current.reviewCount).toBe(3);
  });

  it('resets spaced repetition stage to 0 when student struggles (correct = false)', () => {
    saveMistakesToBank([mockQuestion]);
    advanceMistakeReview(mockQuestion.question, true);
    expect(getSavedMistakes()[0].reviewStage).toBe(1);

    // Zorlandı -> Başa döner (aşama 0) ve yarın tekrar planlanır
    advanceMistakeReview(mockQuestion.question, false);
    const reset = getSavedMistakes()[0];
    expect(reset.reviewStage).toBe(0);
    expect(reset.mastered).toBe(false);
  });

  it('filters due mistakes correctly based on review date and mastered status', () => {
    saveMistakesToBank([mockQuestion]);
    // Initially not due today because scheduled for tomorrow
    expect(getDueMistakes()).toHaveLength(0);

    // If nextReviewDate is today or past, it should be due
    const todayStr = new Date().toISOString().split('T')[0];
    const item = getSavedMistakes()[0];
    localStorage.setItem(
      'ugur_hoca_mistakes_bank_v1',
      JSON.stringify([{ ...item, nextReviewDate: todayStr }]),
    );
    expect(getDueMistakes()).toHaveLength(1);

    // If mastered, should not be due
    markMistakeMastered(mockQuestion.question, true);
    expect(getDueMistakes()).toHaveLength(0);
  });
});
