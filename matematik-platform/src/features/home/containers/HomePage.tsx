'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';
import { HomeAnnouncementsSection } from '@/features/home/components/HomeAnnouncementsSection';
import { HomeAssignmentsSection } from '@/features/home/components/HomeAssignmentsSection';
import { HomeDailyChallenge } from '@/features/home/components/HomeDailyChallenge';
import { HomeDailyGoalWidget } from '@/features/home/components/HomeDailyGoalWidget';
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
import { FormulaFlashcardsModal } from '@/features/programs/components/FormulaFlashcardsModal';
import ScratchpadModal from '@/components/ScratchpadModal';
import type { HomeInitialFeed } from '@/features/home/home-initial-feed';
import { useHomePageData } from '@/features/home/hooks/useHomePageData';
import type { LiveLesson } from '@/features/live-lessons/types';
import Link from 'next/link';

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

type HomePageProps = {
  activeLiveLesson?: LiveLesson | null;
  initialFeed?: HomeInitialFeed | null;
};

export default function HomePage({ activeLiveLesson, initialFeed }: HomePageProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [calculatorState, setCalculatorState] = useState<{
    isOpen: boolean;
    tab: 'lgs' | 'yks';
  }>({ isOpen: false, tab: 'lgs' });
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isProofsOpen, setIsProofsOpen] = useState(false);

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
      }
    }

    return () => window.removeEventListener('ugurhoca:open-tool', handleToolEvent);
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
        <Link
          href={`/canli-ders/d/${activeLiveLesson.room_id}`}
          className="fixed right-4 top-[calc(4.75rem+env(safe-area-inset-top))] z-40 inline-flex max-w-[calc(100vw-2rem)] animate-pulse items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_0_8px_rgba(220,38,38,0.16),0_18px_35px_-18px_rgba(220,38,38,0.9)] ring-1 ring-white/30 transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:right-6"
          aria-label={`${activeLiveLesson.title} canlı dersine katıl`}
        >
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
          <span className="truncate">Şu an ders var</span>
        </Link>
      ) : null}
      <div className="pt-[calc(4.5rem+env(safe-area-inset-top))] md:pt-20">
        <HomeHeroSection isLight={isLight} user={user} />
        <HomeDailyChallenge isLight={isLight} />
        <HomeDailyGoalWidget isLight={isLight} />
        <HomeQuickToolsGrid
          isLight={isLight}
          onOpenFlashcards={() => setIsFlashcardsOpen(true)}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
          onOpenCalculator={() => setCalculatorState({ isOpen: true, tab: 'lgs' })}
          onOpenPomodoro={() => setIsPomodoroOpen(true)}
          onOpenChecklist={() => setIsChecklistOpen(true)}
          onOpenGraph={() => setIsGraphOpen(true)}
          onOpenProofs={() => setIsProofsOpen(true)}
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
          onOpenCalculator={(tab) => setCalculatorState({ isOpen: true, tab })}
        />
        <div className="defer-section">
          <HomeAssignmentsSection
            assignments={visibleAssignments}
            isLight={isLight}
            onDismissAll={handleDismissAllAssignments}
            onDismissAssignment={handleDismissAssignment}
          />
        </div>
        <HomeRecentDocumentsSection documents={documents} isLight={isLight} />
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
    </main>
  );
}
