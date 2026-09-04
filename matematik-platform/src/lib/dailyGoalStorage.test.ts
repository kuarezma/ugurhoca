import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDailyGoal,
  setDailyTarget,
  incrementQuestionsSolved,
  decrementQuestionsSolved,
  resetTodaySolved,
  getLocalDateString,
  getYesterdayDateString,
} from './dailyGoalStorage';

describe('dailyGoalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default goal data', () => {
    const data = getDailyGoal();
    expect(data.target).toBe(20);
    expect(data.solved).toBe(0);
    expect(data.streak).toBe(0);
    expect(data.date).toBe(getLocalDateString());
  });

  it('updates target within allowed bounds', () => {
    let data = setDailyTarget(50);
    expect(data.target).toBe(50);

    // Below min
    data = setDailyTarget(2);
    expect(data.target).toBe(5);

    // Above max
    data = setDailyTarget(1000);
    expect(data.target).toBe(500);
  });

  it('increments solved count and triggers streak when target met', () => {
    setDailyTarget(10);
    let data = incrementQuestionsSolved(5);
    expect(data.solved).toBe(5);
    expect(data.streak).toBe(0);

    data = incrementQuestionsSolved(5);
    expect(data.solved).toBe(10);
    expect(data.streak).toBe(1);
    expect(data.lastCompletedDate).toBe(getLocalDateString());

    // Additional increments today do not double-increment streak
    data = incrementQuestionsSolved(2);
    expect(data.solved).toBe(12);
    expect(data.streak).toBe(1);
  });

  it('decrements and resets solved count correctly', () => {
    incrementQuestionsSolved(10);
    let data = decrementQuestionsSolved(3);
    expect(data.solved).toBe(7);

    data = decrementQuestionsSolved(20);
    expect(data.solved).toBe(0);

    incrementQuestionsSolved(5);
    data = resetTodaySolved();
    expect(data.solved).toBe(0);
  });

  it('preserves streak from yesterday on date transition', () => {
    const yesterday = getYesterdayDateString();
    localStorage.setItem(
      'ugurhoca_daily_goal_v1',
      JSON.stringify({
        target: 20,
        date: yesterday,
        solved: 25,
        streak: 3,
        lastCompletedDate: yesterday,
        history: { [yesterday]: 25 },
      }),
    );

    const data = getDailyGoal();
    expect(data.date).toBe(getLocalDateString());
    expect(data.solved).toBe(0);
    expect(data.streak).toBe(3);
    expect(data.lastCompletedDate).toBe(yesterday);

    // Completing today increases streak to 4
    const after = incrementQuestionsSolved(20);
    expect(after.streak).toBe(4);
  });

  it('dispatches ugurhoca:daily-goal-updated custom event', () => {
    const listener = vi.fn();
    window.addEventListener('ugurhoca:daily-goal-updated', listener);

    incrementQuestionsSolved(1);
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener('ugurhoca:daily-goal-updated', listener);
  });
});
