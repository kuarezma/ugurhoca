'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';
import { HomeAnnouncementsSection } from '@/features/home/components/HomeAnnouncementsSection';
import { HomeAssignmentsSection } from '@/features/home/components/HomeAssignmentsSection';
import { HomeDailyChallenge } from '@/features/home/components/HomeDailyChallenge';
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

type HomePageProps = {
  activeLiveLesson?: LiveLesson | null;
  initialFeed?: HomeInitialFeed | null;
};

export default function HomePage({ activeLiveLesson, initialFeed }: HomePageProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
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
      className={`home-page relative min-h-screen ${
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
        <HomeQuickToolsGrid
          isLight={isLight}
          onOpenFlashcards={() => setIsFlashcardsOpen(true)}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
        />
        <HomeSuccessRoadmap
          isLight={isLight}
          onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        />
        <HomeStatsStrip isLight={isLight} stats={initialFeed?.stats} />
        <HomeAnnouncementsSection
          announcements={announcements}
          isLight={isLight}
          onSelectAnnouncement={setSelectedAnnouncement}
        />
        <HomeDailyQuote isLight={isLight} />
        <HomeExamCountdownSection isLight={isLight} />
        <HomeAssignmentsSection
          assignments={visibleAssignments}
          isLight={isLight}
          onDismissAll={handleDismissAllAssignments}
          onDismissAssignment={handleDismissAssignment}
        />
        <HomeRecentDocumentsSection documents={documents} isLight={isLight} />
        {!user && <HomeHowItWorksSection isLight={isLight} />}
        {!user && <HomeGuestCtaSection isLight={isLight} />}
        <HomeSupportSection isLight={isLight} user={user} />
        <HomeFooter isLight={isLight} />
      </div>
      <HomeAnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
      <FormulaFlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
      />
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />
    </main>
  );
}
