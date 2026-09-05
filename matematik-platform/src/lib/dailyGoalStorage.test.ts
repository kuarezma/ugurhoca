import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDailyGoal,
  setDailyTarget,
  incrementQuestionsSolved,
  decrementQuestionsSolved,
  resetTodaySolved,
  getLocalDateString,
  getYesterdayDateString,
  grantFreezeToken,
  repairStreak,
  activateFreezeTokenForToday,
  getDailyQuestStatus,
  markDailyQuest,
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

  it('uses streak freeze token when a day is missed to protect streak', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = getLocalDateString(twoDaysAgo);

    // Student had completed goal 2 days ago, missed yesterday, has 1 freeze token
    localStorage.setItem(
      'ugurhoca_daily_goal_v1',
      JSON.stringify({
        target: 20,
        date: twoDaysAgoStr,
        solved: 25,
        streak: 5,
        lastCompletedDate: twoDaysAgoStr,
        history: { [twoDaysAgoStr]: 25 },
        freezeTokens: 1,
      }),
    );

    const data = getDailyGoal();
    expect(data.date).toBe(getLocalDateString());
    // Streak preserved at 5 because freeze token was used!
    expect(data.streak).toBe(5);
    expect(data.freezeTokens).toBe(0);
    expect(data.lastFreezeUsedDate).toBe(getYesterdayDateString());
  });

  it('breaks streak when no freeze tokens remain but saves previous streak for repair', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = getLocalDateString(twoDaysAgo);

    // Student had completed goal 2 days ago, missed yesterday, has 0 freeze tokens
    localStorage.setItem(
      'ugurhoca_daily_goal_v1',
      JSON.stringify({
        target: 20,
        date: twoDaysAgoStr,
        solved: 25,
        streak: 8,
        lastCompletedDate: twoDaysAgoStr,
        history: { [twoDaysAgoStr]: 25 },
        freezeTokens: 0,
      }),
    );

    const data = getDailyGoal();
    expect(data.streak).toBe(0);
    expect(data.previousStreakBeforeReset).toBe(8);

    // Repairing the streak restores it!
    const repaired = repairStreak();
    expect(repaired.streak).toBe(9); // 8 + 1
    expect(repaired.previousStreakBeforeReset).toBe(0);
  });

  it('awards bonus freeze token on 7-day streak milestone', () => {
    setDailyTarget(10);
    localStorage.setItem(
      'ugurhoca_daily_goal_v1',
      JSON.stringify({
        target: 10,
        date: getLocalDateString(),
        solved: 0,
        streak: 6,
        lastCompletedDate: getYesterdayDateString(),
        history: {},
        freezeTokens: 0,
      }),
    );

    const data = incrementQuestionsSolved(10);
    expect(data.streak).toBe(7);
    expect(data.freezeTokens).toBe(1);
  });

  it('grants freeze token and respects maximum limit of 2', () => {
    // Starts with default 1 token
    const initial = getDailyGoal();
    expect(initial.freezeTokens).toBe(1);

    const goal = grantFreezeToken();
    expect(goal.freezeTokens).toBe(2);

    // Should not exceed max limit of 2
    const capped = grantFreezeToken();
    expect(capped.freezeTokens).toBe(2);
  });

  it('activates freeze token for today manually to protect streak on rest day', () => {
    // Start with 1 token and a streak
    localStorage.setItem(
      'ugurhoca_daily_goal_v1',
      JSON.stringify({
        target: 20,
        date: getLocalDateString(),
        solved: 0,
        streak: 5,
        lastCompletedDate: getYesterdayDateString(),
        history: {},
        freezeTokens: 1,
      }),
    );

    const afterFreeze = activateFreezeTokenForToday();
    expect(afterFreeze.freezeTokens).toBe(0);
    expect(afterFreeze.lastFreezeUsedDate).toBe(getLocalDateString());
    expect(afterFreeze.lastCompletedDate).toBe(getLocalDateString());
    expect(afterFreeze.streak).toBe(5);
  });

  it('tracks daily quests (challenge, question target, review) and bonuses', () => {
    let status = getDailyQuestStatus();
    expect(status.challengeDone).toBe(false);
    expect(status.targetProgressDone).toBe(false);
    expect(status.reviewDone).toBe(false);

    // Complete challenge
    let data = markDailyQuest('challenge', true);
    expect(data.dailyQuests?.challengeDone).toBe(true);

    // Solve 15 questions
    data = incrementQuestionsSolved(15);
    expect(data.dailyQuests?.targetProgressDone).toBe(true);

    // Review formulas / mistake notebook
    data = markDailyQuest('review', true);
    expect(data.dailyQuests?.reviewDone).toBe(true);

    status = getDailyQuestStatus(data);
    expect(status.challengeDone).toBe(true);
    expect(status.targetProgressDone).toBe(true);
    expect(status.reviewDone).toBe(true);
  });
});
