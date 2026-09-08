'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUserProfile,
  redirectToHome,
  signOutClient,
} from '@/lib/auth-client';
import type { AppUser } from '@/types';

/**
 * Ana sayfanın ihtiyaç duyduğu istemci verisi.
 *
 * Not: Bu hook eskiden ayrıca son dokümanları (`fetchHomeDocuments`), kullanıcı
 * ödevlerini (`fetchUserAssignments` — `shared_documents` + `notifications` üzerinde
 * limitsiz iki sorgu) çekiyor ve `documents` tablosu için bir realtime kanalı açıyordu.
 * Ana sayfa bu üçünü de render etmiyor (HomeRecentDocumentsSection ve
 * HomeAssignmentsSection hiçbir yerde mount edilmiyor), dolayısıyla her ziyarette
 * boşuna sorgu ve websocket maliyeti ödeniyordu. Duyurular artık kendi server
 * bileşeni içinde stream edildiği için bu hook yalnızca oturum profilini yönetir.
 */
export const useHomePageData = () => {
  const router = useRouter();

  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    let isDisposed = false;

    const loadPage = async () => {
      const profileResult = await getCurrentUserProfile({
        redirectToLogin: false,
      });

      if (isDisposed) {
        return;
      }

      setUser(profileResult ? profileResult.profile : null);
    };

    void loadPage();

    return () => {
      isDisposed = true;
    };
  }, []);

  const handleLogout = async () => {
    await signOutClient();
    setUser(null);
    redirectToHome(router);
  };

  return {
    handleLogout,
    user,
  };
};
