'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { signOutClient } from '@/lib/auth-client';
import { useTheme } from '@/components/ThemeProvider';
import NotesSection from '@/components/NotesSection';
import DashboardHero from '@/components/dashboard/DashboardHero';
import { quickActionIcons } from '@/components/dashboard/QuickActionGrid';
import DashboardSettings from '@/components/dashboard/DashboardSettings';
import { Skeleton } from '@/components/ui/Skeleton';
import ProfileNotificationsPanel from '@/features/profile/components/ProfileNotificationsPanel';
import {
  getSavedMistakes,
  getDueMistakes,
} from '@/features/quizzes/lib/mistakeStorage';
import { syncMistakesWithCloud } from '@/features/quizzes/lib/mistakeSync';
import { useDailyStreakTouch } from '@/features/profile/hooks/useDailyStreakTouch';
import { useProfileDashboardData } from '@/features/profile/hooks/useProfileDashboardData';
import {
  completeWeeklyPlanItem,
  updateProfileAvatar,
  uploadProfileAvatar,
} from '@/features/profile/queries';
import type {
  InitialProfileDashboardData,
  ProfileWeeklyPlanItem,
} from '@/features/profile/types';
import { buildProfileDashboardViewModel } from '@/features/profile/utils/dashboard-view-model';
import type {
  DashboardAction,
  DashboardAssignment,
  DashboardNotification,
  DashboardUpdateItem,
} from '@/types/dashboard';
import { ProfileNav } from './ProfilePage/ProfileNav';
import { AdminProfileHero } from './ProfilePage/AdminProfileHero';
import {
  ProfileTabButtons,
  type ProfileTab,
} from './ProfilePage/ProfileTabButtons';
import { ProfileOverviewTab } from './ProfilePage/ProfileOverviewTab';
import { ProfileFeatureModals } from './ProfilePage/ProfileFeatureModals';

const WelcomeTour = dynamic(
  () => import('@/components/dashboard/WelcomeTour'),
  { ssr: false },
);

type ProfilePageProps = {
  initialData?: InitialProfileDashboardData;
};

