'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calculator,
  FileText,
  Clock,
  Trophy,
  ArrowLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Zap,
  Target,
  PenTool,
  Maximize2,
  Minimize2,
  WifiOff,
  BookOpen,
  Printer,
  Keyboard,
  Volume2,
  VolumeX,
  Timer,
  AlertTriangle,
  Compass,
  MonitorPlay,
  Sliders,
  FileSpreadsheet,
  MessageCircle,
  HardDrive,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useToast } from '@/components/Toast';
import MathText from '@/components/MathText';
import { fireConfetti } from '@/components/ConfettiBurst';
import ScratchpadModal from '@/components/ScratchpadModal';
import { QuizQuestionPalette } from '@/features/quizzes/components/QuizQuestionPalette';
import { QuizMistakeReviewModal } from '@/features/quizzes/components/QuizMistakeReviewModal';
import { MistakeNotebookModal } from '@/features/quizzes/components/MistakeNotebookModal';
import { QuestionHintLadder } from '@/features/quizzes/components/QuestionHintLadder';
import { QuizShortcutsModal } from '@/features/quizzes/components/QuizShortcutsModal';
import { QuizPacingCoach } from '@/features/quizzes/components/QuizPacingCoach';
import { useQuestionSpeech } from '@/features/quizzes/hooks/useQuestionSpeech';
import { QuestionDrawingOverlay } from '@/features/quizzes/components/QuestionDrawingOverlay';
import { trackFeatureOpen } from '@/lib/analytics';
import { SpotTheMistakeModal } from '@/features/quizzes/components/SpotTheMistakeModal';
import { InteractiveMathLabModal } from '@/features/programs/components/InteractiveMathLabModal';
import { AccessibilitySettingsModal } from '@/components/AccessibilitySettingsModal';
import { useAccessibilitySettings } from '@/hooks/useAccessibilitySettings';

const PrintableWorksheetModal = dynamic(
  () =>
    import('@/features/quizzes/components/PrintableWorksheetModal').then((m) => ({
      default: m.PrintableWorksheetModal,
    })),
  { ssr: false },
);

const OfflineStudyPackageModal = dynamic(
  () =>
    import('@/features/quizzes/components/OfflineStudyPackageModal').then((m) => ({
      default: m.OfflineStudyPackageModal,
    })),
  { ssr: false },
);

const LearningOutcomeAnalysisModal = dynamic(
  () =>
    import('@/features/quizzes/components/LearningOutcomeAnalysisModal').then((m) => ({
      default: m.LearningOutcomeAnalysisModal,
    })),
  { ssr: false },
);

const QuizOpticalSheetModal = dynamic(
  () =>
    import('@/features/quizzes/components/QuizOpticalSheetModal').then((m) => ({
      default: m.QuizOpticalSheetModal,
    })),
  { ssr: false },
);

const WeeklyMockLeagueModal = dynamic(
  () =>
    import('@/features/quizzes/components/WeeklyMockLeagueModal').then((m) => ({
      default: m.WeeklyMockLeagueModal,
    })),
  { ssr: false },
);

const MathGlossaryModal = dynamic(
  () =>
    import('@/features/programs/components/MathGlossaryModal').then((m) => ({
      default: m.MathGlossaryModal,
    })),
  { ssr: false },
);
const ExamPacingStrategyModal = dynamic(
  () =>
    import('@/features/quizzes/components/ExamPacingStrategyModal').then((m) => ({
      default: m.ExamPacingStrategyModal,
    })),
  { ssr: false },
);
import { saveMistakesToBank, markMistakeMastered, getSavedMistakes } from '@/features/quizzes/lib/mistakeStorage';
import { syncMistakesWithCloud } from '@/features/quizzes/lib/mistakeSync';
import {
  saveQuizDraft,
  getQuizDraft,
  clearQuizDraft,
  getActiveQuizDraft,
  type QuizDraft,
} from '@/features/quizzes/lib/quizDraftStorage';
import { incrementQuestionsSolved } from '@/lib/dailyGoalStorage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { QuizResultsView } from '@/features/quizzes/components/QuizResultsView';
import { requireClientSession } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/error-utils';
import { createLogger } from '@/lib/logger';
import { decodeQuizMediaExplanation } from '@/lib/quiz-media';
import { supabase } from '@/lib/supabase/client';
import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';

const log = createLogger('tests-page');
import { Quiz, QuizQuestion } from '@/types/quiz';
import type { AppUser } from '@/types';

type TestsPageProps = {
  initialQuizzes?: Quiz[];
  initialUser?: AppUser | null;
  isHydrated?: boolean;
};

const hasOptionImage = (question: QuizQuestion, optionIndex: number) =>
  Boolean(question.option_image_urls?.[optionIndex]);

const normalizeQuizQuestion = (question: QuizQuestion): QuizQuestion => {
  const media = decodeQuizMediaExplanation(question.explanation);
  return {
    ...question,
    explanation: media.explanation,
    option_image_urls: question.option_image_urls || media.option_image_urls,
    question_image_url: question.question_image_url || media.question_image_url,
    distractor_explanations: question.distractor_explanations || media.distractor_explanations,
  };
};

function QuestionImage({
  alt,
  src,
}: {
  alt: string;
  src: string;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-3">
      <div className="relative mx-auto h-72 w-full max-w-xl">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 40rem"
          className="object-contain"
        />
      </div>
    </div>
  );
}

