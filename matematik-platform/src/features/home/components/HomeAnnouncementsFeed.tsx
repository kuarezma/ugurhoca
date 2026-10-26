'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { HomeAnnouncementsSection } from '@/features/home/components/HomeAnnouncementsSection';
import { isNewContent } from '@/features/home/queries';
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
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const autoOpenedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const latest = announcements[0];
    if (
      latest &&
      isNewContent(latest.created_at) &&
      autoOpenedIdRef.current !== latest.id
    ) {
      autoOpenedIdRef.current = latest.id;
      setSelectedAnnouncement(latest);
    }
  }, [announcements]);

  if (announcements.length === 0) {
    return null;
  }

  return (
    <>
      <div className="defer-section">
        <HomeAnnouncementsSection
          announcements={announcements}
          onSelectAnnouncement={setSelectedAnnouncement}
        />
      </div>
      {selectedAnnouncement ? (
        <HomeAnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      ) : null}
    </>
  );
}