export default function ProfilePage({ initialData }: ProfilePageProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<DashboardAssignment | null>(null);
  const [selectedMessage, setSelectedMessage] =
    useState<DashboardNotification | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [visitedTabs, setVisitedTabs] = useState<Set<ProfileTab>>(
    () => new Set<ProfileTab>([activeTab]),
  );

  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  const router = useRouter();
  const { theme } = useTheme();
  const isLightNav = theme === 'light';

  const {
    assignments,
    availableQuizzes,
    badges,
    goal,
    loading,
    markAllAsRead,
    markAsRead,
    notifications,
    progressRows,
    quizResults,
    setWeeklyPlans,
    setUser,
    sharedDocs,
    studySessions,
    submissions,
    user,
    weeklyPlans,
    weeklyWorksheet,
  } = useProfileDashboardData(router, initialData);

  useDailyStreakTouch(user?.id, user?.isAdmin);

  const handleLogout = async () => {
    await signOutClient();
    router.push('/');
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;
  const latestNotification = notifications[0] || null;

  const [pendingMistakesCount, setPendingMistakesCount] = useState(0);
  const [dueMistakesCount, setDueMistakesCount] = useState(0);
  const [isParentReportOpen, setIsParentReportOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isAhaModalOpen, setIsAhaModalOpen] = useState(false);
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState(false);
  const [isAuthoringModalOpen, setIsAuthoringModalOpen] = useState(false);
  const [isFeynmanModalOpen, setIsFeynmanModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    try {
      const list = getSavedMistakes();
      setPendingMistakesCount(list.filter((m) => !m.mastered).length);
      const dueList = getDueMistakes();
      setDueMistakesCount(dueList.length);

      void syncMistakesWithCloud(user?.id)
        .then((res) => {
          if (!active || !res.success || !res.mistakes) return;
          setPendingMistakesCount(
            res.mistakes.filter((m) => !m.mastered).length,
          );
          const today = new Date().toISOString().split('T')[0];
          setDueMistakesCount(
            res.mistakes.filter(
              (m) =>
                !m.mastered && (!m.nextReviewDate || m.nextReviewDate <= today),
            ).length,
          );
        })
        .catch(() => {});
    } catch {
      // ignore
    }

    return () => {
      active = false;
    };
  }, [user?.id]);

  const {
    focusTopic,
    goalSnapshot,
    latestQuizScore,
    motivationMessage,
    pendingAssignments,
    primaryTask,
    recentBadges,
    strongTopic,
    tasks,
    updates,
  } = useMemo(
    () =>
      buildProfileDashboardViewModel({
        assignments,
        availableQuizzes,
        badges,
        dueMistakesCount,
        goal,
        notifications,
        progressRows,
        quizResults,
        sharedDocs,
        studySessions,
        submissions,
        user,
        weeklyWorksheet,
      }),
    [
      assignments,
      availableQuizzes,
      badges,
      dueMistakesCount,
      goal,
      notifications,
      progressRows,
      quizResults,
      sharedDocs,
      studySessions,
      submissions,
      user,
      weeklyWorksheet,
    ],
  );

  const unreadMessageNotification =
    notifications.find(
      (notification) =>
        !notification.is_read &&
        (notification.type === 'message' ||
          notification.type === 'admin-message'),
    ) || null;

  const handleNotificationClick = useCallback(
    async (notification: DashboardNotification) => {
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }

      setShowNotifications(false);

      if (notification.type === 'document') {
        const notificationHref =
          typeof notification.metadata?.href === 'string'
            ? notification.metadata.href
            : '';
        const notificationFileUrl =
          typeof notification.metadata?.file_url === 'string'
            ? notification.metadata.file_url
            : '';

        if (notificationHref.startsWith('/')) {
          router.push(notificationHref);
          return;
        }

        if (notificationFileUrl) {
          window.open(notificationFileUrl, '_blank', 'noopener,noreferrer');
          return;
        }

        const latestUnreadDocument =
          sharedDocs.find((document) => !document.is_read) || sharedDocs[0];

        if (latestUnreadDocument?.file_url) {
          window.open(
            latestUnreadDocument.file_url,
            '_blank',
            'noopener,noreferrer',
          );
          return;
        }

        router.push('/icerikler');
        return;
      }

      if (notification.type === 'assignment') {
        const pendingAssignment = pendingAssignments[0] || assignments[0];

        if (pendingAssignment) {
          setSelectedAssignment(pendingAssignment);
          return;
        }

        router.push('/odevler');
        return;
      }

      if (notification.type === 'live-lesson') {
        router.push(
          typeof notification.metadata?.href === 'string'
            ? notification.metadata.href
            : '/canli-ders',
        );
        return;
      }

      setSelectedMessage(notification);
    },
    [assignments, markAsRead, pendingAssignments, router, sharedDocs],
  );

  const handleDashboardAction = useCallback(
    (action: DashboardAction) => {
      if (action.type === 'go-assignments') {
        router.push('/odevler');
        return;
      }

      if (action.type === 'go-tests') {
        router.push('/testler');
        return;
      }

      if (action.type === 'go-progress') {
        router.push('/ilerleme');
        return;
      }

      if (action.type === 'open-assignment') {
        const targetAssignment = assignments.find(
          (assignment) => assignment.id === action.assignmentId,
        );

        if (targetAssignment) {
          setSelectedAssignment(targetAssignment);
          return;
        }

        router.push('/odevler');
        return;
      }

      if (action.type === 'open-notification') {
        const targetNotification = notifications.find(
          (notification) => notification.id === action.notificationId,
        );

        if (targetNotification) {
          void handleNotificationClick(targetNotification);
          return;
        }

        setShowNotifications(true);
        return;
      }

      if (action.type === 'start-mistake-review') {
        router.push('/testler?mode=mistakes');
        return;
      }

      if (action.type === 'start-quiz') {
        if (action.quizId) {
          router.push(`/testler?quizId=${action.quizId}`);
          return;
        }
        if (action.topic) {
          router.push(`/testler?topic=${encodeURIComponent(action.topic)}`);
          return;
        }
        router.push('/testler');
        return;
      }

      if (action.type === 'open-document' && action.url) {
        if (action.url.startsWith('/')) {
          router.push(action.url);
          return;
        }

        window.open(action.url, '_blank', 'noopener,noreferrer');
      }
    },
    [assignments, handleNotificationClick, notifications, router],
  );

  const quickActionItems = useMemo(
    () => [
      {
        title: 'Testler',
        description:
          availableQuizzes[0]?.title ||
          'Sınıfına uygun testleri çözerek kendini dene.',
        stat: `${availableQuizzes.length}`,
        accentClass: 'from-brand-primary/20 to-brand-primary/20',
        iconClass: 'bg-emerald-500/30',
        actionLabel: 'Testlere Git',
        onAction: () => router.push('/testler'),
        badge: availableQuizzes.length > 0 ? 'Uygun' : undefined,
        icon: quickActionIcons.tests,
      },
      {
        title: 'Ödevler',
        description:
          pendingAssignments[0]?.title ||
          'Teslim edilmesi gereken ödevlerini buradan takip et.',
        stat: `${pendingAssignments.length}`,
        accentClass: 'from-brand-accent/20 to-brand-accent/20',
        iconClass: 'bg-orange-500/30',
        actionLabel: 'Ödevlere Git',
        onAction: () => router.push('/odevler'),
        badge: pendingAssignments.length > 0 ? 'Bekliyor' : undefined,
        icon: quickActionIcons.assignments,
      },
      {
        title: 'İlerleme',
        description:
          strongTopic || focusTopic
            ? `Bu hafta odağını ${focusTopic || strongTopic} çevresinde tut.`
            : 'Haftalık hedef ve konu akışını tek ekranda incele.',
        stat: `%${goalSnapshot.progressPercent}`,
        accentClass: 'from-brand-secondary/20 to-brand-secondary/20',
        iconClass: 'bg-blue-500/30',
        actionLabel: 'İlerlemeyi Aç',
        onAction: () => router.push('/ilerleme'),
        badge: 'Hafta',
        icon: quickActionIcons.progress,
      },
      {
        title: 'Mesajlar',
        description:
          latestNotification?.title ||
          'Bildirim akışından yeni mesaj ve belge sinyallerini kontrol et.',
        stat: `${unreadCount}`,
        accentClass: 'from-brand-secondary/20 to-brand-secondary/20',
        iconClass: 'bg-indigo-500/30',
        actionLabel: 'Akışı Aç',
        onAction: () => {
          if (unreadMessageNotification) {
            void handleNotificationClick(unreadMessageNotification);
            return;
          }

          setShowNotifications(true);
        },
        badge: unreadCount > 0 ? 'Yeni' : undefined,
        icon: quickActionIcons.messages,
      },
    ],
    [
      availableQuizzes,
      focusTopic,
      goalSnapshot.progressPercent,
      handleNotificationClick,
      latestNotification?.title,
      pendingAssignments,
      router,
      strongTopic,
      unreadCount,
      unreadMessageNotification,
    ],
  );

  const handleAvatarSelect = async (avatar: string) => {
    if (!user) return;

    const previousAvatar = user.avatar_id;
    setUser({ ...user, avatar_id: avatar });

    try {
      await updateProfileAvatar(user.id, avatar);
    } catch (error) {
      setUser({ ...user, avatar_id: previousAvatar });
      throw error;
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    const nextAvatarUrl = await uploadProfileAvatar(user.id, file);
    setUser({ ...user, avatar_id: nextAvatarUrl });
  };

  const handleUpdateSelect = (item: DashboardUpdateItem) => {
    handleDashboardAction(item.action);
  };

  const activeWeeklyPlan = weeklyPlans[0] ?? null;

  const handleWeeklyPlanItemToggle = async (item: ProfileWeeklyPlanItem) => {
    const nextCompleted = !item.completed_at;
    const updatedItem = await completeWeeklyPlanItem(item.id, nextCompleted);

    setWeeklyPlans((currentPlans) =>
      currentPlans.map((plan) => ({
        ...plan,
        student_weekly_plan_items: (plan.student_weekly_plan_items || []).map(
          (currentItem) =>
            currentItem.id === updatedItem.id
              ? { ...currentItem, ...updatedItem }
              : currentItem,
        ),
      })),
    );
  };

  if (loading) {
    return (
      <main className="profil-page page-surface min-h-screen px-4 pb-12 pt-20 dark:bg-surface-0">
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-48 rounded-[2.5rem]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="profil-page page-surface min-h-screen">
      <ProfileNav
        isAdmin={Boolean(user.isAdmin)}
        unreadCount={unreadCount}
        onToggleNotifications={() => setShowNotifications((prev) => !prev)}
        onLogout={handleLogout}
      />

      {!user.isAdmin ? (
        <WelcomeTour userId={user.id} userName={user.name} />
      ) : null}

      {showNotifications && !user.isAdmin && (
        <ProfileNotificationsPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationClick={(notification) => {
            void handleNotificationClick(notification);
          }}
        />
      )}

      <div className="px-4 pb-12 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-20">
        <div className="mx-auto max-w-6xl">
          {user.isAdmin ? (
            <AdminProfileHero name={user.name} email={user.email} />
          ) : (
            <div className="w-full max-w-full space-y-8 overflow-hidden">
              <DashboardHero
                goalSnapshot={goalSnapshot}
                latestScore={latestQuizScore}
                onAvatarClick={() => setIsAvatarModalOpen(true)}
                onPrimaryAction={() => {
                  if (primaryTask) {
                    handleDashboardAction(primaryTask.action);
                    return;
                  }

                  router.push('/ilerleme');
                }}
                primaryTask={primaryTask}
                user={user}
              />

              <ProfileTabButtons
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onOpenParentReport={() => setIsParentReportOpen(true)}
                onOpenPortfolio={() => setIsPortfolioOpen(true)}
                onOpenAhaModal={() => setIsAhaModalOpen(true)}
                onOpenTimeCapsule={() => setIsTimeCapsuleOpen(true)}
                onOpenAuthoringModal={() => setIsAuthoringModalOpen(true)}
                onOpenFeynmanModal={() => setIsFeynmanModalOpen(true)}
              />

              <div
                id="profile-panel-overview"
                role="tabpanel"
                aria-labelledby="profile-tab-overview"
                className={
                  activeTab === 'overview' ? 'space-y-8 block' : 'hidden'
                }
              >
                {visitedTabs.has('overview') && (
                  <ProfileOverviewTab
                    isLightNav={isLightNav}
                    user={user}
                    quickActionItems={quickActionItems}
                    pendingMistakesCount={pendingMistakesCount}
                    activeWeeklyPlan={activeWeeklyPlan}
                    onWeeklyPlanItemToggle={handleWeeklyPlanItemToggle}
                    tasks={tasks}
                    onSelectTask={handleDashboardAction}
                    focusTopic={focusTopic}
                    strongTopic={strongTopic}
                    goalSnapshot={goalSnapshot}
                    latestQuizScore={latestQuizScore}
                    recentBadges={recentBadges}
                    motivationMessage={motivationMessage}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAllAsRead={markAllAsRead}
                    onOpenNotification={(notification) => {
                      void handleNotificationClick(notification);
                    }}
                    onOpenPanel={() => setShowNotifications(true)}
                    updates={updates}
                    onSelectUpdate={handleUpdateSelect}
                    quizResults={quizResults}
                    sharedDocs={sharedDocs}
                    onStartPrescriptionQuiz={(topic) => {
                      router.push(
                        `/testler?mode=prescription&topic=${encodeURIComponent(topic)}`,
                      );
                    }}
                  />
                )}
              </div>

              <div
                id="profile-panel-notes"
                role="tabpanel"
                aria-labelledby="profile-tab-notes"
                className={activeTab === 'notes' ? 'block' : 'hidden'}
              >
                {visitedTabs.has('notes') && <NotesSection userId={user.id} />}
              </div>

              <div
                id="profile-panel-settings"
                role="tabpanel"
                aria-labelledby="profile-tab-settings"
                className={activeTab === 'settings' ? 'block' : 'hidden'}
              >
                {visitedTabs.has('settings') && <DashboardSettings />}
              </div>

              <ProfileFeatureModals
                user={user}
                goalSnapshot={goalSnapshot}
                quizResults={quizResults}
                latestQuizScore={latestQuizScore}
                progressRows={progressRows}
                isAvatarModalOpen={isAvatarModalOpen}
                onCloseAvatarModal={() => setIsAvatarModalOpen(false)}
                onAvatarSelect={handleAvatarSelect}
                onAvatarUpload={handleAvatarUpload}
                isParentReportOpen={isParentReportOpen}
                onCloseParentReport={() => setIsParentReportOpen(false)}
                isPortfolioOpen={isPortfolioOpen}
                onClosePortfolio={() => setIsPortfolioOpen(false)}
                isAhaModalOpen={isAhaModalOpen}
                onCloseAhaModal={() => setIsAhaModalOpen(false)}
                isTimeCapsuleOpen={isTimeCapsuleOpen}
                onCloseTimeCapsule={() => setIsTimeCapsuleOpen(false)}
                isAuthoringModalOpen={isAuthoringModalOpen}
                onCloseAuthoringModal={() => setIsAuthoringModalOpen(false)}
                isFeynmanModalOpen={isFeynmanModalOpen}
                onCloseFeynmanModal={() => setIsFeynmanModalOpen(false)}
                selectedAssignment={selectedAssignment}
                onCloseAssignment={() => setSelectedAssignment(null)}
                onOpenAssignments={() => router.push('/odevler')}
                selectedMessage={selectedMessage}
                onCloseMessage={() => setSelectedMessage(null)}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
