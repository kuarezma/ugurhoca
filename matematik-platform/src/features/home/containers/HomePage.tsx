'use client';

import { useTheme } from '@/components/ThemeProvider';
import FloatingShapes from '@/components/FloatingShapes';
import { HomeAnnouncementModal } from '@/features/home/components/HomeAnnouncementModal';
import { HomeAnnouncementsSection } from '@/features/home/components/HomeAnnouncementsSection';
import { HomeAssignmentsSection } from '@/features/home/components/HomeAssignmentsSection';
import { HomeExamCountdownSection } from '@/features/home/components/HomeExamCountdownSection';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { HomeGuestCtaSection } from '@/features/home/components/HomeGuestCtaSection';
import { HomeHeroSection } from '@/features/home/components/HomeHeroSection';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';
import { HomeRecentDocumentsSection } from '@/features/home/components/HomeRecentDocumentsSection';
import { HomeSupportSection } from '@/features/home/components/HomeSupportSection';
import { useHomePageData } from '@/features/home/hooks/useHomePageData';

export default function HomePage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const {
    announcements,
    documents,
    handleDismissAllAssignments,
    handleDismissAssignment,
    handleLogout,
    handleSupportSubmit,
    removeSupportAttachment,
    selectedAnnouncement,
    setSelectedAnnouncement,
    setSupportMessage,
    supportAttachments,
    supportMessage,
    supportSending,
    supportSent,
    uploadSupportAttachments,
    user,
    visibleAssignments,
  } = useHomePageData();

  return (
    <main
      className={`relative min-h-screen ${
        isLight
          ? 'bg-white light-atmosphere'
          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800'
      }`}
    >
      <FloatingShapes />
      <HomeNavbar user={user} onLogout={handleLogout} />
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-14">
        <HomeHeroSection isLight={isLight} />
        <HomeAnnouncementsSection
          announcements={announcements}
          isLight={isLight}
          onSelectAnnouncement={setSelectedAnnouncement}
        />
        <HomeExamCountdownSection isLight={isLight} />
        <HomeAssignmentsSection
          assignments={visibleAssignments}
          isLight={isLight}
          onDismissAll={handleDismissAllAssignments}
          onDismissAssignment={handleDismissAssignment}
        />
        <HomeRecentDocumentsSection documents={documents} isLight={isLight} />
        {!user && <HomeGuestCtaSection isLight={isLight} />}
        <HomeSupportSection
          isLight={isLight}
          onRemoveSupportAttachment={removeSupportAttachment}
          onSubmit={handleSupportSubmit}
          onSupportMessageChange={setSupportMessage}
          onUploadSupportAttachments={uploadSupportAttachments}
          supportAttachments={supportAttachments}
          supportMessage={supportMessage}
          supportSending={supportSending}
          supportSent={supportSent}
          user={user}
        />
        <HomeFooter isLight={isLight} />
      </div>
      <HomeAnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </main>
  );
}
