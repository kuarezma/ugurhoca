'use client';

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  startTransition,
} from 'react';
import { toStoredGrade } from '@/lib/grade';
import { pickLeagueQuiz } from '@/features/quizzes/lib/pick-league-quiz';

import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { useQuestionSpeech } from '@/features/quizzes/hooks/useQuestionSpeech';
import { useAccessibilitySettings } from '@/hooks/useAccessibilitySettings';
import { getSavedMistakes } from '@/features/quizzes/lib/mistakeStorage';
import {
  clearQuizDraft,
  getActiveQuizDraft,
  type QuizDraft,
} from '@/features/quizzes/lib/quizDraftStorage';
import { Quiz, QuizQuestion } from '@/types/quiz';
import type { AppUser } from '@/types';
import { log, TestsPageProps } from './TestsPage/helpers';
import {
  QuizMistakeReviewModal,
  MistakeNotebookModal,
  LearningOutcomeAnalysisModal,
  QuizResultsView,
} from './TestsPage/lazy';
import { useQuizOfflineRecovery } from './TestsPage/useQuizOfflineRecovery';
import { useQuizLoading } from './TestsPage/useQuizLoading';
import { useQuizAnswers } from './TestsPage/useQuizAnswers';
import { useQuizKeyboard } from './TestsPage/useQuizKeyboard';
import { useQuizResult } from './TestsPage/useQuizResult';
import { ActiveQuizView } from './TestsPage/ActiveQuizView';
import { TestsCatalogView } from './TestsPage/TestsCatalogView';

