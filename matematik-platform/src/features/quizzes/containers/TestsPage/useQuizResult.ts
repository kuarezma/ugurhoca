import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useEffect, useCallback, startTransition } from 'react';

import { useToast } from '@/components/Toast';
import { fireConfetti } from '@/components/ConfettiBurst';
import {
  saveMistakesToBank,
  markMistakeMastered,
} from '@/features/quizzes/lib/mistakeStorage';
import { syncMistakesWithCloud } from '@/features/quizzes/lib/mistakeSync';
import {
  clearQuizDraft,
  type QuizDraft,
} from '@/features/quizzes/lib/quizDraftStorage';
import { userScopedStorage } from '@/lib/userScopedStorage';
import { incrementQuestionsSolved } from '@/lib/dailyGoalStorage';
import { supabase } from '@/lib/supabase/client';
import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import { Quiz, QuizQuestion } from '@/types/quiz';
import type { AppUser } from '@/types';
import { evaluateShortAnswer } from '@/features/quizzes/utils/answerEvaluation';
import { log } from './helpers';

type UseQuizResultProps = {
  quizQuestions: QuizQuestion[];
  answers: { [key: number]: number };
  resultSavedRef: RefObject<boolean>;
  selectedQuiz: Quiz | null;
  user: AppUser | null;
  setActiveDraft: Dispatch<SetStateAction<QuizDraft | null>>;
  startTime: number | null;
  showToast: ReturnType<typeof useToast>['showToast'];
  setShowResult: Dispatch<SetStateAction<boolean>>;
  quizStarted: boolean;
  showResult: boolean;
  timeLeft: number | null;
  setTimeLeft: Dispatch<SetStateAction<number | null>>;
  setQuestionElapsedSeconds: Dispatch<SetStateAction<number>>;
  setQuestionTimes: Dispatch<SetStateAction<Record<number, number>>>;
  currentQuestion: number;
  textAnswers?: Record<number, string>;
  rubricEvaluations?: Record<number, number[]>;
};

