'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { getCurrentUserProfile, requireClientSession } from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';
import type {
  Announcement,
  AppUser,
  ContentDocument,
  SharedDocumentAssignment,
  SupportAttachment,
} from '@/types';
import {
  dismissHomeAssignment,
  fetchHomeFeed,
  fetchUserAssignments,
  sendSupportMessage,
  uploadSupportFiles,
} from '@/features/home/queries';

type UseHomePageDataOptions = {
  initialAnnouncements?: Announcement[];
  initialDocuments?: ContentDocument[];
  initialWritings?: ContentDocument[];
};

export const useHomePageData = ({
  initialAnnouncements = [],
  initialDocuments = [],
  initialWritings = [],
}: UseHomePageDataOptions = {}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [documents, setDocuments] = useState<ContentDocument[]>(initialDocuments);
  const [writings, setWritings] = useState<ContentDocument[]>(initialWritings);
  const [userAssignments, setUserAssignments] = useState<
    SharedDocumentAssignment[]
  >([]);
  const [dismissedAssignments, setDismissedAssignments] = useState<Set<string>>(
    new Set(),
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportAttachments, setSupportAttachments] = useState<
    SupportAttachment[]
  >([]);
  const [supportSending, setSupportSending] = useState(false);
  const [supportSent, setSupportSent] = useState(false);

  useEffect(() => {
    let isDisposed = false;

    const loadPage = async () => {
      // If we have server-side initial data, only fetch user + assignments
      const hasInitialData =
        initialDocuments.length > 0 ||
        initialWritings.length > 0 ||
        initialAnnouncements.length > 0;

      const [profileResult, feed] = await Promise.all([
        getCurrentUserProfile({ redirectToLogin: false }),
        hasInitialData ? null : fetchHomeFeed(),
      ]);

      if (isDisposed) {
        return;
      }

      // Only update feed data if we fetched it client-side (no server data available)
      if (feed) {
        setDocuments(feed.documents);
        setWritings(feed.writings);
        setAnnouncements(feed.announcements);
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
        setUserAssignments(assignments);
      }
    };

    void loadPage();

    return () => {
      isDisposed = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleAssignments = userAssignments.filter(
    (assignment) => !dismissedAssignments.has(assignment.id),
  );

  const uploadSupportAttachments = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const uploads = await uploadSupportFiles(files);
    setSupportAttachments((currentAttachments) => [
      ...currentAttachments,
      ...uploads,
    ]);
  };

  const removeSupportAttachment = (index: number) => {
    setSupportAttachments((currentAttachments) =>
      currentAttachments.filter(
        (_, attachmentIndex) => attachmentIndex !== index,
      ),
    );
  };

  const handleSupportSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!user || user.isAdmin) {
      return;
    }

    if (!supportMessage.trim() && supportAttachments.length === 0) {
      return;
    }

    if (!user.id) {
      alert('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yap.');
      return;
    }

    setSupportSending(true);

    try {
      const session = await requireClientSession({ redirectToLogin: false });

      if (!session?.user?.id) {
        alert('Oturum süresi dolmuş. Lütfen tekrar giriş yap.');
        setSupportSending(false);
        return;
      }

      await sendSupportMessage(
        {
          attachments: supportAttachments,
          sender_email: user.email || session.user.email || '',
          sender_id: session.user.id,
          sender_name: user.name || 'Öğrenci',
          text: supportMessage.trim(),
        },
        session.access_token,
      );

      setSupportMessage('');
      setSupportAttachments([]);
      setSupportSent(true);
      setTimeout(() => setSupportSent(false), 3000);
    } catch (error) {
      console.error('Support message error:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Mesaj gönderilemedi. Lütfen tekrar dene.',
      );
    } finally {
      setSupportSending(false);
    }
  };

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
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return {
    announcements,
    documents,
    handleDismissAllAssignments,
    handleDismissAssignment,
    handleLogout,
    handleSupportSubmit,
    removeSupportAttachment,
    selectedAnnouncement,
    setSelectedAnnouncement,
    setSupportMessage,
    supportAttachments,
    supportMessage,
    supportSending,
    supportSent,
    uploadSupportAttachments,
    user,
    visibleAssignments,
    writings,
  };
};
