export interface DailyQuestStatus {
  challengeDone: boolean; // 1. Kademe: Günün sorusu çözüldü (10 XP)
  targetProgressDone: boolean; // 2. Kademe: En az 15 soru çözüldü (25 XP)
  reviewDone: boolean; // 3. Kademe: Formül kartı veya hata defteri çalışıldı (15 XP)
}

export interface DailyGoalData {
  target: number;
  date: string; // YYYY-MM-DD
  solved: number;
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  history: Record<string, number>; // date -> count
  freezeTokens: number; // Seri Kalkanı sayısı (0-2)
  lastFreezeUsedDate?: string; // En son kalkanın devreye girdiği tarih
  previousStreakBeforeReset?: number; // Telafi edilebilecek önceki seri
  dailyQuests?: DailyQuestStatus;
}

const STORAGE_KEY = 'ugurhoca_daily_goal_v1';
const DEFAULT_TARGET = 20;
const DEFAULT_FREEZE_TOKENS = 1;

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
};

const notifyUpdate = (data: DailyGoalData) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<DailyGoalData>('ugurhoca:daily-goal-updated', { detail: data }),
    );
  }
};

export const getDailyGoal = (): DailyGoalData => {
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  const fallback: DailyGoalData = {
    target: DEFAULT_TARGET,
    date: today,
    solved: 0,
    streak: 0,
    history: {},
    freezeTokens: DEFAULT_FREEZE_TOKENS,
    dailyQuests: {
      challengeDone: false,
      targetProgressDone: false,
      reviewDone: false,
    },
  };

  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return fallback;
    }

    const data = parsed as Partial<DailyGoalData>;
    const target = typeof data.target === 'number' && data.target > 0 ? data.target : DEFAULT_TARGET;
    let streak = typeof data.streak === 'number' ? data.streak : 0;
    const history = data.history && typeof data.history === 'object' ? data.history : {};
    const lastCompleted = data.lastCompletedDate;
    let freezeTokens =
      typeof data.freezeTokens === 'number' && !isNaN(data.freezeTokens)
        ? Math.max(0, Math.min(2, Math.floor(data.freezeTokens)))
        : DEFAULT_FREEZE_TOKENS;
    let lastFreezeUsedDate = data.lastFreezeUsedDate;
    let previousStreak =
      typeof data.previousStreakBeforeReset === 'number' ? data.previousStreakBeforeReset : 0;

    // Check date transition
    if (data.date !== today) {
      // If it's a new day:
      // Did we complete the goal yesterday?
      if (lastCompleted !== yesterday && lastCompleted !== today) {
        // Can streak freeze protect the streak?
        if (freezeTokens > 0 && streak > 0 && lastFreezeUsedDate !== yesterday) {
          freezeTokens -= 1;
          lastFreezeUsedDate = yesterday;
          // Streak is preserved!
        } else {
          // Streak broken
          if (streak > 0) {
            previousStreak = streak;
          }
          streak = 0;
        }
      }
      const updated: DailyGoalData = {
        target,
        date: today,
        solved: 0,
        streak,
        lastCompletedDate: lastCompleted,
        history,
        freezeTokens,
        lastFreezeUsedDate,
        previousStreakBeforeReset: previousStreak,
        dailyQuests: {
          challengeDone: false,
          targetProgressDone: false,
          reviewDone: false,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }

    const solvedCount = typeof data.solved === 'number' ? data.solved : 0;

    return {
      target,
      date: today,
      solved: solvedCount,
      streak,
      lastCompletedDate: lastCompleted,
      history,
      freezeTokens,
      lastFreezeUsedDate,
      previousStreakBeforeReset: previousStreak,
      dailyQuests: {
        challengeDone: Boolean(data.dailyQuests?.challengeDone),
        targetProgressDone: solvedCount >= 15,
        reviewDone: Boolean(data.dailyQuests?.reviewDone),
      },
    };
  } catch {
    return fallback;
  }
};

export const setDailyTarget = (target: number): DailyGoalData => {
  const current = getDailyGoal();
  const validTarget = Math.max(5, Math.min(500, Math.round(target)));
  const updated: DailyGoalData = {
    ...current,
    target: validTarget,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyUpdate(updated);
    } catch {
      // Ignore quota errors
    }
  }

  return updated;
};

