import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useEffect, useCallback, startTransition } from 'react';
import { toStoredGrade } from '@/lib/grade';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import {
  getQuizDraft,
  clearQuizDraft,
  type QuizDraft,
} from '@/features/quizzes/lib/quizDraftStorage';
import { getCurrentUserProfile } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/error-utils';
import { supabase } from '@/lib/supabase/client';
import { Quiz, QuizQuestion } from '@/types/quiz';
import type { AppUser } from '@/types';
import { log, normalizeQuizQuestion } from './helpers';

type UseQuizLoadingProps = {
  isHydrated: boolean;
  initialUser: AppUser | null;
  router: ReturnType<typeof useRouter>;
  setUser: Dispatch<SetStateAction<AppUser | null>>;
  user: AppUser | null;
  currentUserKey: string | null;
  initialUserKey: string | null;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setQuizzes: Dispatch<SetStateAction<Quiz[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setQuizQuestions: Dispatch<SetStateAction<QuizQuestion[]>>;
  showToast: ReturnType<typeof useToast>['showToast'];
  quizzes: Quiz[];
  setActiveDraft: Dispatch<SetStateAction<QuizDraft | null>>;
  setSelectedQuiz: Dispatch<SetStateAction<Quiz | null>>;
  setQuizStarted: Dispatch<SetStateAction<boolean>>;
  setCurrentQuestion: Dispatch<SetStateAction<number>>;
  setAnswers: Dispatch<SetStateAction<{ [key: number]: number }>>;
  setSelectedAnswer: Dispatch<SetStateAction<number | null>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
  setStartTime: Dispatch<SetStateAction<number | null>>;
  setTimeLeft: Dispatch<SetStateAction<number | null>>;
  setFlaggedQuestions: Dispatch<SetStateAction<Set<number>>>;
  setQuestionTimes: Dispatch<SetStateAction<Record<number, number>>>;
  resultSavedRef: RefObject<boolean>;
  searchParams: ReadonlyURLSearchParams;
};

export function useQuizLoading({
  isHydrated,
  initialUser,
  router,
  setUser,
  user,
  currentUserKey,
  initialUserKey,
  setLoading,
  setQuizzes,
  setError,
  setQuizQuestions,
  showToast,
  quizzes,
  setActiveDraft,
  setSelectedQuiz,
  setQuizStarted,
  setCurrentQuestion,
  setAnswers,
  setSelectedAnswer,
  setShowResult,
  setStartTime,
  setTimeLeft,
  setFlaggedQuestions,
  setQuestionTimes,
  resultSavedRef,
  searchParams,
}: UseQuizLoadingProps) {
  useEffect(() => {
    if (isHydrated && initialUser) {
      return;
    }

    const checkSession = async () => {
      const result = await getCurrentUserProfile({ router });
      setUser(result?.profile ?? null);
    };
    void checkSession();
  }, [initialUser, isHydrated, router, setUser]);

  useEffect(() => {
    let active = true;
    const loadQuizzes = async () => {
      if (!user) return;
      if (isHydrated && currentUserKey === initialUserKey) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        let query = supabase
          .from('quizzes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!user.isAdmin) {
          query = query.eq('grade', toStoredGrade(user.grade));
        }

        const { data, error: quizError } = await query;

        if (!active) return;
        if (quizError) throw quizError;
        if (data) setQuizzes(data);
      } catch (err) {
        if (!active) return;
        log.error('Testler yüklenirken hata', err);
        setError('Testler yüklenemedi. Lütfen sayfayı yenileyin.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadQuizzes();
    return () => {
      active = false;
    };
  }, [
    currentUserKey,
    initialUserKey,
    isHydrated,
    setError,
    setLoading,
    setQuizzes,
    user,
  ]);

  const loadQuizQuestions = useCallback(
    async (quizId: string) => {
      try {
        const { data, error: qError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('question_order', { ascending: true });

        if (qError) throw qError;
        if (data) {
          if (data.length === 0) {
            throw new Error('Bu teste henüz soru eklenmemiş.');
          }
          setQuizQuestions(
            data.map((item) => normalizeQuizQuestion(item as QuizQuestion)),
          );
          return true;
        }
        return false;
      } catch (err) {
        log.error('Sorular yüklenirken hata', err);
        showToast('error', getErrorMessage(err, 'Sorular yüklenemedi.'));
        return false;
      }
    },
    [setQuizQuestions, showToast],
  );

  const handleResumeDraft = useCallback(
    async (draft: QuizDraft) => {
      const targetQuiz = quizzes.find((q) => q.id === draft.quizId);
      if (!targetQuiz) {
        clearQuizDraft(draft.quizId, user?.id ?? null);
        setActiveDraft(null);
        return;
      }

      const success = await loadQuizQuestions(targetQuiz.id);
      if (!success) return;

      setSelectedQuiz(targetQuiz);
      startTransition(() => setQuizStarted(true));
      setCurrentQuestion(draft.currentQuestion);
      setAnswers(draft.answers || {});
      setSelectedAnswer(draft.answers[draft.currentQuestion] ?? null);
      setShowResult(false);
      setStartTime(draft.startTime || Date.now());
      setTimeLeft(draft.timeLeft);
      setFlaggedQuestions(new Set(draft.flaggedQuestions || []));
      setQuestionTimes(draft.questionTimes || {});
      resultSavedRef.current = false;
      setActiveDraft(null);
      showToast(
        'success',
        `${targetQuiz.title} sınavına kaldığınız yerden devam ediyorsunuz.`,
      );
    },
    [
      loadQuizQuestions,
      quizzes,
      resultSavedRef,
      setActiveDraft,
      setAnswers,
      setCurrentQuestion,
      setFlaggedQuestions,
      setQuestionTimes,
      setQuizStarted,
      setSelectedAnswer,
      setSelectedQuiz,
      setShowResult,
      setStartTime,
      setTimeLeft,
      showToast,
      user?.id,
    ],
  );

  const handleDiscardDraft = useCallback(
    (quizId: string) => {
      clearQuizDraft(quizId, user?.id ?? null);
      setActiveDraft(null);
    },
    [setActiveDraft, user?.id],
  );

  const startQuiz = useCallback(
    async (quiz: Quiz) => {
      const existingDraft = getQuizDraft(quiz.id, user?.id ?? null);
      if (
        existingDraft &&
        (Object.keys(existingDraft.answers).length > 0 ||
          existingDraft.currentQuestion > 0)
      ) {
        await handleResumeDraft(existingDraft);
        return;
      }

      const success = await loadQuizQuestions(quiz.id);
      if (!success) return;

      setSelectedQuiz(quiz);
      startTransition(() => setQuizStarted(true));
      setCurrentQuestion(0);
      setAnswers({});
      setSelectedAnswer(null);
      setShowResult(false);
      setStartTime(Date.now());
      setTimeLeft(quiz.time_limit * 60);
      setFlaggedQuestions(new Set());
      setQuestionTimes({});
      resultSavedRef.current = false;
    },
    [
      handleResumeDraft,
      loadQuizQuestions,
      resultSavedRef,
      setAnswers,
      setCurrentQuestion,
      setFlaggedQuestions,
      setQuestionTimes,
      setQuizStarted,
      setSelectedAnswer,
      setSelectedQuiz,
      setShowResult,
      setStartTime,
      setTimeLeft,
      user?.id,
    ],
  );

  const quizIdParam = searchParams?.get('quizId');
  return {
    loadQuizQuestions,
    handleResumeDraft,
    handleDiscardDraft,
    startQuiz,
    quizIdParam,
  };
}
