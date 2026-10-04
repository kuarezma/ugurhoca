import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import {
  AUTH_SNAPSHOT_COOKIE_NAME,
  serializeAuthSnapshot,
} from './auth-snapshot';
import { userScopedStorage } from './userScopedStorage';
import { getDailyGoal, incrementQuestionsSolved } from './dailyGoalStorage';
import {
  getSavedMistakes,
  saveMistakesToBank,
} from '@/features/quizzes/lib/mistakeStorage';
import {
  getActiveQuizDraft,
  saveQuizDraft,
} from '@/features/quizzes/lib/quizDraftStorage';
import type { QuizQuestion } from '@/types/quiz';

const signIn = (id: string) => {
  document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=${serializeAuthSnapshot({ id, email: 'student@example.com', name: 'Öğrenci', grade: 8, isAdmin: false })}; path=/`;
};
const clearCookie = () => {
  document.cookie = `${AUTH_SNAPSHOT_COOKIE_NAME}=; path=/; max-age=0`;
};
const draft = {
  quizId: 'private-quiz',
  quizTitle: 'Test',
  currentQuestion: 0,
  answers: {},
  flaggedQuestions: [],
  questionTimes: {},
  startTime: Date.now(),
  timeLeft: 600,
};
const question = {
  id: 'private-question',
  question: '1 + 1?',
  options: ['1', '2'],
  correct_index: 1,
} as QuizQuestion;

describe('shared-device learning storage', () => {
  beforeEach(() => {
    localStorage.clear();
    clearCookie();
  });
  afterEach(() => {
    clearCookie();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('isolates drafts, mistakes and daily goals and retains data after signing back in', () => {
    signIn('user-a');
    saveQuizDraft(draft);
    saveMistakesToBank([question]);
    incrementQuestionsSolved(7);
    signIn('user-b');
    expect(getActiveQuizDraft()).toBeNull();
    expect(getSavedMistakes()).toEqual([]);
    expect(getDailyGoal().solved).toBe(0);
    incrementQuestionsSolved(2);
    signIn('user-a');
    expect(getActiveQuizDraft()?.quizId).toBe('private-quiz');
    expect(getSavedMistakes()).toHaveLength(1);
    expect(getDailyGoal().solved).toBe(7);
  });

  it('migrates all legacy learning data only to the first signed-in user', () => {
    saveQuizDraft(draft);
    saveMistakesToBank([question]);
    incrementQuestionsSolved(5);
    localStorage.setItem('favorites', '["old-favorite"]');
    localStorage.setItem('matematiklab_completed_docs', '["old-document"]');
    localStorage.setItem('ugurhoca_pending_quiz_results', '[]');
    signIn('user-a');
    expect(getDailyGoal().solved).toBe(5);
    expect(localStorage.getItem('ugurhoca_daily_goal_v1')).toBeNull();
    expect(localStorage.getItem('favorites:user-a')).toBe('["old-favorite"]');
    expect(localStorage.getItem('matematiklab_completed_docs:user-a')).toBe(
      '["old-document"]',
    );
    expect(localStorage.getItem('ugurhoca_pending_quiz_results:user-a')).toBe(
      '[]',
    );
    expect(localStorage.getItem('ugurhoca_quiz_draft_private-quiz')).toBeNull();
    signIn('user-b');
    expect(getActiveQuizDraft()).toBeNull();
    expect(getSavedMistakes()).toEqual([]);
    expect(getDailyGoal().solved).toBe(0);
    expect(localStorage.getItem('favorites:user-b')).toBeNull();
  });
  it('does not repeat migration for newly written anonymous data', () => {
    signIn('user-a');
    getDailyGoal();
    clearCookie();
    incrementQuestionsSolved(3);
    expect(getDailyGoal().solved).toBe(3);
    signIn('user-b');
    expect(getDailyGoal().solved).toBe(0);
    expect(localStorage.getItem('ugurhoca_daily_goal_v1')).not.toBeNull();
  });

  it('preserves an existing scoped value during legacy migration', () => {
    localStorage.setItem('favorites', '["old"]');
    localStorage.setItem('favorites:user-a', '["current"]');
    expect(userScopedStorage('user-a').getItem('favorites')).toBe(
      '["current"]',
    );
    expect(localStorage.getItem('favorites')).toBeNull();
  });

  it('keeps the legacy source when migration hits a quota error', () => {
    localStorage.setItem('favorites', '["old"]');
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(userScopedStorage('user-a').getItem('favorites')).toBeNull();
    expect(localStorage.getItem('favorites')).toBe('["old"]');
    expect(
      localStorage.getItem('ugurhoca_user_storage_migrated_v1'),
    ).toBeNull();
  });

  it('keeps the first migration owner even when a write fails midway', () => {
    localStorage.setItem('ugur_hoca_mistakes_bank_v1', '[]');
    localStorage.setItem('favorites', '["private-legacy"]');
    const originalSet = localStorage.setItem.bind(localStorage);
    vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
      if (key === 'ugur_hoca_mistakes_bank_v1:user-a') throw new Error('quota');
      originalSet(key, value);
    });
    expect(userScopedStorage('user-a').getItem('favorites')).toBeNull();
    vi.restoreAllMocks();
    expect(userScopedStorage('user-b').getItem('favorites')).toBeNull();
    expect(userScopedStorage('user-a').getItem('favorites')).toBe(
      '["private-legacy"]',
    );
  });

  it('is safe when storage access is denied or during SSR', () => {
    const storage = userScopedStorage('user-a');
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(storage.getItem('favorites')).toBeNull();
    expect(storage.setItem('favorites', '[]')).toBe(false);
    expect(storage.removeItem('favorites')).toBe(false);
    vi.restoreAllMocks();
    vi.stubGlobal('window', undefined);
    expect(storage.getItem('favorites')).toBeNull();
    expect(storage.setItem('favorites', '[]')).toBe(false);
    expect(storage.removeItem('favorites')).toBe(false);
  });
});
