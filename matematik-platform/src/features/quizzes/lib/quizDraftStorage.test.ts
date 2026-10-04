import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveQuizDraft,
  getQuizDraft,
  clearQuizDraft,
  getActiveQuizDraft,
} from './quizDraftStorage';

describe('quizDraftStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('does not leave an active pointer when the draft write is rejected', () => {
    const originalSet = localStorage.setItem.bind(localStorage);
    vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
      if (key.startsWith('ugurhoca_quiz_draft_')) throw new Error('quota');
      originalSet(key, value);
    });
    saveQuizDraft({ quizId: 'rejected', quizTitle: 'Test', currentQuestion: 0,
      answers: {}, flaggedQuestions: [], questionTimes: {}, startTime: Date.now(), timeLeft: 60 });
    expect(localStorage.getItem('ugurhoca_active_draft_quiz_id')).toBeNull();
  });

  it('saves and retrieves a quiz draft correctly', () => {
    const draft = {
      quizId: 'quiz_1',
      quizTitle: '8. Sınıf Üslü İfadeler',
      currentQuestion: 3,
      answers: { 0: 1, 1: 2, 2: 0 },
      flaggedQuestions: [2],
      questionTimes: { 0: 45, 1: 60, 2: 30 },
      startTime: 1000000,
      timeLeft: 1200,
    };

    saveQuizDraft(draft);
    const restored = getQuizDraft('quiz_1');

    expect(restored).not.toBeNull();
    expect(restored?.quizId).toBe('quiz_1');
    expect(restored?.currentQuestion).toBe(3);
    expect(restored?.answers).toEqual({ 0: 1, 1: 2, 2: 0 });
    expect(restored?.flaggedQuestions).toEqual([2]);
  });

  it('deducts elapsed time since last save from timeLeft', () => {
    const baseTime = 1000000000;
    vi.spyOn(Date, 'now').mockReturnValue(baseTime);

    saveQuizDraft({
      quizId: 'quiz_time',
      quizTitle: 'Zaman Testi',
      currentQuestion: 1,
      answers: { 0: 1 },
      flaggedQuestions: [],
      questionTimes: { 0: 30 },
      startTime: baseTime - 60000,
      timeLeft: 600, // 10 dakika kalmıştı
    });

    // 120 saniye (2 dakika) sonra geri açıldığında:
    vi.spyOn(Date, 'now').mockReturnValue(baseTime + 120 * 1000);

    const restored = getQuizDraft('quiz_time');
    expect(restored?.timeLeft).toBe(480); // 600 - 120 = 480 saniye
  });

  it('expires and clears draft if older than 24 hours', () => {
    const baseTime = 1000000000;
    vi.spyOn(Date, 'now').mockReturnValue(baseTime);

    saveQuizDraft({
      quizId: 'quiz_old',
      quizTitle: 'Eski Test',
      currentQuestion: 1,
      answers: {},
      flaggedQuestions: [],
      questionTimes: {},
      startTime: baseTime,
      timeLeft: 300,
    });

    // 25 saat sonra
    vi.spyOn(Date, 'now').mockReturnValue(baseTime + 25 * 60 * 60 * 1000);

    const restored = getQuizDraft('quiz_old');
    expect(restored).toBeNull();
  });

  it('removes a draft and active pointer once its remaining time expires', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000000);
    saveQuizDraft({ quizId: 'expired', quizTitle: 'Test', currentQuestion: 1,
      answers: { 0: 1 }, flaggedQuestions: [], questionTimes: {}, startTime: 900000, timeLeft: 30 });
    vi.spyOn(Date, 'now').mockReturnValue(1030000);
    expect(getActiveQuizDraft()).toBeNull();
    expect(localStorage.getItem('ugurhoca_quiz_draft_expired')).toBeNull();
    expect(localStorage.getItem('ugurhoca_active_draft_quiz_id')).toBeNull();
  });

  it('does not persist a draft with zero remaining time', () => {
    saveQuizDraft({ quizId: 'zero', quizTitle: 'Test', currentQuestion: 1,
      answers: { 0: 1 }, flaggedQuestions: [], questionTimes: {}, startTime: Date.now(), timeLeft: 0 });
    expect(localStorage.getItem('ugurhoca_quiz_draft_zero')).toBeNull();
    expect(getActiveQuizDraft()).toBeNull();
  });

  it('clears draft and removes active draft pointer', () => {
    saveQuizDraft({
      quizId: 'quiz_del',
      quizTitle: 'Silinecek',
      currentQuestion: 0,
      answers: {},
      flaggedQuestions: [],
      questionTimes: {},
      startTime: 100,
      timeLeft: 200,
    });

    expect(getActiveQuizDraft()?.quizId).toBe('quiz_del');

    clearQuizDraft('quiz_del');
    expect(getQuizDraft('quiz_del')).toBeNull();
    expect(getActiveQuizDraft()).toBeNull();
  });
});
