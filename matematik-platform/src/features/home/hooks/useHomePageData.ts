'use client';

import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUserProfile,
  redirectToHome,
  signOutClient,
} from '@/lib/auth-client';
import type {
  Announcement,
  AppUser,
  ContentDocument,
  SharedDocumentAssignment,
} from '@/types';
import type { HomeInitialFeed } from '@/features/home/home-initial-feed';
import {
  dismissHomeAssignment,
  fetchHomeFeed,
  fetchUserAssignments,
} from '@/features/home/queries';

export const useHomePageData = (initialFeed?: HomeInitialFeed | null) => {
  const isFeedSeeded = Boolean(initialFeed);
  const router = useRouter();

  const [user, setUser] = useState<AppUser | null>(null);
  const [documents, setDocuments] = useState<ContentDocument[]>(
    initialFeed?.documents ?? [],
  );
  const [userAssignments, setUserAssignments] = useState<
    SharedDocumentAssignment[]
  >([]);
  const [dismissedAssignments, setDismissedAssignments] = useState<Set<string>>(
    new Set(),
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    initialFeed?.announcements ?? [],
  );
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  useEffect(() => {
    let isDisposed = false;

    const loadPage = async () => {
      if (isFeedSeeded) {
        const profileResult = await getCurrentUserProfile({
          redirectToLogin: false,
        });

        if (isDisposed) {
          return;
        }

        if (!profileResult) {
          setUser(null);
          setUserAssignments([]);
          return;
        }

        setUser(profileResult.profile);

        const assignments = await fetchUserAssignments(
          profileResult.session.user.id,
        );

        if (!isDisposed) {
          startTransition(() => {
            setUserAssignments(assignments);
          });
        }

        return;
      }

      const [profileResult, feed] = await Promise.all([
        getCurrentUserProfile({ redirectToLogin: false }),
        fetchHomeFeed(),
      ]);

      if (isDisposed) {
        return;
      }

      setDocuments(feed.documents);
      setAnnouncements(feed.announcements);

      if (!profileResult) {
        setUser(null);
        setUserAssignments([]);
        return;
      }

      setUser(profileResult.profile);

      const assignments = await fetchUserAssignments(
        profileResult.session.user.id,
      );

      if (!isDisposed) {
        startTransition(() => {
          setUserAssignments(assignments);
        });
      }
    };

    void loadPage();

    return () => {
      isDisposed = true;
    };
  }, [isFeedSeeded]);

  const visibleAssignments = userAssignments.filter(
    (assignment) => !dismissedAssignments.has(assignment.id),
  );

  const handleDismissAssignment = async (
    assignment: SharedDocumentAssignment,
  ) => {
    await dismissHomeAssignment(assignment);
    setDismissedAssignments(
      (currentDismissedAssignments) =>
        new Set([...currentDismissedAssignments, assignment.id]),
    );
  };

  const handleDismissAllAssignments = async () => {
    await Promise.all(
      visibleAssignments.map((assignment) => dismissHomeAssignment(assignment)),
    );

    setDismissedAssignments(
      (currentDismissedAssignments) =>
        new Set([
          ...currentDismissedAssignments,
          ...visibleAssignments.map((assignment) => assignment.id),
        ]),
    );
  };

  const handleLogout = async () => {
    await signOutClient();
    setUser(null);
    redirectToHome(router);
  };

  return {
    announcements,
    documents,
    handleDismissAllAssignments,
    handleDismissAssignment,
    handleLogout,
    selectedAnnouncement,
    setSelectedAnnouncement,
    user,
    visibleAssignments,
  };
};
