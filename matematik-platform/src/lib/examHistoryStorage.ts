export type ExamHistoryType = 'lgs' | 'yks';

export type SavedExamTrial = {
  id: string;
  examType: ExamHistoryType;
  title: string;
  date: string; // YYYY-MM-DD
  score: number;
  mathNet: number;
  totalNet: number;
  note?: string;
  details?: {
    correctCount?: number;
    wrongCount?: number;
    subNets?: Record<string, number>;
  };
};

const STORAGE_KEY = 'ugurhoca_exam_trials_history_v1';
const MAX_TRIALS = 50;

export const getSavedExamTrials = (filterType?: ExamHistoryType): SavedExamTrial[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter(
        (item): item is SavedExamTrial =>
          Boolean(
            item &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              (item.examType === 'lgs' || item.examType === 'yks') &&
              typeof item.score === 'number' &&
              typeof item.mathNet === 'number' &&
              typeof item.totalNet === 'number',
          ),
      );
      if (filterType) {
        return valid.filter((t) => t.examType === filterType);
      }
      return valid;
    }
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch {
    return [];
  }
};

export const saveExamTrial = (
  trial: Omit<SavedExamTrial, 'id' | 'date'> & { id?: string; date?: string },
): SavedExamTrial => {
  const existing = getSavedExamTrials();
  const today = new Date().toISOString().split('T')[0];

  const newTrial: SavedExamTrial = {
    id: trial.id || 'trial_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    date: trial.date || today,
    examType: trial.examType,
    title: trial.title.trim() || `${trial.examType.toUpperCase()} Deneme #${existing.filter((e) => e.examType === trial.examType).length + 1}`,
    score: Number(trial.score.toFixed(2)),
    mathNet: Number(trial.mathNet.toFixed(2)),
    totalNet: Number(trial.totalNet.toFixed(2)),
    note: trial.note?.trim(),
    details: trial.details,
  };

  const updated = [newTrial, ...existing].slice(0, MAX_TRIALS);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('ugurhoca:exam-trials-updated'));
    } catch {
      // Quota koruması
    }
  }

  return newTrial;
};

export const deleteExamTrial = (id: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedExamTrials();
    const updated = existing.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ugurhoca:exam-trials-updated'));
  } catch {
    // sessizce geç
  }
};

export const clearAllExamTrials = (examType?: ExamHistoryType): void => {
  if (typeof window === 'undefined') return;
  try {
    if (!examType) {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('ugurhoca:exam-trials-updated'));
      return;
    }
    const existing = getSavedExamTrials();
    const remaining = existing.filter((t) => t.examType !== examType);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent('ugurhoca:exam-trials-updated'));
  } catch {
    // sessizce geç
  }
};
