import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentWeekStart } from '@/features/progress/utils';
import {
  advanceMistakeReview,
  getDueMistakes,
  getSavedMistakes,
  getSpacedReviewStats,
  saveMistakesList,
  saveMistakesToBank,
} from '@/features/quizzes/lib/mistakeStorage';
import type { QuizQuestion } from '@/types/quiz';

const question = {
  id: 'q1',
  question: 'Soru',
  correct_index: 1,
  options: ['1', '2'],
} as QuizQuestion;
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  localStorage.clear();
});

describe('local calendar dates in Europe/Istanbul', () => {
  it.each([
    ['2026-10-05T00:30:00+03:00', '2026-10-05', '2026-10-06'],
    ['2026-10-04T23:30:00+03:00', '2026-09-28', '2026-10-05'],
  ])(
    'uses the local week and Leitner calendar at %s',
    (instant, weekStart, tomorrow) => {
      vi.stubEnv('TZ', 'Europe/Istanbul');
      vi.useFakeTimers();
      vi.setSystemTime(new Date(instant));
      expect(new Date().getTimezoneOffset()).toBe(-180);
      expect(getCurrentWeekStart()).toBe(weekStart);
      saveMistakesToBank([question]);
      expect(getSavedMistakes()[0].nextReviewDate).toBe(tomorrow);
      advanceMistakeReview(question.question, false);
      expect(getSavedMistakes()[0].nextReviewDate).toBe(tomorrow);
    },
  );

  it('treats Monday reviews as due at Monday 00:30 locally', () => {
    vi.stubEnv('TZ', 'Europe/Istanbul');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T00:30:00+03:00'));
    const mistakes = [
      {
        id: 'today',
        question,
        savedAt: '',
        mastered: false,
        nextReviewDate: '2026-10-05',
        reviewStage: 0,
      },
      {
        id: 'tomorrow',
        question: { ...question, id: 'q2' },
        savedAt: '',
        mastered: false,
        nextReviewDate: '2026-10-06',
        reviewStage: 0,
      },
      {
        id: 'week',
        question: { ...question, id: 'q3' },
        savedAt: '',
        mastered: false,
        nextReviewDate: '2026-10-12',
        reviewStage: 0,
      },
    ];
    saveMistakesList(mistakes);
    expect(getDueMistakes().map((m) => m.id)).toEqual(['today']);
    expect(getSpacedReviewStats(mistakes)).toMatchObject({
      dueToday: 1,
      dueTomorrow: 1,
      dueThisWeek: 1,
    });
    advanceMistakeReview(question.question, true);
    expect(getSavedMistakes()[0].nextReviewDate).toBe('2026-10-08');
  });
});