export const incrementQuestionsSolved = (amount: number = 1): DailyGoalData => {
  const current = getDailyGoal();
  const safeAmount = Math.max(0, Math.round(amount));
  const newSolved = current.solved + safeAmount;
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  let streak = current.streak;
  let lastCompleted = current.lastCompletedDate;
  let freezeTokens = current.freezeTokens;

  // Check if target reached today
  if (newSolved >= current.target && lastCompleted !== today) {
    if (lastCompleted === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
    lastCompleted = today;

    // 7 günlük düzenli çalışma serisinde 1 ek Seri Kalkanı kazanılır (en fazla 2)
    if (streak > 0 && streak % 7 === 0 && freezeTokens < 2) {
      freezeTokens = Math.min(2, freezeTokens + 1);
    }
  }

  const updatedHistory = {
    ...current.history,
    [today]: newSolved,
  };

  // Keep only last 30 days of history
  const keys = Object.keys(updatedHistory).sort();
  if (keys.length > 30) {
    const toRemove = keys.slice(0, keys.length - 30);
    for (const k of toRemove) {
      delete updatedHistory[k];
    }
  }

  const currentQuests = current.dailyQuests || {
    challengeDone: false,
    targetProgressDone: current.solved >= 15,
    reviewDone: false,
  };
  const updatedQuests: DailyQuestStatus = {
    ...currentQuests,
    targetProgressDone: newSolved >= 15,
  };

  const wasAllQuestsDone =
    currentQuests.challengeDone && currentQuests.targetProgressDone && currentQuests.reviewDone;
  const isNowAllQuestsDone =
    updatedQuests.challengeDone && updatedQuests.targetProgressDone && updatedQuests.reviewDone;
  if (!wasAllQuestsDone && isNowAllQuestsDone && freezeTokens < 2) {
    freezeTokens = Math.min(2, freezeTokens + 1);
  }

  const updated: DailyGoalData = {
    ...current,
    solved: newSolved,
    streak,
    freezeTokens,
    lastCompletedDate: lastCompleted,
    history: updatedHistory,
    dailyQuests: updatedQuests,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyUpdate(updated);
    } catch {
      // Ignore quota errors
    }
  }

  return updated;
};

export const decrementQuestionsSolved = (amount: number = 1): DailyGoalData => {
  const current = getDailyGoal();
  const safeAmount = Math.max(0, Math.round(amount));
  const newSolved = Math.max(0, current.solved - safeAmount);
  const today = getLocalDateString();

  const updatedHistory = {
    ...current.history,
    [today]: newSolved,
  };

  const updated: DailyGoalData = {
    ...current,
    solved: newSolved,
    history: updatedHistory,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyUpdate(updated);
    } catch {
      // Ignore quota errors
    }
  }

  return updated;
};

export const resetTodaySolved = (): DailyGoalData => {
  const current = getDailyGoal();
  const today = getLocalDateString();
  const updated: DailyGoalData = {
    ...current,
    solved: 0,
    history: {
      ...current.history,
      [today]: 0,
    },
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyUpdate(updated);
    } catch {
      // Ignore quota errors
    }
  }

  return updated;
};

export const grantFreezeToken = (amount: number = 1): DailyGoalData => {
  const current = getDailyGoal();
  const nextTokens = Math.min(2, (current.freezeTokens || 0) + Math.max(0, amount));
  const updated: DailyGoalData = {
    ...current,
    freezeTokens: nextTokens,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyUpdate(updated);
    } catch {
      // Ignore quota errors
    }
  }

  return updated;
};

export const repairStreak = (): DailyGoalData => {
  const current = getDailyGoal();
  const prev = current.previousStreakBeforeReset || 0;
  if (prev > 0 && current.streak === 0) {
    const today = getLocalDateString();
    const updated: DailyGoalData = {
      ...current,
      streak: prev + 1,
      previousStreakBeforeReset: 0,
      lastCompletedDate: today,
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        notifyUpdate(updated);
      } catch {
        // Ignore quota errors
      }
    }

    return updated;
  }

  return current;
};

export const activateFreezeTokenForToday = (): DailyGoalData => {
  const current = getDailyGoal();
  if ((current.freezeTokens || 0) > 0) {
    const today = getLocalDateString();
    const updated: DailyGoalData = {
      ...current,
      freezeTokens: Math.max(0, (current.freezeTokens || 0) - 1),
      lastFreezeUsedDate: today,
      lastCompletedDate: today,
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        notifyUpdate(updated);
      } catch {
        // Ignore quota errors
      }
    }

    return updated;
  }

  return current;
};

export const getDailyQuestStatus = (data?: DailyGoalData): DailyQuestStatus => {
  const current = data || getDailyGoal();
  return {
    challengeDone: Boolean(current.dailyQuests?.challengeDone),
    targetProgressDone: current.solved >= 15,
    reviewDone: Boolean(current.dailyQuests?.reviewDone),
  };
};

export const markDailyQuest = (
  questType: 'challenge' | 'review',
  status: boolean = true,
): DailyGoalData => {
  const current = getDailyGoal();
  const currentQuests = getDailyQuestStatus(current);
  const updatedQuests: DailyQuestStatus = {
    ...currentQuests,
    ...(questType === 'challenge' ? { challengeDone: status } : { reviewDone: status }),
    targetProgressDone: current.solved >= 15,
  };

  let freezeTokens = current.freezeTokens;
  const wasAllCompleted =
    currentQuests.challengeDone && currentQuests.targetProgressDone && currentQuests.reviewDone;
  const isNowAllCompleted =
    updatedQuests.challengeDone && updatedQuests.targetProgressDone && updatedQuests.reviewDone;
  if (!wasAllCompleted && isNowAllCompleted && freezeTokens < 2) {
    freezeTokens = Math.min(2, freezeTokens + 1);
  }

  const updated: DailyGoalData = {
    ...current,
    freezeTokens,
    dailyQuests: updatedQuests,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyUpdate(updated);
    } catch {
      // Ignore quota errors
    }
  }

  return updated;
};
