export interface QuizDraft {
  quizId: string;
  quizTitle: string;
  currentQuestion: number;
  answers: Record<number, number>;
  flaggedQuestions: number[];
  questionTimes: Record<number, number>;
  startTime: number;
  timeLeft: number;
  savedAt: number;
}

const DRAFT_PREFIX = 'ugurhoca_quiz_draft_';
const ACTIVE_DRAFT_KEY = 'ugurhoca_active_draft_quiz_id';
const MAX_DRAFT_AGE_MS = 24 * 60 * 60 * 1000; // 24 saat sonra zaman aşımı

/**
 * Anlık test çözme durumunu yerel depolamaya kaydeder.
 */
export const saveQuizDraft = (draft: Omit<QuizDraft, 'savedAt'>): void => {
  if (typeof window === 'undefined') return;
  try {
    const payload: QuizDraft = {
      ...draft,
      savedAt: Date.now(),
    };
    localStorage.setItem(`${DRAFT_PREFIX}${draft.quizId}`, JSON.stringify(payload));
    localStorage.setItem(ACTIVE_DRAFT_KEY, draft.quizId);
  } catch {
    // Kota aşımı veya gizli sekme hatası yutulur
  }
};

/**
 * Belirli bir quiz için kaydedilmiş taslağı getirir.
 * Sayfa kapalıyken geçen süreyi kalan süreden otomatik olarak düşer.
 */
export const getQuizDraft = (quizId: string): QuizDraft | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${quizId}`);
    if (!raw) return null;

    const draft = JSON.parse(raw) as QuizDraft;
    if (!draft || draft.quizId !== quizId) return null;

    const now = Date.now();
    // 24 saatten eskiyse temizle
    if (now - draft.savedAt > MAX_DRAFT_AGE_MS) {
      clearQuizDraft(quizId);
      return null;
    }

    // Sayfa kapalıyken geçen süreyi hesapla ve kalan süreden düş
    const elapsedSinceSave = Math.floor((now - draft.savedAt) / 1000);
    const adjustedTimeLeft = Math.max(0, draft.timeLeft - elapsedSinceSave);

    return {
      ...draft,
      timeLeft: adjustedTimeLeft,
    };
  } catch {
    return null;
  }
};

/**
 * Tamamlanan veya iptal edilen sınavın taslağını temizler.
 */
export const clearQuizDraft = (quizId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${quizId}`);
    const active = localStorage.getItem(ACTIVE_DRAFT_KEY);
    if (active === quizId) {
      localStorage.removeItem(ACTIVE_DRAFT_KEY);
    }
  } catch {
    // ignore
  }
};

/**
 * Kullanıcının devam edebileceği en son aktif sınav taslağını bulur.
 */
export const getActiveQuizDraft = (): QuizDraft | null => {
  if (typeof window === 'undefined') return null;
  try {
    const activeQuizId = localStorage.getItem(ACTIVE_DRAFT_KEY);
    if (!activeQuizId) return null;
    return getQuizDraft(activeQuizId);
  } catch {
    return null;
  }
};
