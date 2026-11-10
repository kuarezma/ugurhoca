import type {
  AppUser,
  ContentDocument,
  SharedDocumentAssignment,
} from '@/types';
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { useCallback } from 'react';

import { useToast } from '@/components/Toast';
import { useAdminModalState } from '@/features/admin/hooks/useAdminModalState';
import {
  loadAdminAssignmentSubmissions,
  loadAdminDashboardData,
  loadAdminLearningActivity,
  loadAdminLiveLessonActivity,
  loadGoogleDriveConnectionStatus,
  loadWorksheetCandidateSourceStatus,
  loadAdminStudentProfile,
  updateAdminSubmissionReview,
} from '@/features/admin/queries';
import type {
  AdminAnnouncement as Announcement,
  AdminAssignment as Assignment,
  AdminDashboardData,
  AdminNotification as Notification,
  AdminQuizResultRow,
  AdminQuiz as Quiz,
  AdminStudyGoalRow,
  AdminStudySessionRow,
  AdminStudentProfileData,
  AdminSubmission as Submission,
  AnnualPlanItem,
  GoogleDriveConnectionStatus,
  StudentActivityEvent,
  StudentAdminStatus,
  StudentWeeklyPlan,
  WorksheetCandidate,
  WorksheetCandidateSourceStatus,
} from '@/features/admin/types';
import type { LiveLessonDashboardData } from '@/features/live-lessons/types';

import { log } from './helpers';

type UseAdminDataProps = {
  setActiveStudentProfileLoading: Dispatch<SetStateAction<boolean>>;
  setActiveStudentProfileError: Dispatch<SetStateAction<string | null>>;
  setActiveStudentProfileData: Dispatch<
    SetStateAction<AdminStudentProfileData | null>
  >;
  setSelectedAssignmentSubmissions: Dispatch<SetStateAction<Submission[]>>;
  activeAssignment: ReturnType<typeof useAdminModalState>['activeAssignment'];
  showToast: ReturnType<typeof useToast>['showToast'];
  setAnnouncements: Dispatch<SetStateAction<Announcement[]>>;
  setAnnualPlanItems: Dispatch<SetStateAction<AnnualPlanItem[]>>;
  setWorksheetCandidates: Dispatch<SetStateAction<WorksheetCandidate[]>>;
  setDocuments: Dispatch<SetStateAction<ContentDocument[]>>;
  setAllUsers: Dispatch<SetStateAction<AppUser[]>>;
  setAssignments: Dispatch<SetStateAction<Assignment[]>>;
  setSharedDocs: Dispatch<SetStateAction<SharedDocumentAssignment[]>>;
  setQuizzes: Dispatch<SetStateAction<Quiz[]>>;
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
  setAdminStatuses: Dispatch<SetStateAction<StudentAdminStatus[]>>;
  setWeeklyPlans: Dispatch<SetStateAction<StudentWeeklyPlan[]>>;
  setDashboardSubmissions: Dispatch<SetStateAction<Submission[]>>;
  setDashboardQuizResults: Dispatch<SetStateAction<AdminQuizResultRow[]>>;
  setDashboardStudyGoals: Dispatch<SetStateAction<AdminStudyGoalRow[]>>;
  setLiveLessons: Dispatch<SetStateAction<LiveLessonDashboardData>>;
  learningActivityRequestRef: RefObject<Promise<void> | null>;
  learningActivityLoadedRef: RefObject<boolean>;
  setLearningActivityStatus: Dispatch<
    SetStateAction<'error' | 'idle' | 'loading' | 'ready'>
  >;
  setActivityEvents: Dispatch<SetStateAction<StudentActivityEvent[]>>;
  setDashboardStudySessions: Dispatch<SetStateAction<AdminStudySessionRow[]>>;
  liveLessonActivityRequestRef: RefObject<Promise<void> | null>;
  liveLessonActivityLoadedRef: RefObject<boolean>;
  setLiveLessonActivityStatus: Dispatch<
    SetStateAction<'error' | 'idle' | 'loading' | 'ready'>
  >;
  adminUserIdRef: RefObject<string | null>;
  setDashboardVersion: Dispatch<SetStateAction<number>>;
  setDashboardLoaded: Dispatch<SetStateAction<boolean>>;
  setGoogleDriveConnection: Dispatch<
    SetStateAction<GoogleDriveConnectionStatus | null>
  >;
  setWorksheetSourceStatus: Dispatch<
    SetStateAction<WorksheetCandidateSourceStatus | null>
  >;
};

