'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';
import { HomeAnnouncementsSection } from '@/features/home/components/HomeAnnouncementsSection';
import { HomeAssignmentsSection } from '@/features/home/components/HomeAssignmentsSection';
import { HomeDailyChallenge } from '@/features/home/components/HomeDailyChallenge';
import { HomeDailyGoalWidget } from '@/features/home/components/HomeDailyGoalWidget';
import { LgsTacticsCorner } from '@/features/home/components/LgsTacticsCorner';
import { HomeDailyQuote } from '@/features/home/components/HomeDailyQuote';
import { HomeExamCountdownSection } from '@/features/home/components/HomeExamCountdownSection';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { HomeHeroSection } from '@/features/home/components/HomeHeroSection';
import { HomeHowItWorksSection } from '@/features/home/components/HomeHowItWorksSection';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';
import { HomeQuickToolsGrid } from '@/features/home/components/HomeQuickToolsGrid';
import { HomeRecentDocumentsSection } from '@/features/home/components/HomeRecentDocumentsSection';
import { HomeStatsStrip } from '@/features/home/components/HomeStatsStrip';
import { HomeSuccessRoadmap } from '@/features/home/components/HomeSuccessRoadmap';
import { HomeGuestCtaSection } from '@/features/home/components/HomeGuestCtaSection';
import { HomeSupportSection } from '@/features/home/components/HomeSupportSection';
import { HomeCategoryHub } from '@/features/home/components/HomeCategoryHub';
import type { HomeInitialFeed } from '@/features/home/home-initial-feed';
import { useHomePageData } from '@/features/home/hooks/useHomePageData';
import type { LiveLesson } from '@/features/live-lessons/types';
import { SafeLink } from '@/components/SafeLink';

const HomeAnnouncementModal = dynamic(
  () =>
    import('@/features/home/components/HomeAnnouncementModal').then((m) => ({
      default: m.HomeAnnouncementModal,
    })),
  { ssr: false },
);

const ExamScoreCalculatorModal = dynamic(
  () =>
    import('@/components/ExamScoreCalculatorModal').then((m) => ({
      default: m.ExamScoreCalculatorModal,
    })),
  { ssr: false },
);

const FocusPomodoroModal = dynamic(
  () =>
    import('@/components/FocusPomodoroModal').then((m) => ({
      default: m.FocusPomodoroModal,
    })),
  { ssr: false },
);

const TopicChecklistModal = dynamic(
  () =>
    import('@/features/programs/components/TopicChecklistModal').then((m) => ({
      default: m.TopicChecklistModal,
    })),
  { ssr: false },
);

const MathGraphVisualizerModal = dynamic(
  () =>
    import('@/components/MathGraphVisualizerModal').then((m) => ({
      default: m.MathGraphVisualizerModal,
    })),
  { ssr: false },
);

const VisualMathProofsModal = dynamic(
  () =>
    import('@/components/VisualMathProofsModal').then((m) => ({
      default: m.VisualMathProofsModal,
    })),
  { ssr: false },
);

