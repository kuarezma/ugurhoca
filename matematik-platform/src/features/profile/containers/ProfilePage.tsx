'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Bell, LogOut, Settings, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOutClient } from '@/lib/auth-client';
import FloatingShapes from '@/components/FloatingShapes';
import NotesSection from '@/components/NotesSection';
import DashboardHero from '@/components/dashboard/DashboardHero';
import QuickActionGrid, {
  quickActionIcons,
} from '@/components/dashboard/QuickActionGrid';
import ProgressOverview from '@/components/dashboard/ProgressOverview';
import MessageSummaryCard from '@/components/dashboard/MessageSummaryCard';
import RecentResults from '@/components/dashboard/RecentResults';
import RecentDocuments from '@/components/dashboard/RecentDocuments';
import DashboardSettings from '@/components/dashboard/DashboardSettings';
import AvatarSelectionModal from '@/components/dashboard/AvatarSelectionModal';
import AssignmentDetailModal from '@/features/profile/components/AssignmentDetailModal';
import MessageDetailModal from '@/features/profile/components/MessageDetailModal';
import ProfileNotificationsPanel from '@/features/profile/components/ProfileNotificationsPanel';
import { useProfileDashboardData } from '@/features/profile/hooks/useProfileDashboardData';
import {
  updateProfileAvatar,
} from '@/features/profile/queries';
import type { InitialProfileDashboardData } from '@/features/profile/types';
import type {
  ContinueState,
  DashboardAssignment,
  DashboardNotification,
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
    loading,
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

  const pendingAssignments = useMemo(() => {
    const submittedAssignmentIds = new Set(
      submissions.map((submission) => submission.assignment_id),
    );

    return assignments.filter(
      (assignment) => !submittedAssignmentIds.has(assignment.id),
    );
  }, [assignments, submissions]);

  const weeklyMinutes = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    cutoff.setHours(0, 0, 0, 0);

    return studySessions.reduce((total, session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= cutoff
        ? total + Number(session.duration || 0)
        : total;
    }, 0);
  }, [studySessions]);

  const latestQuizScore = quizResults[0]?.score ?? null;
  const strongTopic = progressRows[0]?.topic ?? null;
  const focusTopic =
    [...progressRows].reverse().find((row) => row.mastery_level < 60)?.topic ??
    null;
  const latestNotification = notifications[0] || null;
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
        const doc = sharedDocs[0];
        if (doc?.file_url) {
          window.open(doc.file_url, '_blank', 'noopener,noreferrer');
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

      if (
        notification.type === 'message' ||
        notification.type === 'admin-message'
      ) {
        setSelectedMessage(notification);
      }
    },
    [assignments, markAsRead, pendingAssignments, router, sharedDocs],
  );

  const continueState: ContinueState = useMemo(() => {
    if (pendingAssignments.length > 0) {
      return {
        kind: 'assignment',
        title: 'Bekleyen ödevin var',
        description: `${
          pendingAssignments[0].title
        } ödevini tamamlayıp teslim etmeyi unutma.`,
        actionLabel: 'Ödeve Git',
        onAction: () => router.push('/odevler'),
        accentClass: 'from-purple-500/20 via-fuchsia-500/15 to-pink-500/15',
      };
    }

    if (availableQuizzes.length > 0) {
      return {
        kind: 'quiz',
        title: 'Yeni test seni bekliyor',
        description: `${
          availableQuizzes[0].title
        } testiyle çalışmana hemen devam edebilirsin.`,
        actionLabel: 'Teste Başla',
        onAction: () => router.push('/testler'),
        accentClass: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/15',
      };
    }

    if (unreadMessageNotification) {
      return {
        kind: 'message',
        title: 'Yeni bir mesajın var',
        description:
          unreadMessageNotification.title ||
          'Dashboard’dan mesajlarını ve bildirimlerini kontrol et.',
        actionLabel: 'Mesajı Aç',
        onAction: () => handleNotificationClick(unreadMessageNotification),
        accentClass: 'from-indigo-500/20 via-violet-500/15 to-fuchsia-500/15',
      };
    }

    return {
      kind: 'progress',
      title: 'İlerlemeni güncel tut',
      description:
        'Çalışma ekleyerek gelişim ekranındaki haftalık özetini daha anlamlı hale getir.',
      actionLabel: 'İlerlemeye Git',
      onAction: () => router.push('/ilerleme'),
      accentClass: 'from-blue-500/20 via-cyan-500/15 to-teal-500/15',
    };
  }, [
    availableQuizzes,
    handleNotificationClick,
    pendingAssignments,
    router,
    unreadMessageNotification,
  ]);

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
        accentClass: 'from-purple-500/20 via-fuchsia-500/15 to-pink-500/10',
        iconClass: 'bg-purple-500/30',
        actionLabel: 'Ödevlere Git',
        onAction: () => router.push('/odevler'),
        badge: pendingAssignments.length > 0 ? 'Bekliyor' : undefined,
        icon: quickActionIcons.assignments,
      },
      {
        title: 'İlerleme',
        description:
          strongTopic || focusTopic
            ? `Konu durumunu gözden geçir: ${strongTopic || focusTopic}`
            : 'Haftalık çalışma ve konu gelişimini tek bakışta incele.',
        stat: `${user?.current_streak || 0} gün`,
        accentClass: 'from-blue-500/20 via-cyan-500/15 to-sky-500/10',
        iconClass: 'bg-blue-500/30',
        actionLabel: 'İlerlemeyi Aç',
        onAction: () => router.push('/ilerleme'),
        badge: 'Seri',
        icon: quickActionIcons.progress,
      },
      {
        title: 'Mesajlar',
        description:
          latestNotification?.title ||
          'Uğur Hoca’dan gelen mesaj ve bildirimlerini buradan kontrol et.',
        stat: `${unreadCount}`,
        accentClass: 'from-indigo-500/20 via-violet-500/15 to-fuchsia-500/10',
        iconClass: 'bg-indigo-500/30',
        actionLabel: 'Bildirimi Aç',
        onAction: () => {
          if (unreadMessageNotification) {
            handleNotificationClick(unreadMessageNotification);
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
      handleNotificationClick,
      latestNotification?.title,
      pendingAssignments,
      router,
      strongTopic,
      unreadCount,
      unreadMessageNotification,
      user?.current_streak,
    ],
  );

  const openLatestMessage = () => {
    if (unreadMessageNotification) {
      handleNotificationClick(unreadMessageNotification);
      return;
    }

    if (latestNotification) {
      handleNotificationClick(latestNotification);
      return;
    }

    setShowNotifications(true);
  };

  const handleAvatarSelect = async (avatar: string) => {
    if (!user) return;

    setUser({ ...user, avatar_id: avatar });

    await updateProfileAvatar(user.id, avatar);
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
      <FloatingShapes count={6} />

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
          onNotificationClick={handleNotificationClick}
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
            <div className="space-y-8 w-full max-w-full overflow-hidden">
              <DashboardHero
                user={user}
                continueState={continueState}
                onAvatarClick={() => setIsAvatarModalOpen(true)}
              />

              <div className="mx-auto w-full max-w-full">
                <QuickActionGrid items={quickActionItems} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <ProgressOverview
                  streak={user.current_streak || 0}
                  weeklyMinutes={weeklyMinutes}
                  latestScore={latestQuizScore}
                  strongTopic={strongTopic}
                  focusTopic={focusTopic}
                  detailHref="/ilerleme"
                />
                <MessageSummaryCard
                  unreadCount={unreadCount}
                  latestTitle={latestNotification?.title || null}
                  latestMessage={
                    latestNotification?.message ||
                    latestNotification?.metadata?.sender_name ||
                    null
                  }
                  notifications={notifications}
                  onOpenPanel={() => setShowNotifications(true)}
                  onOpenLatest={openLatestMessage}
                />
              </div>

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
