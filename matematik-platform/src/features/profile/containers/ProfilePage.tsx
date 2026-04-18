'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Bell, LogOut, Settings, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOutClient } from '@/lib/auth-client';
import DeferredFloatingShapes from '@/components/DeferredFloatingShapes';
import NotesSection from '@/components/NotesSection';
import DashboardHero from '@/components/dashboard/DashboardHero';
import MessageSummaryCard from '@/components/dashboard/MessageSummaryCard';
import MotivationPanel from '@/components/dashboard/MotivationPanel';
import ProgressOverview from '@/components/dashboard/ProgressOverview';
import QuickActionGrid, {
  quickActionIcons,
} from '@/components/dashboard/QuickActionGrid';
import QuickUpdatesPanel from '@/components/dashboard/QuickUpdatesPanel';
import RecentDocuments from '@/components/dashboard/RecentDocuments';
import RecentResults from '@/components/dashboard/RecentResults';
import TodayPlanCard from '@/components/dashboard/TodayPlanCard';
import DashboardSettings from '@/components/dashboard/DashboardSettings';

const AvatarSelectionModal = dynamic(
  () => import('@/components/dashboard/AvatarSelectionModal'),
  { ssr: false },
);
const AssignmentDetailModal = dynamic(
  () => import('@/features/profile/components/AssignmentDetailModal'),
  { ssr: false },
);
const MessageDetailModal = dynamic(
  () => import('@/features/profile/components/MessageDetailModal'),
  { ssr: false },
);
import ProfileNotificationsPanel from '@/features/profile/components/ProfileNotificationsPanel';
import { useProfileDashboardData } from '@/features/profile/hooks/useProfileDashboardData';
import {
  updateProfileAvatar,
  uploadProfileAvatar,
} from '@/features/profile/queries';
import type { InitialProfileDashboardData } from '@/features/profile/types';
import { buildProfileDashboardViewModel } from '@/features/profile/utils/dashboard-view-model';
import type {
  DashboardAction,
  DashboardAssignment,
  DashboardNotification,
  DashboardUpdateItem,
} from '@/types/dashboard';

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
  const router = useRouter();
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
    setUser,
    sharedDocs,
    studySessions,
    submissions,
    user,
  } = useProfileDashboardData(router, initialData);

  const handleLogout = async () => {
    await signOutClient();
    router.push('/');
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;
  const latestNotification = notifications[0] || null;

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
        goal,
        notifications,
        progressRows,
        quizResults,
        sharedDocs,
        studySessions,
        submissions,
        user,
      }),
    [
      assignments,
      availableQuizzes,
      badges,
      goal,
      notifications,
      progressRows,
      quizResults,
      sharedDocs,
      studySessions,
      submissions,
      user,
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

      if (action.type === 'open-document' && action.url) {
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
        accentClass: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/10',
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
        accentClass: 'from-orange-500/20 via-amber-500/15 to-yellow-500/10',
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
        accentClass: 'from-blue-500/20 via-cyan-500/15 to-sky-500/10',
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
        accentClass: 'from-indigo-500/20 via-violet-500/15 to-fuchsia-500/10',
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

  if (loading) {
    return (
      <main className="profil-page min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 rounded-full border-4 border-orange-500 border-t-transparent"
        />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="profil-page min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <DeferredFloatingShapes count={6} />

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/ugur.jpeg"
              alt="Uğur Hoca"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="text-lg font-bold text-white">Uğur Hoca</span>
          </Link>

          <div className="flex items-center gap-4">
            {!user.isAdmin && (
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative text-slate-400 transition-colors hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-400 transition-colors hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {showNotifications && !user.isAdmin && (
        <ProfileNotificationsPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationClick={(notification) => {
            void handleNotificationClick(notification);
          }}
        />
      )}

      <div className="px-4 pb-12 pt-20">
        <div className="mx-auto max-w-6xl">
          {user.isAdmin ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-3xl font-bold text-white">
                    {user.name?.[0] || '?'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {user.name}
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-1.5">
                      <Shield className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-semibold text-orange-300">
                        Yönetici
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Settings className="h-5 w-5" />
                  Admin Paneline Git
                </Link>
              </div>
            </motion.section>
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

              <div className="mx-auto w-full max-w-full">
                <QuickActionGrid items={quickActionItems} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <TodayPlanCard
                  tasks={tasks}
                  onSelectTask={(task) => handleDashboardAction(task.action)}
                />
                <ProgressOverview
                  detailHref="/ilerleme"
                  focusTopic={focusTopic}
                  goalSnapshot={goalSnapshot}
                  latestScore={latestQuizScore}
                  strongTopic={strongTopic}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <MotivationPanel
                  badges={recentBadges}
                  latestScore={latestQuizScore}
                  message={motivationMessage}
                  streak={user.current_streak || 0}
                />
                <MessageSummaryCard
                  notifications={notifications}
                  onMarkAllAsRead={markAllAsRead}
                  onOpenNotification={(notification) => {
                    void handleNotificationClick(notification);
                  }}
                  onOpenPanel={() => setShowNotifications(true)}
                  unreadCount={unreadCount}
                />
              </div>

              <QuickUpdatesPanel
                updates={updates}
                onSelectUpdate={handleUpdateSelect}
              />

              <div className="grid gap-6 lg:grid-cols-2">
                <RecentResults results={quizResults} />
                <RecentDocuments documents={sharedDocs} />
              </div>

              <NotesSection userId={user.id} />

              <DashboardSettings />

              <AvatarSelectionModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSelect={handleAvatarSelect}
                onUpload={handleAvatarUpload}
                currentAvatar={user.avatar_id}
              />
            </div>
          )}
        </div>
      </div>

      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onOpenAssignments={() => router.push('/odevler')}
        />
      )}

      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </main>
  );
}
