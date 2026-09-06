'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUserProfile,
  redirectToHome,
  signOutClient,
} from '@/lib/auth-client';
import type { Announcement, AppUser } from '@/types';
import type { HomeInitialFeed } from '@/features/home/home-initial-feed';
import { fetchAnnouncements } from '@/features/home/queries';

/**
 * Ana sayfanın ihtiyaç duyduğu istemci verisi.
 *
 * Not: Bu hook eskiden ayrıca son dokümanları (`fetchHomeDocuments`), kullanıcı
 * ödevlerini (`fetchUserAssignments` — `shared_documents` + `notifications` üzerinde
 * limitsiz iki sorgu) çekiyor ve `documents` tablosu için bir realtime kanalı açıyordu.
 * Ana sayfa bu üçünü de render etmiyor (HomeRecentDocumentsSection ve
 * HomeAssignmentsSection hiçbir yerde mount edilmiyor), dolayısıyla her ziyarette
 * boşuna sorgu ve websocket maliyeti ödeniyordu. Yalnızca gösterilen veri çekiliyor.
 */
export const useHomePageData = (initialFeed?: HomeInitialFeed | null) => {
  const isFeedSeeded = Boolean(initialFeed);
  const router = useRouter();

  const [user, setUser] = useState<AppUser | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    initialFeed?.announcements ?? [],
  );
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  useEffect(() => {
    let isDisposed = false;

    const loadPage = async () => {
      const [profileResult, feed] = await Promise.all([
        getCurrentUserProfile({ redirectToLogin: false }),
        isFeedSeeded ? Promise.resolve(null) : fetchAnnouncements(),
      ]);

      if (isDisposed) {
        return;
      }

      if (feed) {
        setAnnouncements(feed);
      }

      setUser(profileResult ? profileResult.profile : null);
    };

    void loadPage();

    return () => {
      isDisposed = true;
    };
  }, [isFeedSeeded]);

  const handleLogout = async () => {
    await signOutClient();
    setUser(null);
    redirectToHome(router);
  };

  return {
    announcements,
    handleLogout,
    selectedAnnouncement,
    setSelectedAnnouncement,
    user,
  };
};
