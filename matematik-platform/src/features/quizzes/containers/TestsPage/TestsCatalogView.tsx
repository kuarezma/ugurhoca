import type { Dispatch, SetStateAction } from 'react';
import { SitePageNavigation } from '@/components/SitePageNavigation';
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
    <main className="page-surface testler-page min-h-screen gradient-bg pb-24 relative">
      <SitePageNavigation
        accountHref={profileHref}
        accountLabel={user.isAdmin ? 'Admin Panel' : 'Profil'}
      />

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
