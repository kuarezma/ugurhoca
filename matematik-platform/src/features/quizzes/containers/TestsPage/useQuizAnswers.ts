import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useMemo, startTransition } from 'react';

import { useToast } from '@/components/Toast';
import { getSavedMistakes } from '@/features/quizzes/lib/mistakeStorage';

import { Quiz, QuizQuestion } from '@/types/quiz';
import type { AppUser } from '@/types';

type UseQuizAnswersProps = {
  currentQuestion: number;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  setAnswers: Dispatch<SetStateAction<{ [key: number]: number }>>;
  quizQuestions: QuizQuestion[];
  setFlaggedQuestions: Dispatch<SetStateAction<Set<number>>>;
  setCurrentQuestion: Dispatch<SetStateAction<number>>;
  answers: { [key: number]: number };
  selectedQuiz: Quiz | null;
  setSelectedQuiz: Dispatch<SetStateAction<Quiz | null>>;
  setQuizQuestions: Dispatch<SetStateAction<QuizQuestion[]>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
  setQuizStarted: Dispatch<SetStateAction<boolean>>;
  setStartTime: Dispatch<SetStateAction<number | null>>;
  setTimeLeft: Dispatch<SetStateAction<number | null>>;
  resultSavedRef: RefObject<boolean>;
  showToast: ReturnType<typeof useToast>['showToast'];
  user: AppUser | null;
};

export function useQuizAnswers({
  currentQuestion,
  setSelectedAnswer,
  setAnswers,
  quizQuestions,
  setFlaggedQuestions,
  setCurrentQuestion,
  answers,
  selectedQuiz,
  setSelectedQuiz,
  setQuizQuestions,
  setShowResult,
  setQuizStarted,
  setStartTime,
  setTimeLeft,
  resultSavedRef,
  showToast,
  user,
}: UseQuizAnswersProps) {
  const selectAnswer = (index: number, targetQuestionIndex?: number) => {
    const qIdx =
      targetQuestionIndex !== undefined ? targetQuestionIndex : currentQuestion;
    if (qIdx === currentQuestion) {
      setSelectedAnswer(index);
    }
    setAnswers((prev) => ({ ...prev, [qIdx]: index }));
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // ignore
      }
    }
  };

  const clearAnswer = (targetQuestionIndex?: number) => {
    const qIdx =
      targetQuestionIndex !== undefined ? targetQuestionIndex : currentQuestion;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qIdx];
      return copy;
    });
    if (qIdx === currentQuestion) {
      setSelectedAnswer(null);
    }
  };

  const maxOptionsCount = useMemo(() => {
    if (!quizQuestions || quizQuestions.length === 0) return 4;
    return Math.max(...quizQuestions.map((q) => q.options?.length || 4), 4);
  }, [quizQuestions]);

  const toggleFlagQuestion = (index: number) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const jumpToQuestion = (index: number) => {
    if (index >= 0 && index < quizQuestions.length) {
      setCurrentQuestion(index);
      setSelectedAnswer(answers[index] !== undefined ? answers[index] : null);
    }
  };

  const handleStartRetakeMistakes = (mistakeQuestions: QuizQuestion[]) => {
    if (mistakeQuestions.length === 0) return;
    if (!selectedQuiz) {
      setSelectedQuiz({
        id: 'adaptive-recovery-quiz',
        title: 'Akıllı Telafi & Pekiştirme Testi',
        description:
          'Hata defterindeki zayıf kazanımlara özel derlenmiş kişiselleştirilmiş test.',
        difficulty: 'orta',
        duration_minutes: Math.ceil((mistakeQuestions.length * 90) / 60),
        question_count: mistakeQuestions.length,
        created_at: new Date().toISOString(),
      } as unknown as Quiz);
    }
    setQuizQuestions(mistakeQuestions);
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowResult(false);
    startTransition(() => setQuizStarted(true));
    setStartTime(Date.now());
    setTimeLeft(mistakeQuestions.length * 90);
    setFlaggedQuestions(new Set());
    resultSavedRef.current = false;
    showToast(
      'info',
      `${mistakeQuestions.length} soruluk telafi testi başladı!`,
    );
  };

  const handleStartOfflineQuiz = (
    pkg: import('@/features/quizzes/lib/offlineQuizPackageStorage').OfflineQuizPackage,
  ) => {
    if (!pkg.questions || pkg.questions.length === 0) return;
    setSelectedQuiz({
      id: pkg.id,
      title: pkg.title,
      description: 'Cihaza indirilmiş çevrimdışı çalışma soru seti.',
      difficulty: 'orta',
      duration_minutes: Math.ceil((pkg.questions.length * 90) / 60),
      question_count: pkg.questions.length,
      created_at: pkg.downloadedAt,
    } as unknown as Quiz);
    setQuizQuestions(pkg.questions);
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowResult(false);
    startTransition(() => setQuizStarted(true));
    setStartTime(Date.now());
    setTimeLeft(pkg.questions.length * 90);
    setFlaggedQuestions(new Set());
    resultSavedRef.current = false;
    showToast('success', `Çevrimdışı test başladı: ${pkg.title}`);
  };

  const handleStartAdaptiveQuiz = (count?: number) => {
    const list = getSavedMistakes(user?.id ?? null);
    const pending = list.filter((m) => !m.mastered);
    if (pending.length === 0) {
      showToast(
        'info',
        'Hata defterinde henüz çözülecek yanlış soru bulunmuyor. Tebrikler!',
      );
      return;
    }
    const sorted = [...pending].sort((a, b) => {
      if (a.reason === 'concept' && b.reason !== 'concept') return -1;
      if (b.reason === 'concept' && a.reason !== 'concept') return 1;
      return 0;
    });
    const questionsToSolve = (count ? sorted.slice(0, count) : sorted).map(
      (m) => m.question,
    );
    handleStartRetakeMistakes(questionsToSolve);
  };
  return {
    selectAnswer,
    clearAnswer,
    maxOptionsCount,
    toggleFlagQuestion,
    jumpToQuestion,
    handleStartRetakeMistakes,
    handleStartOfflineQuiz,
    handleStartAdaptiveQuiz,
  };
}
