'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getClientSession } from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';
import type {
  DashboardAssignment,
  DashboardBadge,
  DashboardDocument,
  DashboardNotification,
  DashboardQuizResult,
  DashboardQuizSummary,
  DashboardSubmission,
  StudentProfile,
} from '@/types/dashboard';
import type { StudyGoal } from '@/features/progress/types';
import type {
  InitialProfileDashboardData,
  ProfileProgressRow,
  ProfileStudySessionRow,
} from '@/features/profile/types';
import {
  loadClientProfileDashboardCollections,
  markProfileNotificationAsRead,
  markProfileNotificationsAsRead,
  resolveClientProfileUser,
} from '@/features/profile/queries';

type RouterLike = {
  push: (href: string) => void;
};

const sortNotificationsDesc = (items: DashboardNotification[]) =>
  [...items].sort(
    (left, right) =>
      new Date(right.created_at).getTime() -
      new Date(left.created_at).getTime(),
  );

const upsertNotification = (
  items: DashboardNotification[],
  nextNotification: DashboardNotification,
) =>
  sortNotificationsDesc([
    nextNotification,
    ...items.filter((notification) => notification.id !== nextNotification.id),
  ]);

const upsertSubmission = (
  items: DashboardSubmission[],
  nextSubmission: DashboardSubmission,
) =>
  [
    nextSubmission,
    ...items.filter((submission) => submission.id !== nextSubmission.id),
  ].sort(
    (left, right) =>
      new Date(right.submitted_at || 0).getTime() -
      new Date(left.submitted_at || 0).getTime(),
  );

export const useProfileDashboardData = (
  router: RouterLike,
  initialData?: InitialProfileDashboardData,
) => {
  const [user, setUser] = useState<StudentProfile | null>(
    initialData?.user ?? null,
  );
  const [loading, setLoading] = useState(!(initialData?.isHydrated ?? false));
  const [badges, setBadges] = useState<DashboardBadge[]>(
    initialData?.badges ?? [],
  );
  const [goal, setGoal] = useState<StudyGoal | null>(initialData?.goal ?? null);
  const [notifications, setNotifications] = useState<DashboardNotification[]>(
    sortNotificationsDesc(initialData?.notifications ?? []),
  );
  const [sharedDocs, setSharedDocs] = useState<DashboardDocument[]>(
    initialData?.sharedDocs ?? [],
  );
  const [assignments, setAssignments] = useState<DashboardAssignment[]>(
    initialData?.assignments ?? [],
  );
  const [submissions, setSubmissions] = useState<DashboardSubmission[]>(
    initialData?.submissions ?? [],
  );
  const [quizResults, setQuizResults] = useState<DashboardQuizResult[]>(
    initialData?.quizResults ?? [],
  );
  const [availableQuizzes, setAvailableQuizzes] = useState<
    DashboardQuizSummary[]
  >(initialData?.availableQuizzes ?? []);
  const [studySessions, setStudySessions] = useState<ProfileStudySessionRow[]>(
    initialData?.studySessions ?? [],
  );
  const [progressRows, setProgressRows] = useState<ProfileProgressRow[]>(
    initialData?.progressRows ?? [],
  );
  const initialUserKey = useMemo(
    () =>
      initialData?.user
        ? `${initialData.user.id}:${String(initialData.user.grade)}:${String(initialData.user.isAdmin)}`
        : null,
    [initialData?.user],
  );

  useEffect(() => {
    const loadData = async () => {
      const session = await getClientSession();

      if (!session) {
        router.push('/giris');
        return;
      }

      const nextUser = await resolveClientProfileUser(session);
      setUser(nextUser);

      const currentUserKey = `${nextUser.id}:${String(nextUser.grade)}:${String(nextUser.isAdmin)}`;

      if (
        (initialData?.isHydrated ?? false) &&
        currentUserKey === initialUserKey
      ) {
        setLoading(false);
        return;
      }

      const collections = await loadClientProfileDashboardCollections(nextUser);

      setBadges(collections.badges);
      setGoal(collections.goal);
      setNotifications(sortNotificationsDesc(collections.notifications));
      setSharedDocs(collections.sharedDocs);
      setAssignments(collections.assignments);
      setSubmissions(collections.submissions);
      setQuizResults(collections.quizResults);
      setAvailableQuizzes(collections.availableQuizzes);
      setStudySessions(collections.studySessions);
      setProgressRows(collections.progressRows);
      setLoading(false);
    };

    loadData();
  }, [initialData?.isHydrated, initialUserKey, router]);

  useEffect(() => {
    const userId = user?.id;
    const isAdmin = user?.isAdmin;

    if (!userId || isAdmin) {
      return;
    }

    const notificationsChannel = supabase
      .channel(`profile-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          filter: `user_id=eq.${userId}`,
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const nextNotification = payload.new as DashboardNotification;
          setNotifications((prev) =>
            upsertNotification(prev, nextNotification),
          );
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          filter: `user_id=eq.${userId}`,
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const nextNotification = payload.new as DashboardNotification;
          setNotifications((prev) =>
            upsertNotification(prev, nextNotification),
          );
        },
      )
      .subscribe();

    const submissionsChannel = supabase
      .channel(`profile-submissions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          filter: `student_id=eq.${userId}`,
          schema: 'public',
          table: 'assignment_submissions',
        },
        (payload) => {
          const nextSubmission = payload.new as DashboardSubmission;
          setSubmissions((prev) => upsertSubmission(prev, nextSubmission));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(notificationsChannel);
      void supabase.removeChannel(submissionsChannel);
    };
  }, [user?.id, user?.isAdmin]);

  const markAsRead = useCallback(async (id: string) => {
    await markProfileNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter((notification) => !notification.is_read)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) {
      return;
    }

    await markProfileNotificationsAsRead(unreadIds);
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, is_read: true })),
    );
  }, [notifications]);

  return {
    assignments,
    availableQuizzes,
    badges,
    goal,
    loading,
    markAsRead,
    markAllAsRead,
    notifications,
    progressRows,
    quizResults,
    setUser,
    sharedDocs,
    studySessions,
    submissions,
    user,
  };
};
