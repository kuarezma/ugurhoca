'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';
import { HomeAnnouncementsSection } from '@/features/home/components/HomeAnnouncementsSection';
import { HomeDailyQuote } from '@/features/home/components/HomeDailyQuote';
import { HomeExamCountdownSection } from '@/features/home/components/HomeExamCountdownSection';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { HomeHeroSection } from '@/features/home/components/HomeHeroSection';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';
import { HomeSuccessRoadmap } from '@/features/home/components/HomeSuccessRoadmap';
import { HomeSupportSection } from '@/features/home/components/HomeSupportSection';
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
    import('@/features/programs/components/FormulaFlashcardsModal').then((m) => ({
      default: m.FormulaFlashcardsModal,
    })),
  { ssr: false },
);

const ScratchpadModal = dynamic(() => import('@/components/ScratchpadModal'), {
  ssr: false,
});

const ExamTopicWeightMatrixModal = dynamic(
  () =>
    import('@/features/programs/components/ExamTopicWeightMatrixModal').then((m) => ({
      default: m.ExamTopicWeightMatrixModal,
    })),
  { ssr: false },
);

const PrintableWeeklyPlannerModal = dynamic(
  () =>
    import('@/features/programs/components/PrintableWeeklyPlannerModal').then((m) => ({
      default: m.PrintableWeeklyPlannerModal,
    })),
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

export default function HomePage({ activeLiveLesson, initialFeed }: HomePageProps) {
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

  useEffect(() => {
    const handleToolEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ tool: string; tab?: 'lgs' | 'yks' }>;
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
        setCalculatorState({ isOpen: true, tab: (params.get('tab') as 'lgs' | 'yks') || 'lgs' });
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
    }

    return () => window.removeEventListener('ugurhoca:open-tool', handleToolEvent);
  }, []);

  const {
    announcements,
    handleLogout,
    selectedAnnouncement,
    setSelectedAnnouncement,
    user,
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
        {/* 1. Karşılama Ekranı (Hero - Hızlı Erişim ve Açılır 12 Araç Kartı) */}
        <HomeHeroSection
          isLight={isLight}
          user={user}
          onOpenFlashcards={() => setIsFlashcardsOpen(true)}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
          onOpenCalculator={(tab) =>
            setCalculatorState({ isOpen: true, tab: tab || 'lgs' })
          }
          onOpenPomodoro={() => setIsPomodoroOpen(true)}
          onOpenGraph={() => setIsGraphOpen(true)}
          onOpenProofs={() => setIsProofsOpen(true)}
          onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
          onOpenTopicWeights={() => setIsTopicWeightsOpen(true)}
          onOpenWeeklyPlanner={() => setIsWeeklyPlannerOpen(true)}
          onOpenSpeedDrill={() => setIsSpeedDrillOpen(true)}
        />

        {/* 2. Duyurular */}
        <div className="defer-section">
          <HomeAnnouncementsSection
            announcements={announcements}
            isLight={isLight}
            onSelectAnnouncement={setSelectedAnnouncement}
          />
        </div>

        {/* 3. Başarı Yol Haritası (Duyuruların Altında) */}
        <div className="defer-section">
          <HomeSuccessRoadmap
            isLight={isLight}
            onOpenFlashcards={() => setIsFlashcardsOpen(true)}
          />
        </div>

        {/* 4. LGS ve YKS Sayacı */}
        <HomeExamCountdownSection
          isLight={isLight}
          onOpenCalculator={(tab) => setCalculatorState({ isOpen: true, tab })}
          userGrade={user?.grade}
        />

        {/* 5. Günün Sözü */}
        <div className="defer-section">
          <HomeDailyQuote isLight={isLight} />
        </div>

        {/* 6. Uğur Hoca'ya Yaz */}
        <div className="defer-section">
          <HomeSupportSection isLight={isLight} user={user} />
        </div>

        {/* 7. Footer */}
        <div className="defer-section">
          <HomeFooter isLight={isLight} />
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
          onClose={() => setCalculatorState((prev) => ({ ...prev, isOpen: false }))}
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
