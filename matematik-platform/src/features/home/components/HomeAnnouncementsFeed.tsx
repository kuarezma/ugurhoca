'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { HomeAnnouncementsSection } from '@/features/home/components/HomeAnnouncementsSection';
import type { Announcement } from '@/types';

const HomeAnnouncementModal = dynamic(
  () =>
    import('@/features/home/components/HomeAnnouncementModal').then(
      (module) => ({
        default: module.HomeAnnouncementModal,
      }),
    ),
  { ssr: false },
);

type HomeAnnouncementsFeedProps = {
  announcements: Announcement[];
};

export function HomeAnnouncementsFeed({
  announcements,
}: HomeAnnouncementsFeedProps) {
  const { theme } = useTheme();
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="defer-section">
      <HomeAnnouncementsSection
        announcements={announcements}
        isLight={theme === 'light'}
        onSelectAnnouncement={setSelectedAnnouncement}
      />
      {selectedAnnouncement ? (
        <HomeAnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      ) : null}
    </div>
  );
}