const QuickFormulaCheatSheetModal = dynamic(
  () =>
    import('@/components/QuickFormulaCheatSheetModal').then((m) => ({
      default: m.QuickFormulaCheatSheetModal,
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

const FormulaFlashcardsModal = dynamic(
  () =>
    import('@/features/programs/components/FormulaFlashcardsModal').then(
      (m) => ({
        default: m.FormulaFlashcardsModal,
      }),
    ),
  { ssr: false },
);

const ScratchpadModal = dynamic(() => import('@/components/ScratchpadModal'), {
  ssr: false,
});

const ExamTopicWeightMatrixModal = dynamic(
  () =>
    import('@/features/programs/components/ExamTopicWeightMatrixModal').then(
      (m) => ({
        default: m.ExamTopicWeightMatrixModal,
      }),
    ),
  { ssr: false },
);

const PrintableWeeklyPlannerModal = dynamic(
  () =>
    import('@/features/programs/components/PrintableWeeklyPlannerModal').then(
      (m) => ({
        default: m.PrintableWeeklyPlannerModal,
      }),
    ),
  { ssr: false },
);

const FormulaSpeedDrillModal = dynamic(
  () => import('@/features/programs/components/FormulaSpeedDrillModal'),
  { ssr: false },
);

type HomePageProps = {
  activeLiveLesson?: LiveLesson | null;
  initialFeed?: HomeInitialFeed | null;
};

export default function HomePage({
  activeLiveLesson,
  initialFeed,
}: HomePageProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isSpeedDrillOpen, setIsSpeedDrillOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [calculatorState, setCalculatorState] = useState<{
    isOpen: boolean;
    tab: 'lgs' | 'yks';
  }>({ isOpen: false, tab: 'lgs' });
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isProofsOpen, setIsProofsOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isTopicWeightsOpen, setIsTopicWeightsOpen] = useState(false);
  const [isWeeklyPlannerOpen, setIsWeeklyPlannerOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'categorized' | 'classic'>(
    'categorized',
  );

  useEffect(() => {
    const handleToolEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        tool: string;
        tab?: 'lgs' | 'yks';
      }>;
      const tool = customEvent.detail?.tool;
      if (tool === 'calculator') {
        setCalculatorState({
          isOpen: true,
          tab: customEvent.detail?.tab || 'lgs',
        });
      } else if (tool === 'pomodoro') {
        setIsPomodoroOpen(true);
      } else if (tool === 'checklist') {
        setIsChecklistOpen(true);
      } else if (tool === 'graph') {
        setIsGraphOpen(true);
      } else if (tool === 'proofs') {
        setIsProofsOpen(true);
      } else if (tool === 'flashcards') {
        setIsFlashcardsOpen(true);
      } else if (tool === 'scratchpad') {
        setIsScratchpadOpen(true);
      } else if (tool === 'cheat-sheet' || tool === 'formulas') {
        setIsCheatSheetOpen(true);
      } else if (tool === 'glossary') {
        setIsGlossaryOpen(true);
      } else if (tool === 'topic-weights' || tool === 'weights') {
        setIsTopicWeightsOpen(true);
      } else if (tool === 'weekly-planner' || tool === 'planner') {
        setIsWeeklyPlannerOpen(true);
      } else if (tool === 'speed-drill' || tool === 'drill') {
        setIsSpeedDrillOpen(true);
      }
    };

    window.addEventListener('ugurhoca:open-tool', handleToolEvent);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get('tool');
      if (toolParam === 'calculator') {
        setCalculatorState({
          isOpen: true,
          tab: (params.get('tab') as 'lgs' | 'yks') || 'lgs',
        });
      } else if (toolParam === 'pomodoro') {
        setIsPomodoroOpen(true);
      } else if (toolParam === 'checklist') {
        setIsChecklistOpen(true);
      } else if (toolParam === 'flashcards') {
        setIsFlashcardsOpen(true);
      } else if (toolParam === 'cheat-sheet' || toolParam === 'formulas') {
        setIsCheatSheetOpen(true);
      } else if (toolParam === 'speed-drill' || toolParam === 'drill') {
        setIsSpeedDrillOpen(true);
      }

      const layoutParam = params.get('layout') || params.get('view');
      if (layoutParam === 'classic') {
        setLayoutMode('classic');
      }
    }

    return () =>
      window.removeEventListener('ugurhoca:open-tool', handleToolEvent);
  }, []);

  const {
    announcements,
    documents,
    handleDismissAllAssignments,
    handleDismissAssignment,
    handleLogout,
    selectedAnnouncement,
    setSelectedAnnouncement,
    user,
    visibleAssignments,
  } = useHomePageData(initialFeed);

  return (
    <main
      className={`home-page relative min-h-screen overflow-x-clip ${
        isLight
          ? 'bg-white light-atmosphere'
          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800'
      }`}
    >
      <HomeNavbar user={user} onLogout={handleLogout} />
      {activeLiveLesson ? (
        <SafeLink
          href={`/canli-ders/d/${activeLiveLesson.room_id}`}
          className="fixed right-4 top-[calc(4.75rem+env(safe-area-inset-top))] z-40 inline-flex max-w-[calc(100vw-2rem)] animate-pulse items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_0_8px_rgba(220,38,38,0.16),0_18px_35px_-18px_rgba(220,38,38,0.9)] ring-1 ring-white/30 transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:right-6"
          aria-label={`${activeLiveLesson.title} canlı dersine katıl`}
        >
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
          <span className="truncate">Şu an ders var</span>
        </SafeLink>
      ) : null}
      <div className="pt-[calc(4.5rem+env(safe-area-inset-top))] md:pt-20">
        {layoutMode === 'categorized' ? (
          <>
            {/* 1. En üstteki Karşılama Ekranı */}
            <HomeHeroSection
              isLight={isLight}
              user={user}
              showQuickAccess={false}
            />

            {/* 2. Kategoriler Bölümü: Dersler, Oyun, Araçlar */}
            <HomeCategoryHub
              isLight={isLight}
              user={user}
              documents={documents}
              visibleAssignments={visibleAssignments}
              onDismissAllAssignments={handleDismissAllAssignments}
              onDismissAssignment={handleDismissAssignment}
              onOpenFlashcards={() => setIsFlashcardsOpen(true)}
              onOpenScratchpad={() => setIsScratchpadOpen(true)}
              onOpenCalculator={() =>
                setCalculatorState({ isOpen: true, tab: 'lgs' })
              }
              onOpenPomodoro={() => setIsPomodoroOpen(true)}
              onOpenChecklist={() => setIsChecklistOpen(true)}
              onOpenGraph={() => setIsGraphOpen(true)}
              onOpenProofs={() => setIsProofsOpen(true)}
              onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
              onOpenGlossary={() => setIsGlossaryOpen(true)}
              onOpenTopicWeights={() => setIsTopicWeightsOpen(true)}
              onOpenWeeklyPlanner={() => setIsWeeklyPlannerOpen(true)}
              onOpenSpeedDrill={() => setIsSpeedDrillOpen(true)}
            />

            {/* 3. Duyurular */}
            <div className="defer-section">
              <HomeAnnouncementsSection
                announcements={announcements}
                isLight={isLight}
                onSelectAnnouncement={setSelectedAnnouncement}
              />
            </div>

            {/* 4. LGS ve YKS Sayacı */}
            <HomeExamCountdownSection
              isLight={isLight}
              onOpenCalculator={(tab) =>
                setCalculatorState({ isOpen: true, tab })
              }
              userGrade={user?.grade}
            />

            {/* 5. Günün Sözü */}
            <div className="defer-section">
              <HomeDailyQuote isLight={isLight} />
            </div>

            {/* İstatistikler */}
            <div className="defer-section">
              <HomeStatsStrip isLight={isLight} stats={initialFeed?.stats} />
            </div>

            {!user && (
              <div className="defer-section">
                <HomeHowItWorksSection isLight={isLight} />
              </div>
            )}
            {!user && (
              <div className="defer-section">
                <HomeGuestCtaSection isLight={isLight} />
              </div>
            )}

            {/* 6. En altta Uğur Hoca'ya Yaz Bölümü */}
            <div className="defer-section">
              <HomeSupportSection isLight={isLight} user={user} />
            </div>

            {/* 7. Footer */}
            <div className="defer-section">
              <HomeFooter isLight={isLight} />
            </div>
          </>
        ) : (
          /* Geri Alınabilir Klasik Düzen */
          <>
            <HomeHeroSection
              isLight={isLight}
              user={user}
              showQuickAccess={true}
            />
            <HomeDailyChallenge isLight={isLight} />
            <HomeDailyGoalWidget isLight={isLight} />
            <LgsTacticsCorner isLight={isLight} />
            <HomeQuickToolsGrid
              isLight={isLight}
              onOpenFlashcards={() => setIsFlashcardsOpen(true)}
              onOpenScratchpad={() => setIsScratchpadOpen(true)}
              onOpenCalculator={() =>
                setCalculatorState({ isOpen: true, tab: 'lgs' })
              }
              onOpenPomodoro={() => setIsPomodoroOpen(true)}
              onOpenChecklist={() => setIsChecklistOpen(true)}
              onOpenGraph={() => setIsGraphOpen(true)}
              onOpenProofs={() => setIsProofsOpen(true)}
              onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
              onOpenGlossary={() => setIsGlossaryOpen(true)}
              onOpenTopicWeights={() => setIsTopicWeightsOpen(true)}
              onOpenWeeklyPlanner={() => setIsWeeklyPlannerOpen(true)}
              onOpenSpeedDrill={() => setIsSpeedDrillOpen(true)}
            />
            <div className="defer-section">
              <HomeSuccessRoadmap
                isLight={isLight}
                onOpenFlashcards={() => setIsFlashcardsOpen(true)}
              />
            </div>
            <div className="defer-section">
              <HomeStatsStrip isLight={isLight} stats={initialFeed?.stats} />
            </div>
            <div className="defer-section">
              <HomeAnnouncementsSection
                announcements={announcements}
                isLight={isLight}
                onSelectAnnouncement={setSelectedAnnouncement}
              />
            </div>
            <div className="defer-section">
              <HomeDailyQuote isLight={isLight} />
            </div>
            <HomeExamCountdownSection
              isLight={isLight}
              onOpenCalculator={(tab) =>
                setCalculatorState({ isOpen: true, tab })
              }
              userGrade={user?.grade}
            />
            <div className="defer-section">
              <HomeAssignmentsSection
                assignments={visibleAssignments}
                isLight={isLight}
                onDismissAll={handleDismissAllAssignments}
                onDismissAssignment={handleDismissAssignment}
              />
            </div>
            <HomeRecentDocumentsSection
              documents={documents}
              isLight={isLight}
            />
            {!user && (
              <div className="defer-section">
                <HomeHowItWorksSection isLight={isLight} />
              </div>
            )}
            {!user && (
              <div className="defer-section">
                <HomeGuestCtaSection isLight={isLight} />
              </div>
            )}
            <div className="defer-section">
              <HomeSupportSection isLight={isLight} user={user} />
            </div>
            <div className="defer-section">
              <HomeFooter isLight={isLight} />
            </div>
          </>
        )}

        {/* Canlı Görünüm Değiştirici Buton (Kullanıcıya tek tıkla eski ve yeni hali kıyaslama ve geri alma imkanı) */}
        <div className="pb-8 pt-2 text-center">
          <button
            type="button"
            onClick={() =>
              setLayoutMode((prev) =>
                prev === 'categorized' ? 'classic' : 'categorized',
              )
            }
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300/80 shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10'
            }`}
          >
            <span>
              {layoutMode === 'categorized'
                ? '🔄 Klasik (Uzun) Görünüme Geç'
                : '✨ Yeni Kategori Düzenine Geç'}
            </span>
          </button>
        </div>
      </div>
      {selectedAnnouncement ? (
        <HomeAnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      ) : null}
      {isFlashcardsOpen ? (
        <FormulaFlashcardsModal
          isOpen={isFlashcardsOpen}
          onClose={() => setIsFlashcardsOpen(false)}
        />
      ) : null}
      {isScratchpadOpen ? (
        <ScratchpadModal
          isOpen={isScratchpadOpen}
          onClose={() => setIsScratchpadOpen(false)}
        />
      ) : null}
      {calculatorState.isOpen ? (
        <ExamScoreCalculatorModal
          isOpen={calculatorState.isOpen}
          initialTab={calculatorState.tab}
          onClose={() =>
            setCalculatorState((prev) => ({ ...prev, isOpen: false }))
          }
        />
      ) : null}
      {isPomodoroOpen ? (
        <FocusPomodoroModal
          isOpen={isPomodoroOpen}
          onClose={() => setIsPomodoroOpen(false)}
        />
      ) : null}
      {isChecklistOpen ? (
        <TopicChecklistModal
          isOpen={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
        />
      ) : null}
      {isGraphOpen ? (
        <MathGraphVisualizerModal
          isOpen={isGraphOpen}
          onClose={() => setIsGraphOpen(false)}
          isLight={isLight}
        />
      ) : null}
      {isProofsOpen ? (
        <VisualMathProofsModal
          isOpen={isProofsOpen}
          onClose={() => setIsProofsOpen(false)}
          isLight={isLight}
        />
      ) : null}
      {isCheatSheetOpen ? (
        <QuickFormulaCheatSheetModal
          isOpen={isCheatSheetOpen}
          onClose={() => setIsCheatSheetOpen(false)}
          isLight={isLight}
        />
      ) : null}
      {isGlossaryOpen ? (
        <MathGlossaryModal
          isOpen={isGlossaryOpen}
          onClose={() => setIsGlossaryOpen(false)}
          isLight={isLight}
        />
      ) : null}
      {isTopicWeightsOpen ? (
        <ExamTopicWeightMatrixModal
          isOpen={isTopicWeightsOpen}
          onClose={() => setIsTopicWeightsOpen(false)}
        />
      ) : null}
      {isWeeklyPlannerOpen ? (
        <PrintableWeeklyPlannerModal
          isOpen={isWeeklyPlannerOpen}
          onClose={() => setIsWeeklyPlannerOpen(false)}
        />
      ) : null}
      {isSpeedDrillOpen ? (
        <FormulaSpeedDrillModal
          isOpen={isSpeedDrillOpen}
          onClose={() => setIsSpeedDrillOpen(false)}
          onOpenFlashcards={() => {
            setIsSpeedDrillOpen(false);
            setIsFlashcardsOpen(true);
          }}
        />
      ) : null}
    </main>
  );
}
