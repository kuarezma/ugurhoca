import { describe, expect, it } from 'vitest';
import type { Quiz } from '@/types/quiz';
import { pickLeagueQuiz } from './pick-league-quiz';

const quiz = (id: string, overrides: Partial<Quiz> = {}): Quiz => ({
  id,
  title: 'Konu Testi',
  grade: 8,
  time_limit: 40,
  difficulty: 'Orta',
  description: null,
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T10:00:00Z',
  ...overrides,
});

describe('pickLeagueQuiz', () => {
  it('selects the newest active mock exam for the selected grade regardless of list order', () => {
    const old = quiz('old', {
      title: 'Deneme',
      created_at: '2026-09-01T10:00:00Z',
    });
    const newest = quiz('newest', {
      title: 'LGS DENEME',
      created_at: '2026-10-20T10:00:00Z',
    });
    const quizzes = [
      old,
      newest,
      quiz('inactive', {
        title: 'Deneme',
        is_active: false,
        created_at: '2026-10-25T10:00:00Z',
      }),
      quiz('other-grade', {
        title: 'Deneme',
        grade: 7,
        created_at: '2026-10-25T10:00:00Z',
      }),
    ];
    expect(pickLeagueQuiz(quizzes, 8)).toBe(newest);
  });

  it('prefers a mock exam over a newer general test', () => {
    const mock = quiz('mock', {
      title: 'Deneme',
      created_at: '2026-09-01T10:00:00Z',
    });
    expect(
      pickLeagueQuiz(
        [quiz('general', { title: 'Genel Değerlendirme' }), mock],
        8,
      ),
    ).toBe(mock);
  });

  it('selects the newest general test when no eligible mock exam exists', () => {
    const general = quiz('general', {
      title: 'GENEL Değerlendirme',
      created_at: '2026-10-20T10:00:00Z',
    });
    expect(
      pickLeagueQuiz(
        [
          quiz('topic'),
          quiz('old-general', { title: 'Genel Tekrar' }),
          general,
          quiz('other-mock', { title: 'Deneme', grade: 7 }),
        ],
        8,
      ),
    ).toBe(general);
  });

  it('falls back to the first active quiz for the selected grade', () => {
    const first = quiz('first');
    expect(
      pickLeagueQuiz(
        [
          quiz('inactive', { is_active: false }),
          quiz('other-grade', { grade: 7 }),
          first,
          quiz('later', { created_at: '2026-10-25T10:00:00Z' }),
        ],
        8,
      ),
    ).toBe(first);
  });

  it.each([undefined, null])(
    'uses the supplied active list when grade is %s',
    (grade) => {
      const mock = quiz('mock', { title: 'Deneme', grade: 7 });
      expect(pickLeagueQuiz([quiz('topic'), mock], grade)).toBe(mock);
    },
  );

  it('accepts stored string grades and graduate grades', () => {
    const eighth = quiz('eighth');
    const graduate = quiz('graduate', { grade: 0 });
    expect(pickLeagueQuiz([graduate, eighth], '08')).toBe(eighth);
    expect(pickLeagueQuiz([eighth, graduate], 'Mezun')).toBe(graduate);
    expect(pickLeagueQuiz([eighth, graduate], 0)).toBe(graduate);
  });

  it('does not return inactive quizzes or a quiz from another grade', () => {
    expect(pickLeagueQuiz([], 8)).toBeUndefined();
    expect(
      pickLeagueQuiz([quiz('inactive', { is_active: false })]),
    ).toBeUndefined();
    expect(pickLeagueQuiz([quiz('other', { grade: 7 })], 8)).toBeUndefined();
    expect(pickLeagueQuiz([quiz('topic')], 'invalid')).toBeUndefined();
  });

  it('handles missing dates and preserves input order for equal dates', () => {
    const undated = quiz('undated', { title: 'Deneme', created_at: '' });
    const valid = quiz('valid', { title: 'Deneme' });
    expect(pickLeagueQuiz([undated, valid])).toBe(valid);
    expect(pickLeagueQuiz([valid, undated])).toBe(valid);
    expect(
      pickLeagueQuiz([
        undated,
        quiz('invalid', { title: 'Deneme', created_at: 'invalid' }),
      ]),
    ).toBe(undated);
    expect(pickLeagueQuiz([valid, quiz('equal', { title: 'Deneme' })])).toBe(
      valid,
    );
  });

  it('does not mutate the supplied list or quizzes', () => {
    const first = Object.freeze(quiz('first', { title: 'Deneme' }));
    const newest = Object.freeze(
      quiz('newest', { title: 'Deneme', created_at: '2026-10-20T10:00:00Z' }),
    );
    const quizzes = Object.freeze([first, newest]);
    expect(pickLeagueQuiz(quizzes, 8)).toBe(newest);
    expect(quizzes[0]).toBe(first);
  });
});
