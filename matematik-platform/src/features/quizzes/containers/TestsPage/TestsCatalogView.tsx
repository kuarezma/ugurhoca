import type { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { SafeLink as Link } from '@/components/SafeLink';
import { ArrowLeft } from 'lucide-react';
import { type QuizDraft } from '@/features/quizzes/lib/quizDraftStorage';
import { Quiz, QuizQuestion } from '@/types/quiz';
import type { AppUser } from '@/types';
import {
  MistakeNotebookModal,
  SpotTheMistakeModal,
  InteractiveMathLabModal,
  AccessibilitySettingsModal,
  PrintableWorksheetModal,
  OfflineStudyPackageModal,
  WeeklyMockLeagueModal,
  ExamPacingStrategyModal,
} from './lazy';
import { QuizCatalog } from './QuizCatalog';
type TestsCatalogViewProps = {
  profileHref: '/admin' | '/profil';
  user: AppUser;
  error: string | null;
  setIsPacingStrategyModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsLeagueModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsMistakeNotebookOpen: Dispatch<SetStateAction<boolean>>;
  setIsOfflinePackageModalOpen: Dispatch<SetStateAction<boolean>>;
  activeDraft: QuizDraft | null;
  handleResumeDraft: (draft: QuizDraft) => Promise<void>;
  handleDiscardDraft: (quizId: string) => void;
  pendingMistakesCount: number;
  handleStartAdaptiveQuiz: (count?: number) => void;
  loading: boolean;
  visibleQuizzes: Quiz[];
  startQuiz: (quiz: Quiz) => Promise<void>;
  handleOpenWorksheetPreview: (quiz: Quiz) => Promise<void>;
  isMistakeNotebookOpen: boolean;
  handleStartRetakeMistakes: (mistakeQuestions: QuizQuestion[]) => void;
  isWorksheetModalOpen: boolean;
  setIsWorksheetModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedQuiz: Quiz | null;
  quizQuestions: QuizQuestion[];
  isLeagueModalOpen: boolean;
  leagueQuiz: Quiz | undefined;
  isPacingStrategyModalOpen: boolean;
  isSpotMistakeOpen: boolean;
  setIsSpotMistakeOpen: Dispatch<SetStateAction<boolean>>;
  isMathLabOpen: boolean;
  setIsMathLabOpen: Dispatch<SetStateAction<boolean>>;
  isA11yModalOpen: boolean;
  setIsA11yModalOpen: Dispatch<SetStateAction<boolean>>;
  isOfflinePackageModalOpen: boolean;
  handleStartOfflineQuiz: (
    pkg: import('@/features/quizzes/lib/offlineQuizPackageStorage').OfflineQuizPackage,
  ) => void;
};

export function TestsCatalogView({
  profileHref,
  user,
  error,
  setIsPacingStrategyModalOpen,
  setIsLeagueModalOpen,
  setIsMistakeNotebookOpen,
  setIsOfflinePackageModalOpen,
  activeDraft,
  handleResumeDraft,
  handleDiscardDraft,
  pendingMistakesCount,
  handleStartAdaptiveQuiz,
  loading,
  visibleQuizzes,
  startQuiz,
  handleOpenWorksheetPreview,
  isMistakeNotebookOpen,
  handleStartRetakeMistakes,
  isWorksheetModalOpen,
  setIsWorksheetModalOpen,
  selectedQuiz,
  quizQuestions,
  isLeagueModalOpen,
  leagueQuiz,
  isPacingStrategyModalOpen,
  isSpotMistakeOpen,
  setIsSpotMistakeOpen,
  isMathLabOpen,
  setIsMathLabOpen,
  isA11yModalOpen,
  setIsA11yModalOpen,
  isOfflinePackageModalOpen,
  handleStartOfflineQuiz,
}: TestsCatalogViewProps) {
  return (
    <main className="page-surface testler-page min-h-screen gradient-bg pb-20 relative">
      {/* Ambient Glow Mesh */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-tone-info-bg dark:bg-tone-info-bg blur-3xl" />
        <div className="absolute top-48 -right-32 h-96 w-96 rounded-full bg-tone-danger-bg dark:bg-tone-danger-bg blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-tone-warn-bg dark:bg-tone-warn-bg blur-3xl" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-1 py-3 sm:py-4 px-4 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="container mx-auto flex justify-between items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border-2 border-border-strong bg-accent-bg p-0.5 shadow-sm">
              <Image
                src="/ugur.jpeg"
                alt="Uğur Hoca"
                width={44}
                height={44}
                priority
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <span className="font-display text-base sm:text-xl font-bold text-primary truncate">
              Uğur Hoca Matematik
            </span>
          </Link>

          <Link
            href={profileHref}
            className="text-secondary hover:text-primary dark:text-tertiary dark:hover:text-primary flex items-center gap-1.5 text-xs sm:text-base shrink-0 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{user.isAdmin ? 'Admin Panel' : 'Profil'}</span>
          </Link>
        </div>
      </nav>

      <QuizCatalog
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
        user={user}
        startQuiz={startQuiz}
        handleOpenWorksheetPreview={handleOpenWorksheetPreview}
      />
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
        onStartExam={leagueQuiz ? () => startQuiz(leagueQuiz) : undefined}
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
