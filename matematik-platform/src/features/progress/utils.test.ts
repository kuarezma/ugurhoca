import { describe, expect, it } from 'vitest';
import {
  getCurrentWeekStart,
  mergeProgressRow,
  prependStudySession,
  resolveCurrentGoal,
} from '@/features/progress/utils';

describe('progress utils', () => {
  it('computes the current week start for a mid-week date', () => {
    expect(getCurrentWeekStart(new Date('2026-04-15T12:00:00Z'))).toBe(
      '2026-04-13',
    );
  });

  it('resolves the current goal or returns a default one', () => {
    expect(
      resolveCurrentGoal(
        [{ target_duration: 450, week_start: '2026-04-13' }],
        new Date('2026-04-15T12:00:00Z'),
      ),
    ).toEqual({
      target_duration: 450,
      week_start: '2026-04-13',
    });

    expect(resolveCurrentGoal([], new Date('2026-04-15T12:00:00Z'))).toEqual({
      target_duration: 600,
      week_start: '2026-04-13',
    });
  });

  it('merges progress rows and keeps highest mastery first', () => {
    expect(
      mergeProgressRow(
        [
          { mastery_level: 40, topic: 'Üslü İfadeler', user_id: '1' },
          { mastery_level: 70, topic: 'Olasılık', user_id: '1' },
        ],
        { mastery_level: 85, topic: 'Üslü İfadeler', user_id: '1' },
      ),
    ).toEqual([
      { mastery_level: 85, topic: 'Üslü İfadeler', user_id: '1' },
      { mastery_level: 70, topic: 'Olasılık', user_id: '1' },
    ]);
  });

  it('prepends newly added sessions', () => {
    expect(
      prependStudySession(
        [{ date: '2026-04-12', duration: 30, id: 'old' }],
        { date: '2026-04-13', duration: 45, id: 'new' },
      ),
    ).toEqual([
      { date: '2026-04-13', duration: 45, id: 'new' },
      { date: '2026-04-12', duration: 30, id: 'old' },
    ]);
  });
});
