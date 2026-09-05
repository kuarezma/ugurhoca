export interface DailyGoalData {
  target: number;
  date: string; // YYYY-MM-DD
  solved: number;
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  history: Record<string, number>; // date -> count
}

const STORAGE_KEY = 'ugurhoca_daily_goal_v1';
const DEFAULT_TARGET = 20;

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

    // Check date transition
    if (data.date !== today) {
      // If it's a new day:
      // Did we complete the goal yesterday?
      if (lastCompleted !== yesterday && lastCompleted !== today) {
        // Streak broken
        streak = 0;
      }
      const updated: DailyGoalData = {
        target,
        date: today,
        solved: 0,
        streak,
        lastCompletedDate: lastCompleted,
        history,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }

    return {
      target,
      date: today,
      solved: typeof data.solved === 'number' ? data.solved : 0,
      streak,
      lastCompletedDate: lastCompleted,
      history,
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

  // Check if target reached today
  if (newSolved >= current.target && lastCompleted !== today) {
    if (lastCompleted === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
    lastCompleted = today;
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

  const updated: DailyGoalData = {
    ...current,
    solved: newSolved,
    streak,
    lastCompletedDate: lastCompleted,
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
