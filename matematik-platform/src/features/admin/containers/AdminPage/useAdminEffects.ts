import type { AppUser } from '@/types';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { resolveAdminAuth } from '@/features/admin/queries';
import type { AdminActiveTab } from '@/features/admin/types';

import { GOOGLE_DRIVE_CALLBACK_MESSAGES } from './helpers';

type UseAdminEffectsProps = {
  router: ReturnType<typeof useRouter>;
  adminUserIdRef: RefObject<string | null>;
  setUser: Dispatch<SetStateAction<AppUser | null>>;
  loadData: (adminUserId?: string | null) => Promise<void>;
  refreshGoogleDriveConnection: () => Promise<void>;
  refreshWorksheetSourceStatus: (showFeedback?: boolean) => Promise<void>;
  user: AppUser | null;
  dashboardLoaded: boolean;
  learningActivityStatus: 'error' | 'idle' | 'loading' | 'ready';
  activeTab: AdminActiveTab;
  refreshLearningActivity: () => Promise<void>;
  liveLessonActivityStatus: 'error' | 'idle' | 'loading' | 'ready';
  refreshLiveLessonActivity: () => Promise<void>;
  showToast: ReturnType<typeof useToast>['showToast'];
  refreshUsers: () => Promise<void>;
  activeStudentProfileId: string | null;
  activeStudentProfileUser: AppUser | null;
  loadStudentProfile: (studentId: string) => Promise<void>;
  setIsSpotlightOpen: Dispatch<SetStateAction<boolean>>;
};

export function useAdminEffects({
  router,
  adminUserIdRef,
  setUser,
  loadData,
  refreshGoogleDriveConnection,
  refreshWorksheetSourceStatus,
  user,
  dashboardLoaded,
  learningActivityStatus,
  activeTab,
  refreshLearningActivity,
  liveLessonActivityStatus,
  refreshLiveLessonActivity,
  showToast,
  refreshUsers,
  activeStudentProfileId,
  activeStudentProfileUser,
  loadStudentProfile,
  setIsSpotlightOpen,
}: UseAdminEffectsProps) {
  useEffect(() => {
    const checkAuth = async () => {
      const authResult = await resolveAdminAuth();

      if (authResult.status !== 'ok') {
        router.push(authResult.status === 'unauthenticated' ? '/giris' : '/');
        return;
      }

      adminUserIdRef.current = authResult.user.id;
      setUser(authResult.user);
      await Promise.all([
        loadData(authResult.user.id),
        refreshGoogleDriveConnection(),
        refreshWorksheetSourceStatus(),
      ]);
    };
    void checkAuth();
  }, [
    adminUserIdRef,
    loadData,
    refreshGoogleDriveConnection,
    refreshWorksheetSourceStatus,
    router,
    setUser,
  ]);

  useEffect(() => {
    if (!user || !dashboardLoaded || learningActivityStatus !== 'idle') return;
    if (activeTab === 'tracking' || activeTab === 'classroom') {
      void refreshLearningActivity();
    }
  }, [
    activeTab,
    dashboardLoaded,
    learningActivityStatus,
    refreshLearningActivity,
    user,
  ]);

  useEffect(() => {
    if (!user || !dashboardLoaded || liveLessonActivityStatus !== 'idle')
      return;
    if (activeTab === 'liveLessons') {
      void refreshLiveLessonActivity();
    }
  }, [
    activeTab,
    dashboardLoaded,
    liveLessonActivityStatus,
    refreshLiveLessonActivity,
    user,
  ]);

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    const driveStatus = new URLSearchParams(window.location.search).get(
      'drive',
    );
    if (!driveStatus) return;

    const callbackMessage = GOOGLE_DRIVE_CALLBACK_MESSAGES[driveStatus] ?? {
      message: 'Google Drive bağlantısı tamamlanamadı.',
      type: 'error' as const,
    };

    showToast(callbackMessage.type, callbackMessage.message);

    if (driveStatus === 'connected') {
      void refreshGoogleDriveConnection();
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('drive');
    window.history.replaceState({}, '', url.toString());
  }, [refreshGoogleDriveConnection, showToast, user]);

  // Kullanıcı listesini görünür sekmede periyodik olarak yenile
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      void refreshUsers();
    }, 120000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshUsers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshUsers, user?.id]);

  useEffect(() => {
    if (!activeStudentProfileId || !activeStudentProfileUser) {
      return;
    }

    void loadStudentProfile(activeStudentProfileId);
  }, [activeStudentProfileId, activeStudentProfileUser, loadStudentProfile]);

  // Global Cmd+K / Ctrl+K shortcut for Spotlight search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSpotlightOpen]);
}