export function useQuizResult({
  quizQuestions,
  answers,
  resultSavedRef,
  selectedQuiz,
  user,
  setActiveDraft,
  startTime,
  showToast,
  setShowResult,
  quizStarted,
  showResult,
  timeLeft,
  setTimeLeft,
  setQuestionElapsedSeconds,
  setQuestionTimes,
  currentQuestion,
  textAnswers = {},
  rubricEvaluations = {},
}: UseQuizResultProps) {
  const isQuestionCorrect = useCallback(
    (q: QuizQuestion, i: number) => {
      const type = q.question_type || 'multiple_choice';
      if (type === 'short_answer') {
        const text = textAnswers[i] ?? '';
        return evaluateShortAnswer(text, q.expected_answer ?? '');
      }
      if (type === 'open_ended') {
        const checked = rubricEvaluations[i] ?? [];
        const total = q.rubric?.length ?? 0;
        if (total > 0) return checked.length === total;
        return (textAnswers[i] ?? '').trim().length > 0;
      }
      return answers[i] === q.correct_index;
    },
    [answers, textAnswers, rubricEvaluations],
  );

  const calculateScore = useCallback(() => {
    if (quizQuestions.length === 0) return 0;
    let correct = 0;
    quizQuestions.forEach((q, i: number) => {
      const type = q.question_type || 'multiple_choice';
      if (type === 'open_ended') {
        const checked = rubricEvaluations[i] ?? [];
        const total = q.rubric?.length ?? 0;
        if (total > 0) {
          correct += checked.length / total;
        } else if ((textAnswers[i] ?? '').trim().length > 0) {
          correct += 1;
        }
      } else if (isQuestionCorrect(q, i)) {
        correct++;
      }
    });
    return Math.round((correct / quizQuestions.length) * 100);
  }, [quizQuestions, isQuestionCorrect, rubricEvaluations, textAnswers]);

  const saveQuizResult = useCallback(async () => {
    // Kilit yerel sayaçları, hata defterini ve uzak kaydı birlikte korur.
    if (resultSavedRef.current) return;
    resultSavedRef.current = true;
    if (selectedQuiz) {
      clearQuizDraft(selectedQuiz.id, user?.id ?? null);
      setActiveDraft(null);
    }
    // Hata defterine yanlışları otomatik ekle, doğru çözülenleri öğrenildi işaretle
    const mistakes = quizQuestions.filter((q, i) => {
      const answered =
        answers[i] !== undefined ||
        (textAnswers[i] !== undefined && textAnswers[i].trim().length > 0);
      return answered && !isQuestionCorrect(q, i);
    });

    if (mistakes.length > 0) {
      const userAnswersMap: Record<string, number> = {};
      quizQuestions.forEach((q, i) => {
        if (answers[i] !== undefined) {
          userAnswersMap[q.id] = answers[i];
        } else if (textAnswers[i] !== undefined) {
          userAnswersMap[q.id] = isQuestionCorrect(q, i) ? 1 : 0;
        }
      });
      saveMistakesToBank(
        mistakes,
        selectedQuiz?.title,
        userAnswersMap,
        user?.id ?? null,
      );
    }
    const corrects = quizQuestions.filter((q, i) => isQuestionCorrect(q, i));
    for (const c of corrects) {
      markMistakeMastered(c.question, true, user?.id ?? null);
    }
    if (user?.id) {
      void syncMistakesWithCloud(user.id);
    }
    incrementQuestionsSolved(quizQuestions.length, user?.id ?? null);

    if (!user || !selectedQuiz || !startTime) return;
    const score = calculateScore();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    try {
      const { error: saveError } = await supabase.from('quiz_results').insert([
        {
          user_id: user.id,
          quiz_id: selectedQuiz.id,
          score,
          total_questions: quizQuestions.length,
          answers,
          time_spent: timeSpent,
        },
      ]);
      if (saveError) throw saveError;
      try {
        clearQuizDraft(selectedQuiz.id, user?.id ?? null);
        sessionStorage.removeItem(`ugurhoca_active_quiz_${selectedQuiz.id}`);
        setActiveDraft(null);
      } catch {
        // ignore
      }
      void trackStudentActivityEvent({
        entityId: selectedQuiz.id,
        entityType: 'quiz',
        eventType: 'quiz_completed',
        metadata: {
          difficulty: selectedQuiz.difficulty,
          grade: selectedQuiz.grade,
          question_count: quizQuestions.length,
          score,
          time_spent: timeSpent,
          title: selectedQuiz.title,
        },
        userId: user.id,
      });
    } catch (err) {
      log.error('Sonuç kaydedilirken hata', err);
      try {
        const storage = userScopedStorage(user.id);
        const raw = storage.getItem('ugurhoca_pending_quiz_results') || '[]';
        const parsed = JSON.parse(raw);
        const pending = Array.isArray(parsed) ? parsed : [];
        pending.push({
          user_id: user.id,
          quiz_id: selectedQuiz.id,
          score,
          total_questions: quizQuestions.length,
          answers,
          time_spent: timeSpent,
        });
        const queued = storage.setItem(
          'ugurhoca_pending_quiz_results',
          JSON.stringify(pending),
        );
        if (queued)
          showToast(
            'info',
            'Sonucunuz yerel hafızaya kaydedildi. İnternet bağlandığında otomatik kaydedilecek.',
          );
      } catch {
        // ignore
      }
      // Yerel yan etkiler zaten işlendi; ağ hatası kilidi yeniden açmaz.
    }
  }, [
    answers,
    calculateScore,
    isQuestionCorrect,
    quizQuestions,
    resultSavedRef,
    selectedQuiz,
    setActiveDraft,
    showToast,
    startTime,
    textAnswers,
    user,
  ]);

  const handleFinishQuiz = useCallback(() => {
    startTransition(() => setShowResult(true));
    saveQuizResult();
  }, [saveQuizResult, setShowResult]);

  useEffect(() => {
    if (quizStarted && !showResult && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
        setQuestionElapsedSeconds((prev) => prev + 1);
        setQuestionTimes((prev) => ({
          ...prev,
          [currentQuestion]: (prev[currentQuestion] || 0) + 1,
        }));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && quizStarted && !showResult) {
      startTransition(() => setShowResult(true));
      saveQuizResult();
    }
  }, [
    currentQuestion,
    quizStarted,
    saveQuizResult,
    setQuestionElapsedSeconds,
    setQuestionTimes,
    setShowResult,
    setTimeLeft,
    showResult,
    timeLeft,
  ]);

  useEffect(() => {
    if (showResult && quizQuestions.length > 0) {
      const finalScore = calculateScore();
      if (finalScore >= 80) {
        void fireConfetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  }, [calculateScore, quizQuestions.length, showResult]);
  return { calculateScore, saveQuizResult, handleFinishQuiz };
}