function OptionMedia({
  alt,
  src,
}: {
  alt: string;
  src: string;
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-slate-950/50 p-2">
      <div className="relative h-28 w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 20rem"
          className="object-contain"
        />
      </div>
    </div>
  );
}

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
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [isMistakeModalOpen, setIsMistakeModalOpen] = useState(false);
  const [isMistakeNotebookOpen, setIsMistakeNotebookOpen] = useState(false);
  const [pendingMistakesCount, setPendingMistakesCount] = useState(0);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [isOfflinePackageModalOpen, setIsOfflinePackageModalOpen] = useState(false);
  const [isOutcomeAnalysisOpen, setIsOutcomeAnalysisOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isOpticalSheetOpen, setIsOpticalSheetOpen] = useState(false);
  const [isOpticalDocked, setIsOpticalDocked] = useState(false);
  const [isHintLadderOpen, setIsHintLadderOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isLeagueModalOpen, setIsLeagueModalOpen] = useState(false);
  const [isPacingStrategyModalOpen, setIsPacingStrategyModalOpen] = useState(false);
  const [confidenceRatings, setConfidenceRatings] = useState<Record<number, 'sure' | 'unsure' | 'guess'>>({});
  const [isSpotMistakeOpen, setIsSpotMistakeOpen] = useState(false);
  const [isMathLabOpen, setIsMathLabOpen] = useState(false);
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState(0);
  const [isDyslexicMode, setIsDyslexicMode] = useState(false);
  const [isSmartboardMode, setIsSmartboardMode] = useState(false);
  const [showSmartboardSolution, setShowSmartboardSolution] = useState(false);
  const [activeDraft, setActiveDraft] = useState<QuizDraft | null>(null);
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);
  const { settings: a11ySettings } = useAccessibilitySettings();

  useEffect(() => {
    if (typeof window !== 'undefined' && !quizStarted) {
      const draft = getActiveQuizDraft();
      if (draft) {
        setActiveDraft(draft);
      }
    }
  }, [quizStarted]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ugurhoca_dyslexic_mode_v1') === 'true';
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
      const list = getSavedMistakes();
      setPendingMistakesCount(list.filter((m) => !m.mastered).length);
    } catch {
      // ignore
    }
  }, [isMistakeNotebookOpen, isMistakeModalOpen, quizStarted]);
  const resultSavedRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const modeParam = searchParams?.get('mode') || (searchParams?.get('mistakes') ? 'mistakes' : null);
  useEffect(() => {
    if (modeParam === 'mistakes') {
      setIsMistakeNotebookOpen(true);
    }
  }, [modeParam]);

  const flushPendingQuizResults = useCallback(async () => {
    try {
      const raw = localStorage.getItem('ugurhoca_pending_quiz_results');
      if (!raw) return;
      const pending = JSON.parse(raw);
      if (!Array.isArray(pending) || pending.length === 0) return;

      const { error: insertError } = await supabase.from('quiz_results').insert(pending);
      if (!insertError) {
        localStorage.removeItem('ugurhoca_pending_quiz_results');
        showToast('success', 'Çevrimdışıyken tamamlanan test sonuçlarınız senkronize edildi.');
      }
    } catch {
      // ignore
    }
  }, [showToast]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('info', 'İnternet bağlantısı yeniden kuruldu.');
      void flushPendingQuizResults();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('warning', 'İnternet bağlantısı koptu. Cevaplarınız yerel olarak güvende.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast, flushPendingQuizResults]);

  // Aktif test durumunu (cevaplar, kalan süre, bayraklar, soru süreleri) anlık güvenceye al
  useEffect(() => {
    if (quizStarted && selectedQuiz && (Object.keys(answers).length > 0 || currentQuestion > 0)) {
      saveQuizDraft({
        quizId: selectedQuiz.id,
        quizTitle: selectedQuiz.title,
        currentQuestion,
        answers,
        flaggedQuestions: Array.from(flaggedQuestions),
        questionTimes,
        startTime: startTime || Date.now(),
        timeLeft: timeLeft ?? (selectedQuiz.time_limit * 60),
      });
    }
  }, [
    quizStarted,
    selectedQuiz,
    answers,
    currentQuestion,
    startTime,
    timeLeft,
    flaggedQuestions,
    questionTimes,
  ]);
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

    return quizzes.filter((quiz) => quiz.grade === Number(user.grade));
  }, [quizzes, user]);

  useEffect(() => {
    const checkSession = async () => {
      const session = await requireClientSession({ router });
      if (!session) {
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUser({ ...profile, email: session.user.email });
      } else {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Öğrenci',
          email: session.user.email ?? '',
          grade: session.user.user_metadata?.grade ?? 5,
        });
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
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

        if (!user.isAdmin && Number.isFinite(Number(user.grade))) {
          query = query.eq('grade', Number(user.grade));
        }

        const { data, error: quizError } = await query;

        if (quizError) throw quizError;
        if (data) setQuizzes(data);
      } catch (err) {
        log.error('Testler yüklenirken hata', err);
        setError('Testler yüklenemedi. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };
    loadQuizzes();
  }, [currentUserKey, initialUserKey, isHydrated, user]);

  const loadQuizQuestions = useCallback(async (quizId: string) => {
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
        setQuizQuestions(data.map((item) => normalizeQuizQuestion(item as QuizQuestion)));
        return true;
      }
      return false;
    } catch (err) {
      log.error('Sorular yüklenirken hata', err);
      showToast('error', getErrorMessage(err, 'Sorular yüklenemedi.'));
      return false;
    }
  }, [showToast]);

  const handleResumeDraft = useCallback(
    async (draft: QuizDraft) => {
      const targetQuiz = quizzes.find((q) => q.id === draft.quizId);
      if (!targetQuiz) {
        clearQuizDraft(draft.quizId);
        setActiveDraft(null);
        return;
      }

      const success = await loadQuizQuestions(targetQuiz.id);
      if (!success) return;

      setSelectedQuiz(targetQuiz);
      setQuizStarted(true);
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
      showToast('success', `${targetQuiz.title} sınavına kaldığınız yerden devam ediyorsunuz.`);
    },
    [loadQuizQuestions, quizzes, showToast],
  );

  const handleDiscardDraft = useCallback((quizId: string) => {
    clearQuizDraft(quizId);
    setActiveDraft(null);
  }, []);

  const startQuiz = useCallback(
    async (quiz: Quiz) => {
      const existingDraft = getQuizDraft(quiz.id);
      if (existingDraft && (Object.keys(existingDraft.answers).length > 0 || existingDraft.currentQuestion > 0)) {
        await handleResumeDraft(existingDraft);
        return;
      }

      const success = await loadQuizQuestions(quiz.id);
      if (!success) return;

      setSelectedQuiz(quiz);
      setQuizStarted(true);
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
    [handleResumeDraft, loadQuizQuestions],
  );

  const quizIdParam = searchParams?.get('quizId');
  const topicParam = searchParams?.get('topic');
  const autoStartedQuizRef = useRef(false);

  useEffect(() => {
    if (autoStartedQuizRef.current || quizStarted || quizzes.length === 0) return;

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

  const handleOpenWorksheetPreview = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    const success = await loadQuizQuestions(quiz.id);
    if (success) {
      setIsWorksheetModalOpen(true);
    }
  };

  const selectAnswer = (index: number, targetQuestionIndex?: number) => {
    const qIdx = targetQuestionIndex !== undefined ? targetQuestionIndex : currentQuestion;
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
    const qIdx = targetQuestionIndex !== undefined ? targetQuestionIndex : currentQuestion;
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
      setSelectedAnswer(
        answers[index] !== undefined ? answers[index] : null,
      );
    }
  };

  const handleStartRetakeMistakes = (mistakeQuestions: QuizQuestion[]) => {
    if (mistakeQuestions.length === 0) return;
    if (!selectedQuiz) {
      setSelectedQuiz({
        id: 'adaptive-recovery-quiz',
        title: 'Akıllı Telafi & Pekiştirme Testi',
        description: 'Hata defterindeki zayıf kazanımlara özel derlenmiş kişiselleştirilmiş test.',
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
    setQuizStarted(true);
    setStartTime(Date.now());
    setTimeLeft(mistakeQuestions.length * 90);
    setFlaggedQuestions(new Set());
    resultSavedRef.current = false;
    showToast('info', `${mistakeQuestions.length} soruluk telafi testi başladı!`);
  };

  const handleStartOfflineQuiz = (pkg: import('@/features/quizzes/lib/offlineQuizPackageStorage').OfflineQuizPackage) => {
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
    setQuizStarted(true);
    setStartTime(Date.now());
    setTimeLeft(pkg.questions.length * 90);
    setFlaggedQuestions(new Set());
    resultSavedRef.current = false;
    showToast('success', `Çevrimdışı test başladı: ${pkg.title}`);
  };

  const handleStartAdaptiveQuiz = (count?: number) => {
    const list = getSavedMistakes();
    const pending = list.filter((m) => !m.mastered);
    if (pending.length === 0) {
      showToast('info', 'Hata defterinde henüz çözülecek yanlış soru bulunmuyor. Tebrikler!');
      return;
    }
    const sorted = [...pending].sort((a, b) => {
      if (a.reason === 'concept' && b.reason !== 'concept') return -1;
      if (b.reason === 'concept' && a.reason !== 'concept') return 1;
      return 0;
    });
    const questionsToSolve = (count ? sorted.slice(0, count) : sorted).map((m) => m.question);
    handleStartRetakeMistakes(questionsToSolve);
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(
        answers[currentQuestion + 1] !== undefined
          ? answers[currentQuestion + 1]
          : null,
      );
    } else {
      setShowResult(true);
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

  useEffect(() => {
    if (!quizStarted || showResult || !selectedQuiz) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toUpperCase();

      if (e.shiftKey && key === 'K') {
        e.preventDefault();
        setIsGlossaryOpen((prev) => !prev);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        clearAnswer(currentQuestion);
      } else if (key === 'O') {
        e.preventDefault();
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
          setIsOpticalDocked((prev) => !prev);
        } else {
          setIsOpticalSheetOpen((prev) => !prev);
        }
      } else if (key === 'I' || key === 'H') {
        e.preventDefault();
        setIsHintLadderOpen((prev) => !prev);
      } else if (key === 'D') {
        e.preventDefault();
        toggleDyslexicMode();
      } else if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        const optionIndex = key.charCodeAt(0) - 65;
        const currentQ = quizQuestions[currentQuestion];
        if (currentQ && currentQ.options && optionIndex < currentQ.options.length) {
          e.preventDefault();
          selectAnswer(optionIndex);
        }
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const optionIndex = parseInt(e.key, 10) - 1;
        const currentQ = quizQuestions[currentQuestion];
        if (currentQ && currentQ.options && optionIndex < currentQ.options.length) {
          e.preventDefault();
          selectAnswer(optionIndex);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!isShortcutsOpen && !isScratchpadOpen && !isGlossaryOpen) {
          e.preventDefault();
          nextQuestion();
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isShortcutsOpen && !isScratchpadOpen && !isGlossaryOpen) {
          e.preventDefault();
          previousQuestion();
        }
      } else if (e.shiftKey && key === 'S') {
        e.preventDefault();
        setIsDrawingOverlayActive((prev) => !prev);
      } else if (key === 'K' || key === 'S') {
        e.preventDefault();
        setIsScratchpadOpen((prev) => !prev);
      } else if (key === 'F' || key === 'B') {
        e.preventDefault();
        toggleFlagQuestion(currentQuestion);
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsScratchpadOpen(false);
        setIsDrawingOverlayActive(false);
        setIsGlossaryOpen(false);
        setIsOpticalSheetOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quizStarted,
    showResult,
    selectedQuiz,
    currentQuestion,
    quizQuestions,
    isShortcutsOpen,
    isScratchpadOpen,
    isGlossaryOpen,
    isOpticalSheetOpen,
    isOpticalDocked,
    answers,
    toggleDyslexicMode,
  ]);

  const calculateScore = useCallback(() => {
    if (quizQuestions.length === 0) return 0;
    let correct = 0;
    quizQuestions.forEach((q, i: number) => {
      if (answers[i] === q.correct_index) correct++;
    });
    return Math.round((correct / quizQuestions.length) * 100);
  }, [answers, quizQuestions]);

  const saveQuizResult = useCallback(async () => {
    // Hata defterine yanlışları otomatik ekle, doğru çözülenleri öğrenildi işaretle
    const mistakes = quizQuestions.filter((q, i) => answers[i] !== q.correct_index);
    if (mistakes.length > 0) {
      const userAnswersMap: Record<string, number> = {};
      quizQuestions.forEach((q, i) => {
        if (answers[i] !== undefined) {
          userAnswersMap[q.id] = answers[i];
        }
      });
      saveMistakesToBank(mistakes, selectedQuiz?.title, userAnswersMap);
    }
    const corrects = quizQuestions.filter((q, i) => answers[i] === q.correct_index);
    for (const c of corrects) {
      markMistakeMastered(c.question, true);
    }
    if (user?.id) {
      void syncMistakesWithCloud(user.id);
    }
    incrementQuestionsSolved(quizQuestions.length);

    if (!user || !selectedQuiz || !startTime) return;
    if (resultSavedRef.current) return;
    resultSavedRef.current = true;
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
        clearQuizDraft(selectedQuiz.id);
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
        const raw = localStorage.getItem('ugurhoca_pending_quiz_results') || '[]';
        const pending = JSON.parse(raw);
        pending.push({
          user_id: user.id,
          quiz_id: selectedQuiz.id,
          score,
          total_questions: quizQuestions.length,
          answers,
          time_spent: timeSpent,
        });
        localStorage.setItem('ugurhoca_pending_quiz_results', JSON.stringify(pending));
        showToast('info', 'Sonucunuz yerel hafızaya kaydedildi. İnternet bağlandığında otomatik kaydedilecek.');
      } catch {
        // ignore
      }
      resultSavedRef.current = false;
    }
  }, [
    answers,
    calculateScore,
    quizQuestions,
    selectedQuiz,
    showToast,
    startTime,
    user,
  ]);

  const handleFinishQuiz = useCallback(() => {
    setShowResult(true);
    saveQuizResult();
  }, [saveQuizResult]);

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
      setShowResult(true);
      saveQuizResult();
    }
  }, [currentQuestion, quizStarted, saveQuizResult, showResult, timeLeft]);

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

  const resetQuiz = () => {
    if (selectedQuiz) {
      clearQuizDraft(selectedQuiz.id);
    }
    setActiveDraft(null);
    setSelectedQuiz(null);
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay':
        return 'from-green-500 to-emerald-500';
      case 'Orta':
        return 'from-yellow-500 to-orange-500';
      case 'Zor':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  if (!user) return null;

  if (selectedQuiz && quizStarted && !showResult) {
    const question = quizQuestions[currentQuestion];

    return (
      <main className={`testler-page min-h-screen gradient-bg flex flex-col items-center justify-center p-3 sm:p-6 transition-all ${
        isFocusMode ? 'bg-slate-950 p-2 sm:p-4' : ''
      }`}>

        {/* Çevrimdışı Güvence Şeridi */}
        {!isOnline && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-200 shadow-xl backdrop-blur-md">
            <WifiOff className="h-3.5 w-3.5" />
            <span>Çevrimdışı Mod: İşaretlemeleriniz cihazınızda güvende tutuluyor.</span>
          </div>
        )}

        <div className={`w-full relative z-10 animate-fade-up ${
          isSmartboardMode ? 'max-w-6xl' : isOpticalDocked ? 'max-w-6xl' : isFocusMode ? 'max-w-4xl' : 'max-w-3xl'
        }`}>
          <div className={isOpticalDocked ? 'flex flex-col lg:flex-row gap-6 items-start' : ''}>
            <div
              ref={questionCardRef}
              className={`flex-1 w-full glass rounded-3xl p-5 sm:p-8 space-y-6 relative ${
                isSmartboardMode ? 'border-amber-500/30 bg-slate-900/98 shadow-2xl p-6 sm:p-10' : isFocusMode ? 'border-white/20 shadow-2xl bg-slate-900/95' : ''
              }`}
            >
              {/* Soru Üzerine Çizim Katmanı */}
              <QuestionDrawingOverlay
                isActive={isDrawingOverlayActive}
                onClose={() => setIsDrawingOverlayActive(false)}
                questionIndex={currentQuestion}
                containerRef={questionCardRef}
              />

              {/* Üst Eylem ve Zamanlayıcı Çubuğu */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <button
                  onClick={resetQuiz}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Testten Çık
                </button>

                <div className="flex items-center gap-2">
                  {/* Soru Üzerine Çizim Modu Butonu */}
                  <button
                    type="button"
                    onClick={() => setIsDrawingOverlayActive((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      isDrawingOverlayActive
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                    title="Soru kartı üzerine doğrudan çizim ve not alma katmanını aç/kapat"
                    aria-label="Soruya Çiz"
                  >
                    <PenTool className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span className="hidden sm:inline">Soruya Çiz</span>
                  </button>

                  {/* Karalama Tahtası Butonu */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsScratchpadOpen(true);
                      void trackFeatureOpen('scratchpad');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-white/10 bg-amber-50 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 transition hover:bg-amber-100 dark:hover:bg-white/10 hover:text-amber-800 dark:hover:text-amber-200"
                    title="Karalama ve işlem tahtasını aç (K)"
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Karalama</span>
                  </button>

                  {/* Optik Form Butonu */}
                  <button
                    type="button"
                    onClick={() => {
                      void trackFeatureOpen('optical_sheet');
                      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                        setIsOpticalDocked((prev) => !prev);
                      } else {
                        setIsOpticalSheetOpen(true);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      isOpticalDocked
                        ? 'border-amber-500 bg-amber-500/20 text-amber-900 dark:text-amber-200'
                        : 'border-amber-300 dark:border-amber-500/30 bg-amber-100/80 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-200/80 hover:text-amber-900'
                    }`}
                    title="LGS / YKS dijital optik form simülasyonunu aç / sabitle (O)"
                  >
                    <FileText className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                    <span>{isOpticalDocked ? 'Optik Sabit' : 'Optik Form'}</span>
                  </button>

                  {/* Matematik Kavram Sözlüğü Butonu */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGlossaryOpen(true);
                      void trackFeatureOpen('math_glossary');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                    title="Matematik Kavramlar ve Terimler Rehberini Aç (Shift + K)"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span className="hidden sm:inline">Kavramlar</span>
                  </button>

                  {/* Hatayı Bul Etkinlik Butonu */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSpotMistakeOpen(true);
                      void trackFeatureOpen('spot_the_mistake');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 transition hover:bg-rose-100 dark:hover:bg-rose-500/20"
                    title="Öğrenci çözümlerinde ilk hatalı adımı bulma etkinliği"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                    <span className="hidden sm:inline">Hatayı Bul</span>
                  </button>

                  {/* Etkileşimli Matematik Lab Butonu */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMathLabOpen(true);
                      void trackFeatureOpen('interactive_math_lab');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 transition hover:bg-cyan-100 dark:hover:bg-cyan-500/20"
                    title="Dinamik geometri ve etkileşimli deney laboratuvarı"
                  >
                    <Compass className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                    <span className="hidden sm:inline">Matematik Lab</span>
                  </button>

                  {/* Rahat Okuma / Disleksi Modu Butonu */}
                  <button
                    type="button"
                    onClick={toggleDyslexicMode}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      isDyslexicMode
                        ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                    title={isDyslexicMode ? 'Normal yazı tipine dön' : 'Disleksi dostu rahat okuma modunu aç (D)'}
                    aria-pressed={isDyslexicMode}
                  >
                    <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">{isDyslexicMode ? 'Rahat Okuma Açık' : 'Rahat Okuma'}</span>
                  </button>

                  {/* Akıllı Tahta / Sunum Modu Butonu */}
                  <button
                    type="button"
                    onClick={() => setIsSmartboardMode((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      isSmartboardMode
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-md'
                        : 'border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                    title={isSmartboardMode ? 'Standart görünüme dön' : 'Sınıf akıllı tahta projeksiyon modunu aç'}
                    aria-pressed={isSmartboardMode}
                  >
                    <MonitorPlay className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                    <span className="hidden sm:inline">{isSmartboardMode ? 'Tahta Modu Açık' : 'Akıllı Tahta'}</span>
                  </button>

                  {/* Görünüm & Erişilebilirlik Butonu */}
                  <button
                    type="button"
                    onClick={() => setIsA11yModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 px-3 py-1.5 text-xs font-bold transition"
                    title="Yazı boyutu, dokunma alanı ve animasyon ayarları (WCAG 2.2)"
                  >
                    <Sliders className="h-3.5 w-3.5 text-sky-500" />
                    <span className="hidden sm:inline">Görünüm & Erişilebilirlik</span>
                  </button>

                {/* Odak Modu Butonu */}
                <button
                  type="button"
                  onClick={() => setIsFocusMode((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                    isFocusMode
                      ? 'border-purple-500/40 bg-purple-500/20 text-purple-200'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={isFocusMode ? 'Normal görünüme dön' : 'Tam odaklanma modunu aç'}
                >
                  {isFocusMode ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Odak Modundan Çık</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Odak Modu</span>
                    </>
                  )}
                </button>

                {/* Kısayollar Butonu */}
                <button
                  type="button"
                  onClick={() => setIsShortcutsOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
                  title="Klavye Kısayolları (?)"
                  aria-label="Klavye kısayollarını göster"
                >
                  <Keyboard className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Kısayollar</span>
                  <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-white/10 text-indigo-300">?</span>
                </button>

                {/* Hızlı Optik Kodlama Butonu */}
                <button
                  type="button"
                  onClick={() => setIsOpticalSheetOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition shadow-xs"
                  title="Optik Formu Aç (Hızlı İşaretleme)"
                  aria-label="Optik Formu Aç"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Optik Form</span>
                </button>

                {/* LGS / Sınav Tempo Koçu (Canlı) */}
                <QuizPacingCoach
                  mode="live"
                  currentQuestionIndex={currentQuestion}
                  questionElapsedSeconds={questionElapsedSeconds}
                  onFlagCurrentQuestion={() => toggleFlagQuestion(currentQuestion)}
                />

                {/* Süre */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    timeLeft !== null && timeLeft <= 30
                      ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/40'
                      : 'bg-slate-800/80 text-slate-300 border border-white/10'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft !== null ? formatTime(timeLeft) : ''}</span>
                </div>
              </div>
            </div>

            {/* İlerleme Çubuğu */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-purple-300 font-semibold">
                  Soru {currentQuestion + 1} / {quizQuestions.length}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full bg-gradient-to-r ${getDifficultyColor(
                    selectedQuiz.difficulty,
                  )} text-white font-semibold text-[11px]`}
                >
                  {selectedQuiz.difficulty}
                </span>
              </div>

              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300 dark:border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-300 ease-out"
                  style={{
                    width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Soru Gövdesi */}
            <div
              key={currentQuestion}
              className={`animate-fade-up ${isDyslexicMode ? 'font-dyslexic accessible-reading-mode' : ''}`}
              role="group"
              aria-label={`Soru ${currentQuestion + 1}`}
            >
              <div className="flex items-start justify-between gap-3 mb-6">
                <MathText
                  as="h2"
                  className={`flex-1 font-bold text-slate-900 dark:text-white font-display leading-snug ${
                    isSmartboardMode ? 'text-2xl sm:text-3xl tracking-wide' : 'text-lg sm:text-2xl'
                  } ${isDyslexicMode ? 'font-dyslexic accessible-reading-mode' : ''}`}
                >
                  {question.question}
                </MathText>

                {isSpeechSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      const optionsSpeech = question.options
                        ? question.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)} şıkkı: ${opt}`).join('. ')
                        : '';
                      toggleSpeech(`${question.question}. ${optionsSpeech}`);
                    }}
                    title={isSpeaking ? 'Seslendirmeyi durdur' : 'Soruyu sesli dinle'}
                    aria-label={isSpeaking ? 'Seslendirmeyi durdur' : 'Soruyu sesli dinle'}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      isSpeaking
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="hidden sm:inline">Durdur</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Sesli Oku</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('open-teacher-chat-with-question', {
                        detail: {
                          questionIndex: currentQuestion,
                          questionText: question.question,
                          quizTitle: selectedQuiz.title,
                        },
                      }),
                    );
                  }}
                  title="Bu soruyu Uğur Hoca'ya sor"
                  aria-label="Bu soruyu Uğur Hoca'ya sor"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shadow-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Hocama Sor</span>
                </button>
              </div>

              {question.question_image_url ? (
                <QuestionImage
                  alt={`Soru ${currentQuestion + 1} görseli`}
                  src={question.question_image_url}
                />
              ) : null}

              <div
                className={`space-y-3 ${a11ySettings.spaciousOptions ? 'space-y-5 sm:space-y-6' : ''}`}
                role="radiogroup"
                aria-label="Cevap seçenekleri"
              >
                {question.options.map((option: string, i: number) => {
                  const selected = selectedAnswer === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => selectAnswer(i)}
                      className={`w-full rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                        a11ySettings.touchTarget === 'comfortable_44'
                          ? 'min-h-[4rem] p-4 sm:p-5'
                          : 'min-h-[3.25rem] p-4'
                      } ${
                        selected
                          ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md scale-[1.01]'
                          : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 hover:translate-x-0.5 border border-slate-200 dark:border-white/5 shadow-sm'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                          selected
                            ? 'bg-white/25 text-white shadow-sm'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                        }`}
                        aria-hidden="true"
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <div
                        className={`flex-1 ${
                          a11ySettings.fontSize === 'xlarge'
                            ? 'text-base sm:text-lg'
                            : a11ySettings.fontSize === 'large'
                              ? 'text-sm sm:text-base'
                              : 'text-xs sm:text-sm'
                        } ${isDyslexicMode ? 'font-dyslexic accessible-reading-mode' : ''}`}
                      >
                        <MathText>{option}</MathText>
                        {hasOptionImage(question, i) ? (
                          <OptionMedia
                            alt={`Soru ${currentQuestion + 1} şık ${String.fromCharCode(65 + i)} görseli`}
                            src={question.option_image_urls?.[i] || ''}
                          />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Cevaba Güven Derecesi Seçimi (Metakognisyon) */}
              {selectedAnswer !== null && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs animate-fade-in">
                  <span className="text-slate-400 font-medium">Cevabından ne kadar eminsin?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setConfidenceRatings((prev) => ({ ...prev, [currentQuestion]: 'sure' }))
                      }
                      className={`px-3 py-1 rounded-xl font-bold transition ${
                        confidenceRatings[currentQuestion] === 'sure'
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-white/10 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      🎯 Eminim
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfidenceRatings((prev) => ({ ...prev, [currentQuestion]: 'unsure' }))
                      }
                      className={`px-3 py-1 rounded-xl font-bold transition ${
                        confidenceRatings[currentQuestion] === 'unsure'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-white/10 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      🤔 Kararsızım
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfidenceRatings((prev) => ({ ...prev, [currentQuestion]: 'guess' }))
                      }
                      className={`px-3 py-1 rounded-xl font-bold transition ${
                        confidenceRatings[currentQuestion] === 'guess'
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-white/10 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      🎲 Tahmin Ettim
                    </button>
                  </div>
                </div>
              )}

              {/* Kademeli İpucu Sistemi */}
              <QuestionHintLadder
                question={question}
                questionIndex={currentQuestion}
                isOpen={isHintLadderOpen}
                onToggleOpen={() => setIsHintLadderOpen((prev) => !prev)}
                quizTitle={selectedQuiz?.title}
              />

              {/* Akıllı Tahta / Öğretmen Çözüm Açma Paneli */}
              {isSmartboardMode && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <MonitorPlay className="w-4 h-4" />
                      <span>Akıllı Tahta: Öğretmen Çözüm Paneli</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSmartboardSolution((prev) => !prev)}
                      className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold transition hover:bg-amber-400"
                    >
                      {showSmartboardSolution ? 'Çözümü Gizle' : 'Çözümü Tahtada Aç'}
                    </button>
                  </div>
                  {showSmartboardSolution && (
                    <div className="mt-3 pt-3 border-t border-amber-500/20 text-sm text-slate-200 space-y-2">
                      <div className="font-bold text-emerald-400">
                        Doğru Cevap: {String.fromCharCode(65 + question.correct_index)}) {question.options[question.correct_index]}
                      </div>
                      {question.explanation && (
                        <div className="text-xs sm:text-sm leading-relaxed text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                          <MathText>{question.explanation}</MathText>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* İleri / Geri Butonları */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr] pt-2">
              <button
                type="button"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-200 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Önceki
              </button>
              <button
                type="button"
                onClick={nextQuestion}
                disabled={selectedAnswer === null}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  selectedAnswer !== null
                    ? 'bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange text-white shadow-brand-glow hover:-translate-y-0.5'
                    : 'bg-slate-200 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-transparent cursor-not-allowed'
                }`}
              >
                {currentQuestion < quizQuestions.length - 1 ? (
                  <>
                    Sonraki soru
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Testi bitir
                    <Trophy className="w-5 h-5" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>

            {/* Soru Navigasyon Haritası */}
            <div className="pt-4 border-t border-white/10">
              <QuizQuestionPalette
                totalQuestions={quizQuestions.length}
                currentIndex={currentQuestion}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                onSelectQuestion={jumpToQuestion}
                onToggleFlag={toggleFlagQuestion}
              />
            </div>
          </div>

          {/* Sabitlenmiş Yan Optik Form (Bölünmüş Ekran - Masaüstü) */}
          {isOpticalDocked && (
            <div className="w-full lg:w-80 shrink-0 hidden lg:block">
              <QuizOpticalSheetModal
                isOpen={true}
                onClose={() => setIsOpticalDocked(false)}
                totalQuestions={quizQuestions.length}
                currentIndex={currentQuestion}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                optionsCount={maxOptionsCount}
                isDocked={true}
                onToggleDock={() => {
                  setIsOpticalDocked(false);
                  setIsOpticalSheetOpen(true);
                }}
                onSelectQuestion={jumpToQuestion}
                onSelectAnswer={(qIdx, optIdx) => {
                  selectAnswer(optIdx, qIdx);
                }}
                onClearAnswer={clearAnswer}
                quizTitle={selectedQuiz?.title}
                studentName={user?.name || 'Öğrenci'}
                onSubmit={handleFinishQuiz}
              />
            </div>
          )}
        </div>
      </div>

        {/* Karalama Tahtası Modalı */}
        <ScratchpadModal
          isOpen={isScratchpadOpen}
          onClose={() => setIsScratchpadOpen(false)}
          title={`Soru ${currentQuestion + 1} — Karalama & İşlem Tahtası`}
          questionContext={
            question
              ? {
                  questionText: question.question,
                  options: question.options,
                  imageUrl: question.question_image_url,
                }
              : undefined
          }
        />

        {/* Klavye Kısayolları Modalı */}
        <QuizShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        {/* Optik Form Modalı (Docked değilken açılır) */}
        {!isOpticalDocked && (
          <QuizOpticalSheetModal
            isOpen={isOpticalSheetOpen}
            onClose={() => setIsOpticalSheetOpen(false)}
            totalQuestions={quizQuestions.length}
            currentIndex={currentQuestion}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            optionsCount={maxOptionsCount}
            isDocked={false}
            onToggleDock={() => {
              setIsOpticalSheetOpen(false);
              setIsOpticalDocked(true);
            }}
            onSelectQuestion={jumpToQuestion}
            onSelectAnswer={(qIdx, optIdx) => {
              selectAnswer(optIdx, qIdx);
            }}
            onClearAnswer={clearAnswer}
            quizTitle={selectedQuiz?.title}
            studentName={user?.name || 'Öğrenci'}
            onSubmit={handleFinishQuiz}
          />
        )}

        {/* Matematik Kavram Sözlüğü Modalı */}
        <MathGlossaryModal
          isOpen={isGlossaryOpen}
          onClose={() => setIsGlossaryOpen(false)}
        />
      </main>
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
      <main className="testler-page min-h-screen gradient-bg flex items-center justify-center p-6">
        <QuizResultsView
          score={score}
          quiz={selectedQuiz}
          quizQuestions={quizQuestions}
          answers={answers}
          questionTimes={questionTimes}
          confidenceRatings={confidenceRatings}
          startTime={startTime}
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
    <main className="testler-page min-h-screen gradient-bg pb-20">
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-3 sm:py-4 px-4 sm:px-6">
        <div className="container mx-auto flex justify-between items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
              Uğur Hoca Matematik
            </span>
          </Link>

          <Link
            href={profileHref}
            className="text-slate-300 hover:text-white flex items-center gap-1.5 text-xs sm:text-base shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{user.isAdmin ? 'Admin Panel' : 'Profil'}</span>
          </Link>
        </div>
      </nav>

      <div className="pt-20 sm:pt-24 px-4 sm:px-6">
        <div className="container mx-auto">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Online Testler
              </h1>
              <p className="text-slate-400">
                Bilginizi test edin ve kendinizi geliştirin
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsPacingStrategyModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/15 hover:bg-indigo-500/25 px-4 py-2.5 text-xs sm:text-sm font-bold text-indigo-300 shadow-md transition-all active:scale-95"
              >
                <Timer className="w-4 h-4 text-indigo-400" />
                <span>Süre Simülatörü</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLeagueModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 px-4 py-2.5 text-xs sm:text-sm font-bold text-rose-300 shadow-md transition-all active:scale-95"
              >
                <Trophy className="w-4 h-4 text-rose-400" />
                <span>Deneme Ligi</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMistakeNotebookOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-300 shadow-md transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Akıllı Hata Defterim</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOfflinePackageModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-300 shadow-md transition-all active:scale-95"
              >
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Çevrimdışı Setler</span>
              </button>
            </div>
          </div>

          {/* Yarım Kalan Sınav Taslağı Kurtarma Banner'ı */}
          {activeDraft && (
            <div className="mb-8 rounded-3xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 p-5 sm:p-6 backdrop-blur-xl shadow-2xl animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/30 text-amber-300 border border-amber-400/30 shadow-md">
                    <RotateCcw className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-white font-display">
                        Yarım Kalan Sınavınız Bulundu
                      </h2>
                      <span className="rounded-full bg-amber-500/30 px-2.5 py-0.5 text-xs font-extrabold text-amber-300 border border-amber-400/30">
                        Kesinti Koruması Aktif
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
                      <strong>{activeDraft.quizTitle}</strong> sınavında {activeDraft.currentQuestion + 1}. soruda kalmıştınız ({Object.keys(activeDraft.answers).length} cevap işaretli). Kalan süreniz ve işaretleriniz korundu.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleResumeDraft(activeDraft)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Kaldığım Yerden Devam Et</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDiscardDraft(activeDraft.quizId)}
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    Taslağı Sil
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Akıllı Telafi Testi Kartı */}
          {pendingMistakesCount > 0 && (
            <div className="mb-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl animate-fade-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/25">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-white font-display">
                        Kişisel Akıllı Telafi Testi Hazır!
                      </h2>
                      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-extrabold text-amber-300">
                        {pendingMistakesCount} Hatalı Soru
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                      Hata defterinde biriken zayıf kazanımlarını kapatmak için kişiselleştirilmiş telafi oturumuna hemen başla.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartAdaptiveQuiz(5)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>5 Soruluk Hızlı Telafi</span>
                  </button>
                  {pendingMistakesCount >= 10 && (
                    <button
                      type="button"
                      onClick={() => handleStartAdaptiveQuiz(10)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 active:scale-95 transition"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-300" />
                      <span>10 Soruluk Kapsamlı</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMistakeNotebookOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Hata Defterini İncele</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="glass rounded-2xl overflow-hidden"
                    aria-hidden="true"
                  >
                    <Skeleton className="h-2 w-full" rounded="sm" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-14 w-14" rounded="lg" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-10 w-full" rounded="lg" />
                    </div>
                  </div>
                ))}
                <span className="sr-only" aria-live="polite">
                  Testler yükleniyor
                </span>
              </>
            ) : visibleQuizzes.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  tone="soft"
                  icon={<FileText className="h-10 w-10" aria-hidden="true" />}
                  title={
                    user.isAdmin
                      ? 'Henüz aktif test bulunamadı'
                      : `${user.grade}. sınıf için aktif test yok`
                  }
                  description={
                    user.isAdmin
                      ? 'Admin panelinden yeni bir test oluşturabilir veya mevcut bir testi yayınlayabilirsin.'
                      : 'Uğur Hoca yeni testler hazırlıyor. Bu arada içerikler bölümünden konuları tekrar edebilirsin.'
                  }
                  action={
                    <Link
                      href="/icerikler"
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange px-5 text-sm font-semibold text-white shadow-brand-glow transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      İçeriklere git
                    </Link>
                  }
                />
              </div>
            ) : (
              visibleQuizzes.map((quiz, i: number) => (
                <div
                  key={quiz.id}
                  className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div
                    className={`h-1.5 bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)}`}
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-white/10 text-slate-300 border border-white/10">
                        {quiz.grade}. Sınıf
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-white mb-2">
                      {quiz.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
                      {quiz.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        {quiz.time_limit} dk
                      </span>
                      <span className="capitalize">{quiz.difficulty}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startQuiz(quiz)}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Teste Başla
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleOpenWorksheetPreview(quiz);
                        }}
                        className="px-3.5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                        title="A4 Yazdırılabilir Yaprak Test"
                      >
                        <Printer className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs hidden sm:inline">Yaprak Test</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <MistakeNotebookModal
        isOpen={isMistakeNotebookOpen}
        onClose={() => setIsMistakeNotebookOpen(false)}
        onStartRetakeQuiz={handleStartRetakeMistakes}
      />
      <PrintableWorksheetModal
        isOpen={isWorksheetModalOpen}
        onClose={() => setIsWorksheetModalOpen(false)}
        quiz={selectedQuiz}
        questions={quizQuestions}
      />
      <WeeklyMockLeagueModal
        isOpen={isLeagueModalOpen}
        onClose={() => setIsLeagueModalOpen(false)}
      />
      <ExamPacingStrategyModal
        isOpen={isPacingStrategyModalOpen}
        onClose={() => setIsPacingStrategyModalOpen(false)}
      />
      <SpotTheMistakeModal
        isOpen={isSpotMistakeOpen}
        onClose={() => setIsSpotMistakeOpen(false)}
      />
      <InteractiveMathLabModal
        isOpen={isMathLabOpen}
        onClose={() => setIsMathLabOpen(false)}
      />
      <AccessibilitySettingsModal
        isOpen={isA11yModalOpen}
        onClose={() => setIsA11yModalOpen(false)}
      />
      <OfflineStudyPackageModal
        isOpen={isOfflinePackageModalOpen}
        onClose={() => setIsOfflinePackageModalOpen(false)}
        onStartOfflineQuiz={handleStartOfflineQuiz}
      />
    </main>
  );
}
