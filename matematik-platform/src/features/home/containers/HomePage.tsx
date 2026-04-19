'use client';

import dynamic from 'next/dynamic';
import DeferredFloatingShapes from '@/components/DeferredFloatingShapes';
import { useTheme } from '@/components/ThemeProvider';
import { HomeAnnouncementsSection } from '@/features/home/components/HomeAnnouncementsSection';
import { HomeAssignmentsSection } from '@/features/home/components/HomeAssignmentsSection';
import { HomeDailyQuote } from '@/features/home/components/HomeDailyQuote';
import { HomeExamCountdownSection } from '@/features/home/components/HomeExamCountdownSection';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { HomeHeroSection } from '@/features/home/components/HomeHeroSection';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';
import { HomeRecentDocumentsSection } from '@/features/home/components/HomeRecentDocumentsSection';
import { HomeStatsStrip } from '@/features/home/components/HomeStatsStrip';
import type { HomeInitialFeed } from '@/features/home/home-initial-feed';
import { useHomePageData } from '@/features/home/hooks/useHomePageData';

const HomeAnnouncementModal = dynamic(
  () =>
    import('@/features/home/components/HomeAnnouncementModal').then((m) => ({
      default: m.HomeAnnouncementModal,
    })),
  { ssr: false },
);

const HomeGuestCtaSection = dynamic(
  () =>
    import('@/features/home/components/HomeGuestCtaSection').then((m) => ({
      default: m.HomeGuestCtaSection,
    })),
  { ssr: false },
);

const HomeSupportSection = dynamic(
  () =>
    import('@/features/home/components/HomeSupportSection').then((m) => ({
      default: m.HomeSupportSection,
    })),
  { ssr: false, loading: () => <div className="min-h-[14rem]" aria-hidden /> },
);

type HomePageProps = {
  initialFeed?: HomeInitialFeed | null;
};

export default function HomePage({ initialFeed }: HomePageProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
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
      <DeferredFloatingShapes />
      <HomeNavbar user={user} onLogout={handleLogout} />
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-14">
        <HomeHeroSection isLight={isLight} user={user} />
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
        {!user && <HomeGuestCtaSection isLight={isLight} />}
        <HomeSupportSection isLight={isLight} user={user} />
        <HomeFooter isLight={isLight} />
      </div>
      <HomeAnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </main>
  );
}
