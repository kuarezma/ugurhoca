'use client';

export type StudentQuestionDifficulty = 'Kolay' | 'Orta' | 'Zor';
export type StudentQuestionStatus = 'pending' | 'projected' | 'resolved';

export interface StudentSubmittedQuestion {
  id: string;
  student_name: string;
  lesson_id?: string;
  topic: string;
  difficulty: StudentQuestionDifficulty;
  question_text: string;
  image_url?: string | null;
  created_at: string;
  status: StudentQuestionStatus;
}

const STORAGE_KEY = 'ugur_hoca_live_questions_pool_v1';
const MAX_QUESTIONS = 50;

const notifyUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ugurhoca:student-questions-updated'));
  }
};

export const getStudentQuestions = (
  lessonId?: string,
): StudentSubmittedQuestion[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter((q): q is StudentSubmittedQuestion =>
        Boolean(q && typeof q === 'object' && q.id && q.question_text),
      );
      if (lessonId) {
        return valid.filter((q) => !q.lesson_id || q.lesson_id === lessonId);
      }
      return valid;
    }
    // Bozuk veri varsa temizle ve kendini onar
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch {
    return [];
  }
};

export const submitStudentQuestion = (
  input: Omit<StudentSubmittedQuestion, 'id' | 'created_at' | 'status'>,
): StudentSubmittedQuestion => {
  const newQuestion: StudentSubmittedQuestion = {
    ...input,
    id: `sq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
    status: 'pending',
  };

  if (typeof window !== 'undefined') {
    try {
      const current = getStudentQuestions();
      const updated = [newQuestion, ...current].slice(0, MAX_QUESTIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyUpdate();
    } catch {
      // ignore storage quota
    }
  }

  return newQuestion;
};

export const updateStudentQuestionStatus = (
  id: string,
  status: StudentQuestionStatus,
): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const current = getStudentQuestions();
    const updated = current.map((q) => (q.id === id ? { ...q, status } : q));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyUpdate();
    return true;
  } catch {
    return false;
  }
};

export const deleteStudentQuestion = (id: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const current = getStudentQuestions();
    const updated = current.filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyUpdate();
    return true;
  } catch {
    return false;
  }
};

/* --- Sunucu API Senkronizasyon Yardımcıları --- */

export async function fetchQuestionsFromServer(
  lessonId?: string,
): Promise<StudentSubmittedQuestion[]> {
  try {
    const query = lessonId ? `?lessonId=${encodeURIComponent(lessonId)}` : '';
    const res = await fetch(`/api/live-lessons/questions${query}`);
    if (!res.ok) return [];
    const json = await res.json();
    const serverQuestions: StudentSubmittedQuestion[] = json.questions || [];

    if (typeof window !== 'undefined' && serverQuestions.length > 0) {
      // Yerel localStorage ile birleştir
      const local = getStudentQuestions();
      const serverIds = new Set(serverQuestions.map((q) => q.id));
      const combined = [
        ...serverQuestions,
        ...local.filter((l) => !serverIds.has(l.id)),
      ].slice(0, MAX_QUESTIONS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
      } catch {
        // ignore quota
      }
    }
    return serverQuestions;
  } catch {
    return [];
  }
}

export async function syncSubmitQuestionToServer(
  input: Omit<StudentSubmittedQuestion, 'id' | 'created_at' | 'status'>,
): Promise<StudentSubmittedQuestion | null> {
  try {
    const res = await fetch('/api/live-lessons/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.question || null;
  } catch {
    return null;
  }
}

export async function syncUpdateQuestionStatusToServer(
  id: string,
  status: StudentQuestionStatus,
): Promise<boolean> {
  try {
    const res = await fetch('/api/live-lessons/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
