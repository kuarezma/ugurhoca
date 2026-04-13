'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getClientSession } from '@/lib/auth-client';
import type {
  DashboardAssignment,
  DashboardDocument,
  DashboardNotification,
  DashboardQuizResult,
  DashboardQuizSummary,
  DashboardSubmission,
  StudentProfile,
} from '@/types/dashboard';
import type {
  InitialProfileDashboardData,
  ProfileProgressRow,
  ProfileStudySessionRow,
} from '@/features/profile/types';
import {
  loadClientProfileDashboardCollections,
  markProfileNotificationAsRead,
  resolveClientProfileUser,
} from '@/features/profile/queries';

type RouterLike = {
  push: (href: string) => void;
};

export const useProfileDashboardData = (
  router: RouterLike,
  initialData?: InitialProfileDashboardData,
) => {
  const [user, setUser] = useState<StudentProfile | null>(
    initialData?.user ?? null,
  );
  const [loading, setLoading] = useState(!(initialData?.isHydrated ?? false));
  const [notifications, setNotifications] = useState<DashboardNotification[]>(
    initialData?.notifications ?? [],
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

      setNotifications(collections.notifications);
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

  return {
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
  };
};