export default function TestsPage({
  initialQuizzes = [],
  initialUser = null,
  isHydrated = false,
}: TestsPageProps) {
  const [user, setUser] = useState<AppUser | null>(initialUser);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [rubricEvaluations, setRubricEvaluations] = useState<
    Record<number, number[]>
  >({});
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(!isHydrated);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isDrawingOverlayActive, setIsDrawingOverlayActive] = useState(false);
  const questionCardRef = useRef<HTMLDivElement | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [isMistakeModalOpen, setIsMistakeModalOpen] = useState(false);
  const [isMistakeNotebookOpen, setIsMistakeNotebookOpen] = useState(false);
  const [pendingMistakesCount, setPendingMistakesCount] = useState(0);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [isOfflinePackageModalOpen, setIsOfflinePackageModalOpen] =
    useState(false);
  const [isOutcomeAnalysisOpen, setIsOutcomeAnalysisOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isOpticalSheetOpen, setIsOpticalSheetOpen] = useState(false);
  const [isOpticalDocked, setIsOpticalDocked] = useState(false);
  const [isHintLadderOpen, setIsHintLadderOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isLeagueModalOpen, setIsLeagueModalOpen] = useState(false);
  const [isPacingStrategyModalOpen, setIsPacingStrategyModalOpen] =
    useState(false);
  const [confidenceRatings, setConfidenceRatings] = useState<
    Record<number, 'sure' | 'unsure' | 'guess'>
  >({});
  const [isSpotMistakeOpen, setIsSpotMistakeOpen] = useState(false);
  const [isMathLabOpen, setIsMathLabOpen] = useState(false);
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>(
    {},
  );
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState(0);
  const [isDyslexicMode, setIsDyslexicMode] = useState(false);
  const [isSmartboardMode, setIsSmartboardMode] = useState(false);
  const [showSmartboardSolution, setShowSmartboardSolution] = useState(false);
  const [activeDraft, setActiveDraft] = useState<QuizDraft | null>(null);
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);
  const { settings: a11ySettings } = useAccessibilitySettings();

  useEffect(() => {
    if (typeof window !== 'undefined' && !quizStarted) {
      const draft = getActiveQuizDraft(user?.id ?? null);
      setActiveDraft(draft);
    }
  }, [quizStarted, user?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved =
        localStorage.getItem('ugurhoca_dyslexic_mode_v1') === 'true';
      if (saved) setIsDyslexicMode(true);
    }
  }, []);

  const toggleDyslexicMode = useCallback(() => {
    setIsDyslexicMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ugurhoca_dyslexic_mode_v1', String(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const {
    isSpeaking,
    isSupported: isSpeechSupported,
    toggle: toggleSpeech,
    stop: stopSpeech,
  } = useQuestionSpeech();

  useEffect(() => {
    stopSpeech();
  }, [currentQuestion, stopSpeech]);

  useEffect(() => {
    setQuestionElapsedSeconds(0);
  }, [currentQuestion]);

  useEffect(() => {
    try {
      const list = getSavedMistakes(user?.id ?? null);
      setPendingMistakesCount(list.filter((m) => !m.mastered).length);
    } catch {
      // ignore
    }
  }, [isMistakeNotebookOpen, isMistakeModalOpen, quizStarted, user?.id]);
  const resultSavedRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const modeParam =
    searchParams?.get('mode') ||
    (searchParams?.get('mistakes') ? 'mistakes' : null);
  useEffect(() => {
    if (modeParam === 'mistakes') {
      setIsMistakeNotebookOpen(true);
    }
  }, [modeParam]);

  const pendingFlushUsersRef = useRef(new Set<string>());
  useQuizOfflineRecovery({
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
  });
  const profileHref = user?.isAdmin ? '/admin' : '/profil';
  const initialUserKey = useMemo(
    () =>
      initialUser ? `${initialUser.id}:${String(initialUser.grade)}` : null,
    [initialUser],
  );
  const currentUserKey = user ? `${user.id}:${String(user.grade)}` : null;
  const visibleQuizzes = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.isAdmin) {
      return quizzes;
    }

    return quizzes.filter((quiz) => quiz.grade === toStoredGrade(user.grade));
  }, [quizzes, user]);
  const leagueQuiz = pickLeagueQuiz(
    visibleQuizzes,
    user?.isAdmin ? undefined : user?.grade,
  );

  const {
    loadQuizQuestions,
    handleResumeDraft,
    handleDiscardDraft,
    startQuiz,
    quizIdParam,
  } = useQuizLoading({
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
  });
  const topicParam = searchParams?.get('topic');
  const autoStartedQuizRef = useRef(false);

  useEffect(() => {
    if (autoStartedQuizRef.current || quizStarted || quizzes.length === 0)
      return;

    if (quizIdParam) {
      const targetQuiz = quizzes.find((q) => q.id === quizIdParam);
      if (targetQuiz) {
        autoStartedQuizRef.current = true;
        void startQuiz(targetQuiz);
      }
    } else if (topicParam) {
      const targetQuiz = quizzes.find((q) =>
        q.title.toLowerCase().includes(topicParam.toLowerCase()),
      );
      if (targetQuiz) {
        autoStartedQuizRef.current = true;
        void startQuiz(targetQuiz);
      }
    }
  }, [quizIdParam, topicParam, quizzes, quizStarted, startQuiz]);

  const handleOpenWorksheetPreview = useCallback(
    async (quiz: Quiz) => {
      setSelectedQuiz(quiz);
      const success = await loadQuizQuestions(quiz.id);
      if (success) {
        setIsWorksheetModalOpen(true);
      }
    },
    [loadQuizQuestions],
  );

  const {
    selectAnswer,
    clearAnswer,
    maxOptionsCount,
    toggleFlagQuestion,
    jumpToQuestion,
    handleStartRetakeMistakes,
    handleStartOfflineQuiz,
    handleStartAdaptiveQuiz,
  } = useQuizAnswers({
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
  });

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(
        answers[currentQuestion + 1] !== undefined
          ? answers[currentQuestion + 1]
          : null,
      );
    } else {
      startTransition(() => setShowResult(true));
      saveQuizResult();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      const prev = currentQuestion - 1;
      setCurrentQuestion(prev);
      setSelectedAnswer(answers[prev] !== undefined ? answers[prev] : null);
    }
  };

  useQuizKeyboard({
    quizStarted,
    showResult,
    selectedQuiz,
    setIsGlossaryOpen,
    clearAnswer,
    currentQuestion,
    setIsOpticalDocked,
    setIsOpticalSheetOpen,
    setIsHintLadderOpen,
    toggleDyslexicMode,
    quizQuestions,
    selectAnswer,
    isShortcutsOpen,
    isScratchpadOpen,
    isGlossaryOpen,
    nextQuestion,
    previousQuestion,
    setIsDrawingOverlayActive,
    setIsScratchpadOpen,
    toggleFlagQuestion,
    setIsShortcutsOpen,
    isOpticalSheetOpen,
    isOpticalDocked,
    answers,
  });

  const { calculateScore, saveQuizResult, handleFinishQuiz } = useQuizResult({
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
    textAnswers,
    rubricEvaluations,
  });

  const resetQuiz = () => {
    if (selectedQuiz) {
      clearQuizDraft(selectedQuiz.id, user?.id ?? null);
    }
    setActiveDraft(null);
    setSelectedQuiz(null);
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setTextAnswers({});
    setRubricEvaluations({});
    setSelectedAnswer(null);
    setShowResult(false);
    setStartTime(null);
    setTimeLeft(null);
    setFlaggedQuestions(new Set());
    setIsFocusMode(false);
    setIsScratchpadOpen(false);
    setIsDrawingOverlayActive(false);
    setQuestionTimes({});
    setQuestionElapsedSeconds(0);
    resultSavedRef.current = false;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!user) return null;

  if (selectedQuiz && quizStarted && !showResult) {
    const question = quizQuestions[currentQuestion];

    return (
      <ActiveQuizView
        isFocusMode={isFocusMode}
        isOnline={isOnline}
        isSmartboardMode={isSmartboardMode}
        isOpticalDocked={isOpticalDocked}
        questionCardRef={questionCardRef}
        isDrawingOverlayActive={isDrawingOverlayActive}
        setIsDrawingOverlayActive={setIsDrawingOverlayActive}
        currentQuestion={currentQuestion}
        resetQuiz={resetQuiz}
        setIsScratchpadOpen={setIsScratchpadOpen}
        setIsOpticalDocked={setIsOpticalDocked}
        setIsOpticalSheetOpen={setIsOpticalSheetOpen}
        setIsGlossaryOpen={setIsGlossaryOpen}
        setIsSpotMistakeOpen={setIsSpotMistakeOpen}
        setIsMathLabOpen={setIsMathLabOpen}
        toggleDyslexicMode={toggleDyslexicMode}
        isDyslexicMode={isDyslexicMode}
        setIsSmartboardMode={setIsSmartboardMode}
        setIsA11yModalOpen={setIsA11yModalOpen}
        setIsFocusMode={setIsFocusMode}
        setIsShortcutsOpen={setIsShortcutsOpen}
        questionElapsedSeconds={questionElapsedSeconds}
        toggleFlagQuestion={toggleFlagQuestion}
        timeLeft={timeLeft}
        formatTime={formatTime}
        quizQuestions={quizQuestions}
        selectedQuiz={selectedQuiz}
        question={question}
        isSpeechSupported={isSpeechSupported}
        toggleSpeech={toggleSpeech}
        isSpeaking={isSpeaking}
        a11ySettings={a11ySettings}
        selectedAnswer={selectedAnswer}
        selectAnswer={selectAnswer}
        setConfidenceRatings={setConfidenceRatings}
        confidenceRatings={confidenceRatings}
        isHintLadderOpen={isHintLadderOpen}
        setIsHintLadderOpen={setIsHintLadderOpen}
        setShowSmartboardSolution={setShowSmartboardSolution}
        showSmartboardSolution={showSmartboardSolution}
        previousQuestion={previousQuestion}
        nextQuestion={nextQuestion}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        jumpToQuestion={jumpToQuestion}
        maxOptionsCount={maxOptionsCount}
        clearAnswer={clearAnswer}
        user={user}
        handleFinishQuiz={handleFinishQuiz}
        isScratchpadOpen={isScratchpadOpen}
        isShortcutsOpen={isShortcutsOpen}
        isOpticalSheetOpen={isOpticalSheetOpen}
        isGlossaryOpen={isGlossaryOpen}
        textAnswers={textAnswers}
        setTextAnswers={setTextAnswers}
        rubricEvaluations={rubricEvaluations}
        setRubricEvaluations={setRubricEvaluations}
      />
    );
  }

  if (selectedQuiz && showResult) {
    const score = calculateScore();

    const handleDownloadPDF = async () => {
      setPdfLoading(true);
      try {
        const { downloadQuizPDF } = await import('@/lib/pdf-export');
        await downloadQuizPDF(selectedQuiz.title);
      } finally {
        setPdfLoading(false);
      }
    };

    const handleShareResult = async () => {
      const shareText = `${selectedQuiz.title} testinden %${score} aldım! Uğur Hoca Matematik ile birlikte çalışıyorum.`;
      const shareUrl =
        typeof window !== 'undefined' ? window.location.origin : '';
      const payload: ShareData = {
        title: 'Uğur Hoca Matematik',
        text: shareText,
        url: shareUrl,
      };

      try {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share(payload);
          return;
        }
        if (
          typeof navigator !== 'undefined' &&
          navigator.clipboard &&
          shareUrl
        ) {
          await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          showToast('success', 'Sonuç panoya kopyalandı!');
          return;
        }
        showToast('warning', 'Paylaşım desteklenmiyor.');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        log.warn('Paylaşım hatası', {
          error: err instanceof Error ? err.message : String(err),
        });
        showToast('error', 'Paylaşım başarısız oldu.');
      }
    };

    return (
      <main className="page-surface testler-page min-h-screen gradient-bg flex items-center justify-center p-6">
        <QuizResultsView
          score={score}
          quiz={selectedQuiz}
          quizQuestions={quizQuestions}
          answers={answers}
          questionTimes={questionTimes}
          confidenceRatings={confidenceRatings}
          startTime={startTime}
          textAnswers={textAnswers}
          rubricEvaluations={rubricEvaluations}
          onRetake={() => startQuiz(selectedQuiz)}
          onBackToLobby={resetQuiz}
          onOpenOutcomeAnalysis={() => setIsOutcomeAnalysisOpen(true)}
          onOpenMistakeModal={() => setIsMistakeModalOpen(true)}
          onDownloadPDF={handleDownloadPDF}
          pdfLoading={pdfLoading}
          onShareResult={handleShareResult}
          onOpenMistakeNotebook={() => setIsMistakeNotebookOpen(true)}
          onOpenWorksheet={() => setIsWorksheetModalOpen(true)}
        />

        <QuizMistakeReviewModal
          isOpen={isMistakeModalOpen}
          onClose={() => setIsMistakeModalOpen(false)}
          questions={quizQuestions}
          answers={answers}
          onStartRetakeMistakes={handleStartRetakeMistakes}
        />

        <MistakeNotebookModal
          isOpen={isMistakeNotebookOpen}
          onClose={() => setIsMistakeNotebookOpen(false)}
          onStartRetakeQuiz={handleStartRetakeMistakes}
        />

        <LearningOutcomeAnalysisModal
          isOpen={isOutcomeAnalysisOpen}
          onClose={() => setIsOutcomeAnalysisOpen(false)}
          questions={quizQuestions}
          answers={answers}
          quizTitle={selectedQuiz?.title}
          grade={selectedQuiz?.grade || user?.grade || 8}
        />
      </main>
    );
  }

  return (
    <TestsCatalogView
      profileHref={profileHref}
      user={user}
      error={error}
      setIsPacingStrategyModalOpen={setIsPacingStrategyModalOpen}
      setIsLeagueModalOpen={setIsLeagueModalOpen}
      setIsMistakeNotebookOpen={setIsMistakeNotebookOpen}
      setIsOfflinePackageModalOpen={setIsOfflinePackageModalOpen}
      activeDraft={activeDraft}
      handleResumeDraft={handleResumeDraft}
      handleDiscardDraft={handleDiscardDraft}
      pendingMistakesCount={pendingMistakesCount}
      handleStartAdaptiveQuiz={handleStartAdaptiveQuiz}
      loading={loading}
      visibleQuizzes={visibleQuizzes}
      startQuiz={startQuiz}
      handleOpenWorksheetPreview={handleOpenWorksheetPreview}
      isMistakeNotebookOpen={isMistakeNotebookOpen}
      handleStartRetakeMistakes={handleStartRetakeMistakes}
      isWorksheetModalOpen={isWorksheetModalOpen}
      setIsWorksheetModalOpen={setIsWorksheetModalOpen}
      selectedQuiz={selectedQuiz}
      quizQuestions={quizQuestions}
      isLeagueModalOpen={isLeagueModalOpen}
      leagueQuiz={leagueQuiz}
      isPacingStrategyModalOpen={isPacingStrategyModalOpen}
      isSpotMistakeOpen={isSpotMistakeOpen}
      setIsSpotMistakeOpen={setIsSpotMistakeOpen}
      isMathLabOpen={isMathLabOpen}
      setIsMathLabOpen={setIsMathLabOpen}
      isA11yModalOpen={isA11yModalOpen}
      setIsA11yModalOpen={setIsA11yModalOpen}
      isOfflinePackageModalOpen={isOfflinePackageModalOpen}
      handleStartOfflineQuiz={handleStartOfflineQuiz}
    />
  );
}
