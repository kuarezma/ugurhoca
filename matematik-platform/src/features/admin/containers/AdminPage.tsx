'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Calculator,
  LogOut,
  ArrowLeft,
  Plus,
  FileText,
  Megaphone,
  Upload,
  CheckCircle2,
  Users,
  RefreshCw,
  Search,
  Bell,
  ClipboardList,
  BarChart3,
  Activity,
  CalendarDays,
  Video,
  ShieldCheck,
  Globe,
  Sparkles,
  ExternalLink,
  Send,
  GraduationCap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOutClient } from '@/lib/auth-client';
import { useToast } from '@/components/Toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAdminListActions } from '@/features/admin/hooks/useAdminListActions';
import { useAdminModalState } from '@/features/admin/hooks/useAdminModalState';
import { useAdminModalSubmitHandlers } from '@/features/admin/hooks/useAdminModalSubmitHandlers';
import { useAdminNotifications } from '@/features/admin/hooks/useAdminNotifications';
import { broadcastHomeDocumentsUpdated } from '@/features/home/home-documents-events';
import {
  addStudentAdminNote,
  approveAdminWorksheetCandidate,
  createAdminWeeklyPlan,
  discoverAdminWorksheetCandidates,
  disconnectGoogleDriveConnection,
  importAdminAnnualPlan,
  loadAdminAssignmentSubmissions,
  loadAdminDashboardData,
  loadGoogleDriveAuthUrl,
  loadGoogleDriveConnectionStatus,
  loadWorksheetCandidateSourceStatus,
  loadAdminQuizQuestions,
  loadAdminStudentProfile,
  refreshAdminUsers as refreshAdminUsersQuery,
  resolveAdminAuth,
  scanCurrentWeekWorksheetCandidates,
  upsertStudentAdminStatus,
  updateWorksheetCandidateStatus,
  updateAdminSubmissionReview,
} from '@/features/admin/queries';
import type {
  AdminActiveTab,
  AdminAnnouncement as Announcement,
  AdminAssignment as Assignment,
  AdminDashboardData,
  AdminDocument as Document,
  AdminFormState,
  AdminNotification as Notification,
  AdminQuizResultRow,
  AdminQuiz as Quiz,
  AdminQuizQuestion as QuizQuestion,
  AdminSharedDocument as SharedDoc,
  AdminStudyGoalRow,
  AdminStudySessionRow,
  AdminStudentProfileData,
  AdminSubmission as Submission,
  AdminUser,
  AnnualPlanItem,
  GoogleDriveConnectionStatus,
  StudentActivityEvent,
  StudentAdminStatus,
  StudentWeeklyPlan,
  WorksheetCandidate,
  WorksheetCandidateDiscoveryResult,
  WorksheetCandidateSourceStatus,
  WorksheetCandidateStatus,
  WorksheetCandidateWeekScanResult,
} from '@/features/admin/types';
import type { LiveLessonDashboardData } from '@/features/live-lessons/types';

const AdminMainModal = dynamic(
  () => import('@/features/admin/components/AdminMainModal'),
  { loading: () => null },
);

const AdminNotificationDetailModal = dynamic(
  () => import('@/features/admin/components/AdminNotificationDetailModal'),
  { loading: () => null },
);

const AdminNotificationsPanel = dynamic(
  () => import('@/features/admin/components/AdminNotificationsPanel'),
  { loading: () => null },
);

const AdminStudentProfileDrawer = dynamic(
  () => import('@/features/admin/components/AdminStudentProfileDrawer'),
  { loading: () => null },
);

const AdminSubmissionsModal = dynamic(
  () => import('@/features/admin/components/AdminSubmissionsModal'),
  { loading: () => null },
);

const AdminSpotlightModal = dynamic(
  () => import('@/features/admin/components/AdminSpotlightModal'),
  { loading: () => null },
);

const AdminBroadcastModal = dynamic(
  () =>
    import('@/features/admin/components/AdminBroadcastModal').then(
      (mod) => mod.AdminBroadcastModal,
    ),
  { loading: () => null },
);

const AdminDiagnosticsCard = dynamic(
  () =>
    import('@/features/admin/components/AdminDiagnosticsCard').then(
      (mod) => mod.AdminDiagnosticsCard,
    ),
  { loading: () => null },
);

const AdminTabPanels = dynamic(
  () => import('@/features/admin/components/AdminTabPanels'),
  {
    loading: () => (
      <div className="glass rounded-3xl p-8 text-center animate-fade-in">
        <div className="mx-auto h-10 w-10 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-slate-400">
          Admin paneli yükleniyor...
        </p>
      </div>
    ),
  },
);

const GOOGLE_DRIVE_CALLBACK_MESSAGES: Record<
  string,
  { message: string; type: 'error' | 'success' }