export function useAdminData({
  setActiveStudentProfileLoading,
  setActiveStudentProfileError,
  setActiveStudentProfileData,
  setSelectedAssignmentSubmissions,
  activeAssignment,
  showToast,
  setAnnouncements,
  setAnnualPlanItems,
  setWorksheetCandidates,
  setDocuments,
  setAllUsers,
  setAssignments,
  setSharedDocs,
  setQuizzes,
  setNotifications,
  setAdminStatuses,
  setWeeklyPlans,
  setDashboardSubmissions,
  setDashboardQuizResults,
  setDashboardStudyGoals,
  setLiveLessons,
  learningActivityRequestRef,
  learningActivityLoadedRef,
  setLearningActivityStatus,
  setActivityEvents,
  setDashboardStudySessions,
  liveLessonActivityRequestRef,
  liveLessonActivityLoadedRef,
  setLiveLessonActivityStatus,
  adminUserIdRef,
  setDashboardVersion,
  setDashboardLoaded,
  setGoogleDriveConnection,
  setWorksheetSourceStatus,
}: UseAdminDataProps) {
  const loadStudentProfile = useCallback(
    async (studentId: string) => {
      setActiveStudentProfileLoading(true);
      setActiveStudentProfileError(null);

      try {
        const data = await loadAdminStudentProfile(studentId);

        if (!data) {
          setActiveStudentProfileError('Öğrenci profili bulunamadı.');
          setActiveStudentProfileData(null);
        } else {
          setActiveStudentProfileData(data);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Profil verileri yüklenemedi.';
        setActiveStudentProfileError(`Profil yüklenemedi: ${message}`);
        setActiveStudentProfileData(null);
      } finally {
        setActiveStudentProfileLoading(false);
      }
    },
    [
      setActiveStudentProfileData,
      setActiveStudentProfileError,
      setActiveStudentProfileLoading,
    ],
  );

  const loadSubmissions = async (assignmentId: string) => {
    setSelectedAssignmentSubmissions(
      await loadAdminAssignmentSubmissions(assignmentId),
    );
  };

  const updateSubmission = async (
    submissionId: string,
    grade: number,
    feedback: string,
  ) => {
    const { error } = await updateAdminSubmissionReview(
      submissionId,
      grade,
      feedback,
    );

    if (!error) {
      if (activeAssignment) loadSubmissions(activeAssignment.id);
      showToast('success', 'Değerlendirme kaydedildi.');
    }
  };

  const applyDashboardData = useCallback(
    (data: AdminDashboardData) => {
      setAnnouncements(data.announcements);
      setAnnualPlanItems(data.annualPlanItems);
      setWorksheetCandidates(data.worksheetCandidates);
      setDocuments(data.documents);
      setAllUsers(data.allUsers);
      setAssignments(data.assignments);
      setSharedDocs(data.sharedDocs);
      setQuizzes(data.quizzes);
      setNotifications(data.notifications);
      setAdminStatuses(data.adminStatuses);
      setWeeklyPlans(data.weeklyPlans);
      setDashboardSubmissions(data.submissions);
      setDashboardQuizResults(data.quizResults);
      setDashboardStudyGoals(data.studyGoals);
      setLiveLessons((current) => ({
        ...current,
        lessons: data.liveLessons.lessons,
      }));
    },
    [
      setAdminStatuses,
      setAllUsers,
      setAnnouncements,
      setAnnualPlanItems,
      setAssignments,
      setDashboardQuizResults,
      setDashboardStudyGoals,
      setDashboardSubmissions,
      setDocuments,
      setLiveLessons,
      setNotifications,
      setQuizzes,
      setSharedDocs,
      setWeeklyPlans,
      setWorksheetCandidates,
    ],
  );

  const refreshLearningActivity = useCallback((): Promise<void> => {
    if (learningActivityRequestRef.current)
      return learningActivityRequestRef.current;

    const request = (async () => {
      if (!learningActivityLoadedRef.current)
        setLearningActivityStatus('loading');
      try {
        const data = await loadAdminLearningActivity();
        setActivityEvents(data.activityEvents);
        setDashboardStudySessions(data.studySessions);
        learningActivityLoadedRef.current = true;
        setLearningActivityStatus('ready');
      } catch (error) {
        log.error('Öğrenci etkinlikleri yüklenemedi', error);
        if (!learningActivityLoadedRef.current)
          setLearningActivityStatus('error');
      }
    })();
    learningActivityRequestRef.current = request;
    void request.finally(() => {
      learningActivityRequestRef.current = null;
    });
    return request;
  }, [
    learningActivityLoadedRef,
    learningActivityRequestRef,
    setActivityEvents,
    setDashboardStudySessions,
    setLearningActivityStatus,
  ]);

  const refreshLiveLessonActivity = useCallback((): Promise<void> => {
    if (liveLessonActivityRequestRef.current)
      return liveLessonActivityRequestRef.current;

    const request = (async () => {
      if (!liveLessonActivityLoadedRef.current)
        setLiveLessonActivityStatus('loading');
      try {
        const data = await loadAdminLiveLessonActivity();
        setLiveLessons((current) => ({ ...current, ...data }));
        liveLessonActivityLoadedRef.current = true;
        setLiveLessonActivityStatus('ready');
      } catch (error) {
        log.error('Canlı ders ayrıntıları yüklenemedi', error);
        if (!liveLessonActivityLoadedRef.current)
          setLiveLessonActivityStatus('error');
      }
    })();
    liveLessonActivityRequestRef.current = request;
    void request.finally(() => {
      liveLessonActivityRequestRef.current = null;
    });
    return request;
  }, [
    liveLessonActivityLoadedRef,
    liveLessonActivityRequestRef,
    setLiveLessonActivityStatus,
    setLiveLessons,
  ]);

  const loadData = useCallback(
    async (adminUserId?: string | null) => {
      applyDashboardData(
        await loadAdminDashboardData(adminUserId ?? adminUserIdRef.current),
      );
      setDashboardVersion((version) => version + 1);
      setDashboardLoaded(true);
      await Promise.all([
        learningActivityLoadedRef.current
          ? refreshLearningActivity()
          : Promise.resolve(),
        liveLessonActivityLoadedRef.current
          ? refreshLiveLessonActivity()
          : Promise.resolve(),
      ]);
    },
    [
      adminUserIdRef,
      applyDashboardData,
      learningActivityLoadedRef,
      liveLessonActivityLoadedRef,
      refreshLearningActivity,
      refreshLiveLessonActivity,
      setDashboardLoaded,
      setDashboardVersion,
    ],
  );

  const refreshGoogleDriveConnection = useCallback(async () => {
    try {
      setGoogleDriveConnection(await loadGoogleDriveConnectionStatus());
    } catch {
      setGoogleDriveConnection({ connected: false });
    }
  }, [setGoogleDriveConnection]);

  const refreshWorksheetSourceStatus = useCallback(
    async (showFeedback = false) => {
      try {
        const status = await loadWorksheetCandidateSourceStatus();
        setWorksheetSourceStatus(status);

        if (showFeedback) {
          showToast(
            status.configured ? 'success' : 'warning',
            status.configured
              ? 'Kaynak ayarları hazır.'
              : 'Kaynak ayarları eksik.',
          );
        }
      } catch {
        setWorksheetSourceStatus({
          allowedHosts: [],
          configured: false,
          sourceUrls: [],
        });

        if (showFeedback) {
          showToast('error', 'Kaynak ayarları kontrol edilemedi.');
        }
      }
    },
    [setWorksheetSourceStatus, showToast],
  );
  return {
    loadStudentProfile,
    loadSubmissions,
    updateSubmission,
    refreshLearningActivity,
    refreshLiveLessonActivity,
    loadData,
    refreshGoogleDriveConnection,
    refreshWorksheetSourceStatus,
  };
}
