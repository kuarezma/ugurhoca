import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useEffect, useCallback } from 'react';

import { useToast } from '@/components/Toast';
import { saveQuizDraft } from '@/features/quizzes/lib/quizDraftStorage';
import { userScopedStorage } from '@/lib/userScopedStorage';
import { supabase } from '@/lib/supabase/client';
import { Quiz } from '@/types/quiz';
import type { AppUser } from '@/types';

type UseQuizOfflineRecoveryProps = {
  user: AppUser | null;
  pendingFlushUsersRef: RefObject<Set<string>>;
  showToast: ReturnType<typeof useToast>['showToast'];
  setIsOnline: Dispatch<SetStateAction<boolean>>;
  quizStarted: boolean;
  showResult: boolean;
  timeLeft: number | null;
  selectedQuiz: Quiz | null;
  answers: { [key: number]: number };
  currentQuestion: number;
  flaggedQuestions: Set<number>;
  questionTimes: Record<number, number>;
  startTime: number | null;
};

export function useQuizOfflineRecovery({
  user,
  pendingFlushUsersRef,
  showToast,
  setIsOnline,
  quizStarted,
  showResult,
  timeLeft,
  selectedQuiz,
  answers,
  currentQuestion,
  flaggedQuestions,
  questionTimes,
  startTime,
}: UseQuizOfflineRecoveryProps) {
  const flushPendingQuizResults = useCallback(async () => {
    const userId = user?.id;
    if (!userId || pendingFlushUsersRef.current.has(userId)) return;
    pendingFlushUsersRef.current.add(userId);
    const storage = userScopedStorage(userId);
    try {
      const raw = storage.getItem('ugurhoca_pending_quiz_results');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      // Eski kuyruk karışmış olabilir: yalnız oturumdaki kullanıcı adına gönder.
      const pending = parsed.filter((result) => result?.user_id === userId);
      if (pending.length === 0) return;

      const { error: insertError } = await supabase
        .from('quiz_results')
        .insert(pending);
      if (!insertError) {
        // İstek sürerken eklenen sonuçları silme; yalnız onaylanan kayıtları çıkar.
        const remaining = JSON.parse(
          storage.getItem('ugurhoca_pending_quiz_results') || '[]',
        );
        if (Array.isArray(remaining)) {
          for (const result of pending) {
            const index = remaining.findIndex(
              (item) => JSON.stringify(item) === JSON.stringify(result),
            );
            if (index >= 0) remaining.splice(index, 1);
          }
          if (remaining.length > 0)
            storage.setItem(
              'ugurhoca_pending_quiz_results',
              JSON.stringify(remaining),
            );
          else storage.removeItem('ugurhoca_pending_quiz_results');
        }
        showToast(
          'success',
          'Çevrimdışıyken tamamlanan test sonuçlarınız senkronize edildi.',
        );
      }
    } catch {
      // ignore
    } finally {
      pendingFlushUsersRef.current.delete(userId);
    }
  }, [pendingFlushUsersRef, showToast, user?.id]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('info', 'İnternet bağlantısı yeniden kuruldu.');
      void flushPendingQuizResults();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast(
        'warning',
        'İnternet bağlantısı koptu. Cevaplarınız yerel olarak güvende.',
      );
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast, flushPendingQuizResults, setIsOnline]);

  // Aktif test durumunu (cevaplar, kalan süre, bayraklar, soru süreleri) anlık güvenceye al
  useEffect(() => {
    if (
      quizStarted &&
      !showResult &&
      timeLeft !== 0 &&
      selectedQuiz &&
      (Object.keys(answers).length > 0 || currentQuestion > 0)
    ) {
      saveQuizDraft(
        {
          quizId: selectedQuiz.id,
          quizTitle: selectedQuiz.title,
          currentQuestion,
          answers,
          flaggedQuestions: Array.from(flaggedQuestions),
          questionTimes,
          startTime: startTime || Date.now(),
          timeLeft: timeLeft ?? selectedQuiz.time_limit * 60,
        },
        user?.id ?? null,
      );
    }
  }, [
    quizStarted,
    showResult,
    user?.id,
    selectedQuiz,
    answers,
    currentQuestion,
    startTime,
    timeLeft,
    flaggedQuestions,
    questionTimes,
  ]);
}