> = {
  auth_required: {
    message: 'Google Drive bağlantısı için tekrar giriş yapmanız gerekiyor.',
    type: 'error',
  },
  connected: {
    message: 'Google Drive bağlantısı kuruldu.',
    type: 'success',
  },
  error: {
    message: 'Google Drive bağlantısı tamamlanamadı.',
    type: 'error',
  },
  missing_refresh_token: {
    message:
      'Google Drive kalıcı erişim izni vermedi. Bağlantıyı tekrar başlatın.',
    type: 'error',
  },
  state_error: {
    message:
      'Google Drive bağlantı doğrulaması geçersiz oldu. Lütfen tekrar deneyin.',
    type: 'error',
  },
};

export default function AdminPage() {
  const RETENTION_DAYS = 180;
  const { showToast } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<AdminActiveTab>('statistics');
  const [tabCategory, setTabCategory] = useState<
    'all' | 'general' | 'education' | 'curriculum'
  >('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [annualPlanItems, setAnnualPlanItems] = useState<AnnualPlanItem[]>([]);
  const [worksheetCandidates, setWorksheetCandidates] = useState<
    WorksheetCandidate[]
  >([]);
  const [googleDriveConnection, setGoogleDriveConnection] =
    useState<GoogleDriveConnectionStatus | null>(null);
  const [worksheetSourceStatus, setWorksheetSourceStatus] =
    useState<WorksheetCandidateSourceStatus | null>(null);
  const [isGoogleDriveBusy, setIsGoogleDriveBusy] = useState(false);
  const [isWeekScanRunning, setIsWeekScanRunning] = useState(false);
  const [lastWeekScanResult, setLastWeekScanResult] =
    useState<WorksheetCandidateWeekScanResult | null>(null);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sharedDocs, setSharedDocs] = useState<SharedDoc[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedAssignmentSubmissions, setSelectedAssignmentSubmissions] =
    useState<Submission[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminStatuses, setAdminStatuses] = useState<StudentAdminStatus[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<StudentWeeklyPlan[]>([]);
  const [dashboardSubmissions, setDashboardSubmissions] = useState<
    Submission[]
  >([]);
  const [dashboardQuizResults, setDashboardQuizResults] = useState<
    AdminQuizResultRow[]
  >([]);
  const [dashboardStudySessions, setDashboardStudySessions] = useState<
    AdminStudySessionRow[]
  >([]);
  const [dashboardStudyGoals, setDashboardStudyGoals] = useState<
    AdminStudyGoalRow[]
  >([]);
  const [activityEvents, setActivityEvents] = useState<StudentActivityEvent[]>(
    [],
  );
  const [liveLessons, setLiveLessons] = useState<LiveLessonDashboardData>({
    chatMessages: [],
    events: [],
    lessons: [],
    participants: [],
  });
  const [activeStudentProfileId, setActiveStudentProfileId] = useState<string | null>(null);
  const [activeStudentProfileData, setActiveStudentProfileData] =
    useState<AdminStudentProfileData | null>(null);
  const [activeStudentProfileError, setActiveStudentProfileError] =
    useState<string | null>(null);
  const [activeStudentProfileLoading, setActiveStudentProfileLoading] =
    useState(false);
  const [pdfStudentsLoading, setPdfStudentsLoading] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const router = useRouter();
  const {
    activeAssignment,
    adminMsgImagePreview,
    adminMsgImageUrl,
    adminMsgRecipient,
    adminMsgText,
    adminMsgTitle,
    closeSubmissionsModal,
    editingAnnouncement,
    editingDoc,
    editingUser,
    formData,
    isSubmitting,
    modalType,
    openAdminMessage,
    openEditAnnouncement,
    openEditDocument,
    openEditQuiz,
    openModal,
    openSubmissionsModal,
    resetModalState,
    selectedDoc,
    selectedQuiz,
    setAdminMsgImagePreview,
    setAdminMsgImageUrl,
    setAdminMsgText,
    setAdminMsgTitle,
    setFormData,
    setIsSubmitting,
    setSelectedDoc,
    setSelectedQuiz,
    showModal,
    showSubmissionsModal,
    success,
    setSuccess,
    openEditUser,
  } = useAdminModalState();

  const refreshUsers = useCallback(async () => {
    if (
      typeof document !== 'undefined' &&
      document.visibilityState !== 'visible'
    ) {
      return;
    }

    setAllUsers(await refreshAdminUsersQuery());
  }, []);
  const activeStudentProfileUser = activeStudentProfileId
    ? allUsers.find((currentUser) => currentUser.id === activeStudentProfileId) || null
    : null;

  const loadStudentProfile = useCallback(async (studentId: string) => {
    setActiveStudentProfileLoading(true);
    setActiveStudentProfileError(null);

    try {
      const data = await loadAdminStudentProfile(studentId);

      if (!data) {
        setActiveStudentProfileError("Öğrenci profili bulunamadı.");
        setActiveStudentProfileData(null);
      } else {
        setActiveStudentProfileData(data);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profil verileri yüklenemedi.";
      setActiveStudentProfileError(`Profil yüklenemedi: ${message}`);
      setActiveStudentProfileData(null);
    } finally {
      setActiveStudentProfileLoading(false);
    }
  }, []);

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

  const applyDashboardData = useCallback((data: AdminDashboardData) => {
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
    setDashboardStudySessions(data.studySessions);
    setDashboardStudyGoals(data.studyGoals);
    setActivityEvents(data.activityEvents);
    setLiveLessons(data.liveLessons);
  }, []);

  const loadData = useCallback(
    async (adminUserId?: string | null) => {
      applyDashboardData(
        await loadAdminDashboardData(RETENTION_DAYS, adminUserId ?? user?.id),
      );
    },
    [RETENTION_DAYS, applyDashboardData, user?.id],
  );

  const refreshGoogleDriveConnection = useCallback(async () => {
    try {
      setGoogleDriveConnection(await loadGoogleDriveConnectionStatus());
    } catch {
      setGoogleDriveConnection({ connected: false });
    }
  }, []);

  const refreshWorksheetSourceStatus = useCallback(async (showFeedback = false) => {
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
  }, [showToast]);

  const {
    applyModerationAction,
    deleteMessage,
    formatRelativeTime,
    getMetadataText,
    getNotificationBody,
    isIncomingAdminMessage,
    markNotificationAsRead,
    replyText,
    selectedNotification,
    selectedNotificationPayload,
    selectedNotificationStatus,
    sendReply,
    setReplyText,
    setSelectedNotification,
    setShowNotifications,
    showNotifications,
    unreadNotifications,
  } = useAdminNotifications({
    currentUserId: user?.id,
    loadData,
    notifications,
    setNotifications,
    users: allUsers,
  });

  const {
    deleteItem,
    editAssignment,
    editSharedDocument,
    handleDownloadStudentsPdf,
    handleMigrateWorksheetDocuments,
    handleRefreshDocumentCategories,
    handleToggleFavoriteStudent,
    handleUpdateGrades,
    studentUsers,
  } = useAdminListActions({
    allUsers,
    announcements,
    assignments,
    documents,
    loadData,
    quizzes,
    setAllUsers,
    setAnnouncements,
    setAssignments,
    setDocuments,
    setIsSubmitting,
    setPdfStudentsLoading,
    setQuizzes,
    setSharedDocs,
    sharedDocs,
  });

  const {
    handleAdminMessageSubmit,
    handleEditDocumentSubmit,
    handleEditUserSubmit,
    handleSendDocSubmit,
    handleSubmit,
  } = useAdminModalSubmitHandlers({
    adminMsgImageUrl,
    adminMsgRecipient,
    adminMsgText,
    adminMsgTitle,
    allUsers,
    announcements,
    assignments,
    documents,
    editingAnnouncement,
    editingDoc,
    editingUser,
    formData,
    loadData,
    modalType,
    quizQuestions,
    quizzes,
    resetModalState,
    selectedDoc,
    selectedQuiz,
    setAnnouncements,
    setAssignments,
    setDocuments,
    setIsSubmitting,
    setQuizQuestions,
    setQuizzes,
    setSharedDocs,
    setSuccess,
    sharedDocs,
    studentUsers,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const authResult = await resolveAdminAuth();

      if (authResult.status !== 'ok') {
        router.push(authResult.status === 'unauthenticated' ? '/giris' : '/');
        return;
      }

      setUser(authResult.user);
      await loadData(authResult.user.id);
      await Promise.all([
        refreshGoogleDriveConnection(),
        refreshWorksheetSourceStatus(),
      ]);
    };
    void checkAuth();
  }, [
    loadData,
    refreshGoogleDriveConnection,
    refreshWorksheetSourceStatus,
    router,
  ]);

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    const driveStatus = new URLSearchParams(window.location.search).get('drive');
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
    const interval = setInterval(() => {
      void refreshUsers();
    }, 30000);

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
  }, [refreshUsers]);

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
  }, []);

  const handleLogout = async () => {
    await signOutClient();
    router.push('/');
  };

  const loadQuizQuestions = async (quizId: string) => {
    setQuizQuestions(await loadAdminQuizQuestions(quizId));
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Bilinmiyor';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getQuizFormState = (quiz: Quiz): AdminFormState => ({
    description: quiz.description ?? '',
    difficulty: quiz.difficulty,
    grade: quiz.grade,
    is_active: quiz.is_active ?? true,
    time_limit: quiz.time_limit,
    title: quiz.title,
  });

  const lastGradeUpdate =
    typeof window === 'undefined'
      ? null
      : localStorage.getItem('lastGradeUpdate');

  const handleAddQuizQuestion = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    await loadQuizQuestions(quiz.id);
    openModal('addQuestion');
  };

  const handleOpenStudentProfile = async (studentProfile: AdminUser) => {
    setActiveStudentProfileData(null);
    setActiveStudentProfileError(null);
    setActiveStudentProfileId(studentProfile.id);

    if (studentProfile.id === activeStudentProfileId) {
      await loadStudentProfile(studentProfile.id);
    }
  };

  const handleCloseStudentProfile = useCallback(() => {
    setActiveStudentProfileId(null);
    setActiveStudentProfileData(null);
    setActiveStudentProfileError(null);
    setActiveStudentProfileLoading(false);
  }, []);

  const handleOpenSubmissions = async (assignment: Assignment) => {
    await loadSubmissions(assignment.id);
    openSubmissionsModal(assignment);
  };

  const handleImportAnnualPlan = async (file: File) => {
    const result = await importAdminAnnualPlan(file);
    await loadData(user?.id);
    return result;
  };

  const handleDiscoverWorksheetCandidates = async (
    item: AnnualPlanItem,
  ): Promise<WorksheetCandidateDiscoveryResult> => {
    const result = await discoverAdminWorksheetCandidates(item.id);
    await loadData(user?.id);
    return result;
  };

  const handleUpdateWorksheetCandidateStatus = async (
    candidate: WorksheetCandidate,
    status: Extract<WorksheetCandidateStatus, 'pending' | 'rejected'>,
    rejectionReason?: string | null,
  ) => {
    if (!user) return;

    try {
      const updatedCandidate = await updateWorksheetCandidateStatus({
        candidateId: candidate.id,
        rejectionReason,
        reviewedBy: user.id,
        status,
      });
      setWorksheetCandidates((currentCandidates) =>
        currentCandidates.map((currentCandidate) =>
          currentCandidate.id === updatedCandidate.id
            ? updatedCandidate
            : currentCandidate,
        ),
      );
      showToast(
        'success',
        status === 'rejected'
          ? 'Aday test reddedildi.'
          : 'Aday test tekrar beklemeye alındı.',
      );
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Aday test durumu güncellenemedi.',
      );
    }
  };

  const handleApproveWorksheetCandidate = async (
    candidate: WorksheetCandidate,
  ) => {
    try {
      const result = await approveAdminWorksheetCandidate(candidate.id);
      showToast(
        result.notificationWarning ? 'warning' : 'success',
        result.notificationWarning
          ? result.notificationWarning
          : result.notifiedStudents > 0
          ? `Aday test yayınlandı. ${result.notifiedStudents} öğrenciye bildirim gönderildi.`
          : 'Aday test yayınlandı. Bu sınıfta bildirim gönderilecek öğrenci bulunamadı.',
      );
      await loadData(user?.id);
      broadcastHomeDocumentsUpdated();
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Aday test yayınlanamadı.',
      );
    }
  };

  const handleConnectGoogleDrive = async () => {
    setIsGoogleDriveBusy(true);
    try {
      const { url } = await loadGoogleDriveAuthUrl();
      window.location.href = url;
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Google Drive bağlantısı başlatılamadı.',
      );
      setIsGoogleDriveBusy(false);
    }
  };

  const handleDisconnectGoogleDrive = async () => {
    setIsGoogleDriveBusy(true);
    try {
      const status = await disconnectGoogleDriveConnection();
      setGoogleDriveConnection(status);
      showToast('success', 'Google Drive bağlantısı kesildi.');
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Google Drive bağlantısı kesilemedi.',
      );
    } finally {
      setIsGoogleDriveBusy(false);
    }
  };

  const handleScanCurrentWeekCandidates = async () => {
    setIsWeekScanRunning(true);
    try {
      const result = await scanCurrentWeekWorksheetCandidates();
      setLastWeekScanResult(result);
      await loadData(user?.id);
      showToast(
        result.inserted > 0 ? 'success' : 'info',
        result.inserted > 0
          ? `${result.inserted} yeni test adayı bulundu.`
          : 'Bu hafta için yeni test adayı bulunamadı.',
      );
    } catch (error) {
      showToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Bu hafta taraması yapılamadı.',
      );
    } finally {
      setIsWeekScanRunning(false);
    }
  };

  const refreshAfterStudentTrackingChange = async (studentId: string) => {
    await loadData(user?.id);
    if (activeStudentProfileId === studentId) {
      await loadStudentProfile(studentId);
    }
  };

  const handleCreateWeeklyPlan = async (student: AdminUser) => {
    if (!user) return;

    const title =
      window.prompt(
        `${student.name || 'Öğrenci'} için haftalık plan başlığı`,
        'Bu Haftaki Plan',
      )?.trim() || '';

    if (!title) return;

    const rawItems =
      window.prompt(
        'Plan maddelerini virgül veya satır satır yazın',
        'Eksik konuyu tekrar et, 1 test çöz, Ödevleri kontrol et',
      ) || '';
    const itemTitles = rawItems
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (itemTitles.length === 0) {
      showToast('warning', 'En az bir plan maddesi ekleyin.');
      return;
    }

    try {
      await createAdminWeeklyPlan({
        authorId: user.id,
        itemTitles,
        studentId: student.id,
        title,
      });
      showToast('success', 'Haftalık plan kaydedildi.');
      await refreshAfterStudentTrackingChange(student.id);
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'Haftalık plan kaydedilemedi.',
      );
    }
  };

  const handleUpdateStudentStatus = async (
    student: AdminUser,
    status: StudentAdminStatus['status'],
    labels?: string[],
  ) => {
    if (!user) return;

    try {
      const followUpAt =
        status === 'normal'
          ? null
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      await upsertStudentAdminStatus({
        adminId: user.id,
        followUpAt,
        labels:
          labels ??
          (status === 'risk'
            ? ['risk']
            : status === 'watch'
              ? ['takipte']
              : []),
        status,
        studentId: student.id,
      });
      showToast('success', 'Takip durumu güncellendi.');
      await refreshAfterStudentTrackingChange(student.id);
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'Takip durumu kaydedilemedi.',
      );
    }
  };

  const handleAddStudentAdminNote = async (student: AdminUser) => {
    if (!user) return;
    const body =
      window.prompt(`${student.name || 'Öğrenci'} için admin notu`)?.trim() ||
      '';

    if (!body) return;

    try {
      await addStudentAdminNote({
        authorId: user.id,
        body,
        studentId: student.id,
      });
      showToast('success', 'Admin notu kaydedildi.');
      await refreshAfterStudentTrackingChange(student.id);
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'Admin notu kaydedilemedi.',
      );
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    openEditQuiz(quiz, getQuizFormState(quiz));
  };

  if (!user) return null;

  return (
    <main className="admin-page min-h-screen gradient-bg pb-20">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 py-2.5 px-4 sm:py-3 sm:px-6 shadow-xl shadow-black/20">
        <div className="container mx-auto flex min-w-0 items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-brand-primary via-indigo-600 to-brand-secondary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform duration-200">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-sm sm:text-base font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-tight">
                Uğur Hoca
              </span>
              <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-cyan-300 tracking-wide">
                <ShieldCheck className="w-3 h-3" />
                Yönetici Portalı
              </span>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Siteyi Gör
            </Link>

            <button
              type="button"
              onClick={() => setIsSpotlightOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold h-9"
              title="Hızlı Ara (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Hızlı Ara</span>
              <kbd className="hidden md:inline rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle compact className="h-9 w-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10" />

            <button
              onClick={() => setShowNotifications((v) => !v)}
              aria-label="Bildirimler"
              className="relative h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/50 animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            <div className="h-5 w-px bg-white/10 mx-0.5 hidden sm:block" />

            <button
              onClick={handleLogout}
              className="btn-secondary text-xs px-3 py-1.5 rounded-xl h-9 flex items-center gap-1.5"
              title="Oturumu Kapat"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </nav>

      {showNotifications && (
        <AdminNotificationsPanel
          formatRelativeTime={formatRelativeTime}
          getNotificationBody={getNotificationBody}
          isIncomingAdminMessage={isIncomingAdminMessage}
          notifications={notifications}
          onSelectNotification={markNotificationAsRead}
          unreadCount={unreadNotifications.length}
        />
      )}

      {selectedNotification && (
        <AdminNotificationDetailModal
          getMetadataText={getMetadataText}
          getNotificationBody={getNotificationBody}
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onDelete={deleteMessage}
          onModerationAction={applyModerationAction}
          onReplyTextChange={setReplyText}
          onSendReply={sendReply}
          payload={selectedNotificationPayload}
          replyText={replyText}
          status={selectedNotificationStatus}
        />
      )}

      <div className="pt-20 sm:pt-24 px-4 sm:px-6 overflow-x-clip">
        <div className="container mx-auto min-w-0">
          {/* Executive Welcome & KPI Summary Hero */}
          <div className="glass rounded-3xl p-5 sm:p-7 mb-8 border border-white/10 shadow-2xl relative overflow-hidden animate-fade-up">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <Link
                    href="/profil"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mr-2 group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Profil'e Dön
                  </Link>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Yönetici Portalı
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sistem Aktif
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Hoş Geldiniz, {user.name || 'Uğur Hoca'} 👋
                </h1>
                <p className="text-slate-300/80 text-sm sm:text-base mt-1.5 max-w-xl leading-relaxed">
                  Öğrenci takibi, çalışma kağıtları, sınavlar ve canlı derslerinizi tek merkezden uyumla yönetin.
                </p>
              </div>

              {/* Quick KPI Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                <div className="glass rounded-2xl p-3 sm:p-4 text-center border border-white/10 hover:border-violet-500/40 transition-colors">
                  <div className="text-xl sm:text-2xl font-black text-white">{studentUsers.length}</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Öğrenci</div>
                </div>
                <div className="glass rounded-2xl p-3 sm:p-4 text-center border border-white/10 hover:border-blue-500/40 transition-colors">
                  <div className="text-xl sm:text-2xl font-black text-white">{documents.length}</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">İçerik & Belge</div>
                </div>
                <div className="glass rounded-2xl p-3 sm:p-4 text-center border border-white/10 hover:border-pink-500/40 transition-colors">
                  <div className="text-xl sm:text-2xl font-black text-white">{quizzes.length}</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Test / Sınav</div>
                </div>
                <div className="glass rounded-2xl p-3 sm:p-4 text-center border border-white/10 hover:border-amber-500/40 transition-colors">
                  <div className="text-xl sm:text-2xl font-black text-amber-300">
                    {worksheetCandidates.filter((c) => c.status === 'pending').length}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Aday Test</div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons Strip */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Hızlı Eylemler:
              </span>
              <button
                onClick={() => openModal('document')}
                className="btn-primary text-xs py-2 px-3 sm:px-4 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni Belge Ekle
              </button>
              <button
                onClick={() => openModal('announcement')}
                className="btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl"
              >
                <Megaphone className="w-3.5 h-3.5 text-pink-400" />
                Yeni Duyuru
              </button>
              <button
                onClick={() => setIsBroadcastOpen(true)}
                className="btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl"
              >
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                Toplu Bildirim
              </button>
              <button
                onClick={() => openModal('quiz')}
                className="btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                Yeni Test
              </button>
              <button
                onClick={() => openModal('assignment')}
                className="btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl"
              >
                <ClipboardList className="w-3.5 h-3.5 text-rose-400" />
                Ödev Ver
              </button>
              <Link
                href="/"
                target="_blank"
                className="btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl ml-auto"
                title="Platformun ön yüzünü yeni sekmede aç"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Siteyi Aç</span>
              </Link>
            </div>
          </div>

          {/* System Diagnostics & Integration Status Card */}
          <AdminDiagnosticsCard
            driveConnected={Boolean(googleDriveConnection?.connected)}
            pendingCandidatesCount={worksheetCandidates.filter((c) => c.status === 'pending').length}
            unreadMessagesCount={notifications.filter((n) => !n.is_read && n.type === 'message').length}
            studentCount={studentUsers.length}
            onRefresh={() => {
              void loadData();
              void refreshUsers();
              void refreshGoogleDriveConnection();
            }}
          />

          {/* Category Filter Pills & Tab Navigation */}
          <div className="sticky top-14 sm:top-16 z-40 -mx-4 sm:mx-0 mb-6 sm:mb-8 px-4 sm:px-0 py-3 backdrop-blur-md bg-slate-950/40 rounded-2xl border border-white/5">
            {/* Category Segment Filter */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                { id: 'all', label: 'Tümü', count: 12 },
                { id: 'general', label: '📊 Genel & Takip', count: 4 },
                { id: 'education', label: '📚 Eğitim & İçerik', count: 4 },
                { id: 'curriculum', label: '⚙️ Plan & Otomasyon', count: 4 },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setTabCategory(cat.id as typeof tabCategory)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    tabCategory === cat.id
                      ? 'bg-brand-primary text-white shadow-md shadow-violet-500/25'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                  <span className="ml-1.5 opacity-60 text-[10px]">({cat.count})</span>
                </button>
              ))}
            </div>

            {/* Individual Tab Buttons */}
            <div className="flex flex-nowrap gap-1.5 sm:gap-2.5 overflow-x-auto pb-1 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                {
                  id: 'statistics',
                  label: 'İstatistikler',
                  shortLabel: 'İstat.',
                  icon: BarChart3,
                  color: 'from-emerald-500 to-teal-500',
                  category: 'general',
                  badge: null,
                },
                {
                  id: 'tracking',
                  label: 'Takip Merkezi',
                  shortLabel: 'Takip',
                  icon: Activity,
                  color: 'from-cyan-500 to-blue-500',
                  category: 'general',
                  badge: null,
                },
                {
                  id: 'classroom',
                  label: 'Sınıfım & Şube Masası',
                  shortLabel: 'Sınıfım',
                  icon: GraduationCap,
                  color: 'from-amber-500 via-orange-500 to-rose-500',
                  category: 'general',
                  badge: studentUsers.length > 0 ? studentUsers.length : null,
                },
                {
                  id: 'users',
                  label: 'Kullanıcılar',
                  shortLabel: 'Kullanıcılar',
                  icon: Users,
                  color: 'from-indigo-500 to-purple-500',
                  category: 'general',
                  badge: studentUsers.length,
                },
                {
                  id: 'documents',
                  label: 'Belgeler',
                  shortLabel: 'Belgeler',
                  icon: FileText,
                  color: 'from-blue-500 to-cyan-500',
                  category: 'education',
                  badge: documents.length,
                },
                {
                  id: 'quizzes',
                  label: 'Testler',
                  shortLabel: 'Testler',
                  icon: CheckCircle2,
                  color: 'from-violet-500 to-purple-500',
                  category: 'education',
                  badge: quizzes.length,
                },
                {
                  id: 'assignments',
                  label: 'Ödevlendirme',
                  shortLabel: 'Ödevler',
                  icon: ClipboardList,
                  color: 'from-rose-500 to-pink-500',
                  category: 'education',
                  badge: assignments.length,
                },
                {
                  id: 'liveLessons',
                  label: 'Canlı Dersler',
                  shortLabel: 'Canlı Ders',
                  icon: Video,
                  color: 'from-sky-500 to-indigo-500',
                  category: 'education',
                  badge: liveLessons.lessons.length > 0 ? liveLessons.lessons.length : null,
                },
                {
                  id: 'annualPlan',
                  label: 'Yıllık Plan',
                  shortLabel: 'Plan',
                  icon: CalendarDays,
                  color: 'from-emerald-500 to-teal-500',
                  category: 'curriculum',
                  badge: annualPlanItems.length > 0 ? annualPlanItems.length : null,
                },
                {
                  id: 'worksheetCandidates',
                  label: 'Test Adayları',
                  shortLabel: 'Adaylar',
                  icon: Search,
                  color: 'from-amber-500 to-orange-500',
                  category: 'curriculum',
                  badge: worksheetCandidates.filter((c) => c.status === 'pending').length || null,
                  badgeAlert: worksheetCandidates.filter((c) => c.status === 'pending').length > 0,
                },
                {
                  id: 'gradeUpdate',
                  label: 'Sınıf Güncelle',
                  shortLabel: 'Sınıf',
                  icon: RefreshCw,
                  color: 'from-teal-500 to-cyan-500',
                  category: 'curriculum',
                  badge: null,
                },
                {
                  id: 'announcements',
                  label: 'Duyurular',
                  shortLabel: 'Duyurular',
                  icon: Megaphone,
                  color: 'from-pink-500 to-rose-500',
                  category: 'curriculum',
                  badge: announcements.length,
                },
              ]
                .filter((tab) => tabCategory === 'all' || tab.category === tabCategory)
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminActiveTab)}
                    className={`relative overflow-hidden px-3 py-2 sm:px-4 sm:py-3 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 border shadow-md ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white border-white/25 shadow-lg shadow-violet-500/20 ring-1 ring-white/20`
                        : `bg-slate-900/80 border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-slate-800/80`
                    }`}
                  >
                    {activeTab === tab.id && (
                      <span className="absolute inset-0 bg-white/10 pointer-events-none" />
                    )}
                    <tab.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0" />
                    <span className="relative font-semibold text-xs sm:text-sm">
                      {tab.label}
                    </span>
                    {tab.badge !== null && (
                      <span
                        className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                          tab.badgeAlert
                            ? 'bg-amber-400 text-slate-950 animate-pulse'
                            : activeTab === tab.id
                              ? 'bg-white/25 text-white'
                              : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>

          {activeTab !== 'statistics' &&
            activeTab !== 'tracking' &&
            activeTab !== 'classroom' &&
            activeTab !== 'annualPlan' &&
            activeTab !== 'worksheetCandidates' &&
            activeTab !== 'users' &&
            activeTab !== 'gradeUpdate' &&
            activeTab !== 'assignments' &&
            activeTab !== 'quizzes' &&
            activeTab !== 'liveLessons' && (
              <div className="flex justify-stretch sm:justify-end mb-6">
                <button
                  onClick={() =>
                    openModal(
                      activeTab === 'announcements' ? 'announcement' : 'document',
                    )
                  }
                  className="btn-primary w-full sm:w-auto justify-center"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Ekle
                </button>
              </div>
            )}

          {activeTab === 'quizzes' && (
            <div className="flex flex-col justify-stretch gap-3 mb-6 sm:flex-row sm:justify-end">
              <button
                onClick={() => openModal('quiz')}
                className="btn-primary w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5" />
                Yeni Test
              </button>
              <button
                onClick={() => openModal('importQuestions')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-95 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center"
              >
                <Upload className="w-5 h-5" />
                Toplu Yükle
              </button>
            </div>
          )}

          <AdminTabPanels
            activeTab={activeTab}
            activityEvents={activityEvents}
            adminStatuses={adminStatuses}
            announcements={announcements}
            annualPlanItems={annualPlanItems}
            assignments={assignments}
            dashboardQuizResults={dashboardQuizResults}
            dashboardStudyGoals={dashboardStudyGoals}
            dashboardStudySessions={dashboardStudySessions}
            dashboardSubmissions={dashboardSubmissions}
            documents={documents}
            formatDate={formatDate}
            googleDriveConnection={googleDriveConnection}
            isSubmitting={isSubmitting}
            isGoogleDriveBusy={isGoogleDriveBusy}
            isWeekScanRunning={isWeekScanRunning}
            lastGradeUpdate={lastGradeUpdate}
            lastWeekScanResult={lastWeekScanResult}
            liveLessons={liveLessons}
            notifications={notifications}
            onAddQuizQuestion={handleAddQuizQuestion}
            onApproveWorksheetCandidate={handleApproveWorksheetCandidate}
            onConnectGoogleDrive={handleConnectGoogleDrive}
            onCreateAnnouncement={() => openModal('announcement')}
            onCreateAssignment={() => openModal('assignment')}
            onCreateSendDocument={() => openModal('sendDoc')}
            onCreateWeeklyPlan={handleCreateWeeklyPlan}
            onDiscoverWorksheetCandidates={handleDiscoverWorksheetCandidates}
            onDeleteAnnouncement={(id) => deleteItem('announcement', id)}
            onDeleteAssignment={(id) => deleteItem('assignment', id)}
            onDeleteDocument={(id) => deleteItem('document', id)}
            onDeleteQuiz={(id) => deleteItem('quiz', id)}
            onDeleteSharedDocument={(id) => deleteItem('shared_document', id)}
            onDisconnectGoogleDrive={handleDisconnectGoogleDrive}
            onDownloadStudentsPdf={handleDownloadStudentsPdf}
            onEditAnnouncement={openEditAnnouncement}
            onEditAssignment={editAssignment}
            onEditDocument={openEditDocument}
            onEditQuiz={handleEditQuiz}
            onEditSharedDocument={editSharedDocument}
            onEditUser={openEditUser}
            onImportAnnualPlan={handleImportAnnualPlan}
            onMigrateWorksheets={handleMigrateWorksheetDocuments}
            onRefreshDocumentCategories={handleRefreshDocumentCategories}
            onRefreshWorksheetSourceStatus={() => refreshWorksheetSourceStatus(true)}
            onRefreshUsers={loadData}
            onScanCurrentWeekCandidates={handleScanCurrentWeekCandidates}
            onSendAdminMessage={openAdminMessage}
            onShowSubmissions={handleOpenSubmissions}
            onToggleFavoriteStudent={handleToggleFavoriteStudent}
            onUpdateStudentStatus={handleUpdateStudentStatus}
            onUpdateGrades={handleUpdateGrades}
            onUpdateWorksheetCandidateStatus={
              handleUpdateWorksheetCandidateStatus
            }
            onViewStudentProfile={handleOpenStudentProfile}
            pdfStudentsLoading={pdfStudentsLoading}
            quizzes={quizzes}
            sharedDocs={sharedDocs}
            studentUsers={studentUsers}
            weeklyPlans={weeklyPlans}
            worksheetSourceStatus={worksheetSourceStatus}
            worksheetCandidates={worksheetCandidates}
          />
        </div>
      </div>

      {showModal && (
        <AdminMainModal
          adminMsgImagePreview={adminMsgImagePreview}
          adminMsgRecipient={adminMsgRecipient}
          adminMsgText={adminMsgText}
          adminMsgTitle={adminMsgTitle}
          documents={documents}
          editingDoc={editingDoc}
          editingUser={editingUser}
          formData={formData}
          isSubmitting={isSubmitting}
          modalType={modalType}
          onAdminMessageSubmit={handleAdminMessageSubmit}
          onClose={resetModalState}
          onEditDocumentSubmit={handleEditDocumentSubmit}
          onEditUserSubmit={handleEditUserSubmit}
          onGenericSubmit={handleSubmit}
          onSendDocSubmit={handleSendDocSubmit}
          selectedDoc={selectedDoc}
          setAdminMsgImagePreview={setAdminMsgImagePreview}
          setAdminMsgImageUrl={setAdminMsgImageUrl}
          setAdminMsgText={setAdminMsgText}
          setAdminMsgTitle={setAdminMsgTitle}
          setFormData={setFormData}
          setIsSubmitting={setIsSubmitting}
          setSelectedDoc={setSelectedDoc}
          studentUsers={studentUsers}
          success={success}
        />
      )}

      {showSubmissionsModal && activeAssignment && (
        <AdminSubmissionsModal
          assignment={activeAssignment}
          onClose={closeSubmissionsModal}
          onUpdateSubmission={updateSubmission}
          submissions={selectedAssignmentSubmissions}
        />
      )}

      <AnimatePresence>
        {activeStudentProfileId && (
          <AdminStudentProfileDrawer
            data={activeStudentProfileData}
            error={activeStudentProfileError}
            formatDate={formatDate}
            isLoading={activeStudentProfileLoading}
            onAddAdminNote={handleAddStudentAdminNote}
            onClose={handleCloseStudentProfile}
            onCreateWeeklyPlan={handleCreateWeeklyPlan}
            onUpdateStatus={handleUpdateStudentStatus}
            student={activeStudentProfileUser}
          />
        )}
      </AnimatePresence>

      <AdminSpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        students={studentUsers}
        quizzes={quizzes}
        documents={documents}
        liveLessons={liveLessons.lessons}
        onSelectStudent={(student) => void handleOpenStudentProfile(student)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
        onOpenModal={(modal) => openModal(modal)}
        onOpenBroadcast={() => setIsBroadcastOpen(true)}
      />

      <AdminBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        students={studentUsers}
      />
    </main>
  );
}
