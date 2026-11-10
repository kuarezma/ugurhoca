import type {
  AppUser,
  ContentDocument,
  SharedDocumentAssignment,
} from '@/types';
import type { AnnualPlanImportResult } from '@/features/admin/types';
import type { Dispatch, SetStateAction } from 'react';
import { useAdminListActions } from '@/features/admin/hooks/useAdminListActions';
import { useAdminModalState } from '@/features/admin/hooks/useAdminModalState';
import { useAdminModalSubmitHandlers } from '@/features/admin/hooks/useAdminModalSubmitHandlers';
import { useAdminNotifications } from '@/features/admin/hooks/useAdminNotifications';
import type {
  AdminActiveTab,
  AdminAnnouncement as Announcement,
  AdminAssignment as Assignment,
  AdminNotification as Notification,
  AdminQuizResultRow,
  AdminQuiz as Quiz,
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

export type AdminViewProps = {
  setIsSpotlightOpen: Dispatch<SetStateAction<boolean>>;
  setShowNotifications: ReturnType<
    typeof useAdminNotifications
  >['setShowNotifications'];
  unreadNotifications: ReturnType<
    typeof useAdminNotifications
  >['unreadNotifications'];
  handleLogout: () => Promise<void>;
  showNotifications: ReturnType<
    typeof useAdminNotifications
  >['showNotifications'];
  formatRelativeTime: ReturnType<
    typeof useAdminNotifications
  >['formatRelativeTime'];
  getNotificationBody: ReturnType<
    typeof useAdminNotifications
  >['getNotificationBody'];
  isIncomingAdminMessage: ReturnType<
    typeof useAdminNotifications
  >['isIncomingAdminMessage'];
  notifications: Notification[];
  markNotificationAsRead: ReturnType<
    typeof useAdminNotifications
  >['markNotificationAsRead'];
  selectedNotification: ReturnType<
    typeof useAdminNotifications
  >['selectedNotification'];
  getMetadataText: ReturnType<typeof useAdminNotifications>['getMetadataText'];
  setSelectedNotification: ReturnType<
    typeof useAdminNotifications
  >['setSelectedNotification'];
  deleteMessage: ReturnType<typeof useAdminNotifications>['deleteMessage'];
  applyModerationAction: ReturnType<
    typeof useAdminNotifications
  >['applyModerationAction'];
  setReplyText: ReturnType<typeof useAdminNotifications>['setReplyText'];
  sendReply: ReturnType<typeof useAdminNotifications>['sendReply'];
  selectedNotificationPayload: ReturnType<
    typeof useAdminNotifications
  >['selectedNotificationPayload'];
  replyText: ReturnType<typeof useAdminNotifications>['replyText'];
  selectedNotificationStatus: ReturnType<
    typeof useAdminNotifications
  >['selectedNotificationStatus'];
  user: AppUser;
  studentUsers: ReturnType<typeof useAdminListActions>['studentUsers'];
  documents: ContentDocument[];
  quizzes: Quiz[];
  worksheetCandidates: WorksheetCandidate[];
  openModal: ReturnType<typeof useAdminModalState>['openModal'];
  setIsBroadcastOpen: Dispatch<SetStateAction<boolean>>;
  googleDriveConnection: GoogleDriveConnectionStatus | null;
  loadData: (adminUserId?: string | null) => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshGoogleDriveConnection: () => Promise<void>;
  setTabCategory: Dispatch<
    SetStateAction<'all' | 'curriculum' | 'general' | 'education'>
  >;
  tabCategory: 'all' | 'curriculum' | 'general' | 'education';
  assignments: Assignment[];
  liveLessons: LiveLessonDashboardData;
  annualPlanItems: AnnualPlanItem[];
  announcements: Announcement[];
  setActiveTab: Dispatch<SetStateAction<AdminActiveTab>>;
  activeTab: AdminActiveTab;
  dashboardVersion: number;
  activityEvents: StudentActivityEvent[];
  learningActivityStatus: 'error' | 'idle' | 'loading' | 'ready';
  liveLessonActivityStatus: 'error' | 'idle' | 'loading' | 'ready';
  refreshLearningActivity: () => Promise<void>;
  refreshLiveLessonActivity: () => Promise<void>;
  adminStatuses: StudentAdminStatus[];
  dashboardQuizResults: AdminQuizResultRow[];
  dashboardStudyGoals: AdminStudyGoalRow[];
  dashboardStudySessions: AdminStudySessionRow[];
  dashboardSubmissions: Submission[];
  formatDate: (dateString?: string | null) => string;
  isSubmitting: ReturnType<typeof useAdminModalState>['isSubmitting'];
  isGoogleDriveBusy: boolean;
  isWeekScanRunning: boolean;
  lastGradeUpdate: string | null;
  lastWeekScanResult: WorksheetCandidateWeekScanResult | null;
  handleAddQuizQuestion: (quiz: Quiz) => Promise<void>;
  handleApproveWorksheetCandidate: (
    candidate: WorksheetCandidate,
  ) => Promise<void>;
  handleConnectGoogleDrive: () => Promise<void>;
  handleCreateWeeklyPlan: (student: AdminUser) => Promise<void>;
  handleDiscoverWorksheetCandidates: (
    item: AnnualPlanItem,
  ) => Promise<WorksheetCandidateDiscoveryResult>;
  deleteItem: ReturnType<typeof useAdminListActions>['deleteItem'];
  handleDisconnectGoogleDrive: () => Promise<void>;
  handleDownloadStudentsPdf: ReturnType<
    typeof useAdminListActions
  >['handleDownloadStudentsPdf'];
  openEditAnnouncement: ReturnType<
    typeof useAdminModalState
  >['openEditAnnouncement'];
  editAssignment: ReturnType<typeof useAdminListActions>['editAssignment'];
  openEditDocument: ReturnType<typeof useAdminModalState>['openEditDocument'];
  handleEditQuiz: (quiz: Quiz) => void;
  editSharedDocument: ReturnType<
    typeof useAdminListActions
  >['editSharedDocument'];
  openEditUser: ReturnType<typeof useAdminModalState>['openEditUser'];
  handleImportAnnualPlan: (file: File) => Promise<AnnualPlanImportResult>;
  handleMigrateWorksheetDocuments: ReturnType<
    typeof useAdminListActions
  >['handleMigrateWorksheetDocuments'];
  handleRefreshDocumentCategories: ReturnType<
    typeof useAdminListActions
  >['handleRefreshDocumentCategories'];
  refreshWorksheetSourceStatus: (showFeedback?: boolean) => Promise<void>;
  handleScanCurrentWeekCandidates: () => Promise<void>;
  openAdminMessage: ReturnType<typeof useAdminModalState>['openAdminMessage'];
  handleOpenSubmissions: (assignment: Assignment) => Promise<void>;
  handleToggleFavoriteStudent: ReturnType<
    typeof useAdminListActions
  >['handleToggleFavoriteStudent'];
  handleUpdateStudentStatus: (
    student: AdminUser,
    status: StudentAdminStatus['status'],
    labels?: string[],
    isLabelUpdate?: boolean,
  ) => Promise<void>;
  handleUpdateGrades: ReturnType<
    typeof useAdminListActions
  >['handleUpdateGrades'];
  handleUpdateWorksheetCandidateStatus: (
    candidate: WorksheetCandidate,
    status: Extract<WorksheetCandidateStatus, 'pending' | 'rejected'>,
    rejectionReason?: string | null,
  ) => Promise<void>;
  handleOpenStudentProfile: (studentProfile: AdminUser) => Promise<void>;
  pdfStudentsLoading: boolean;
  sharedDocs: SharedDocumentAssignment[];
  weeklyPlans: StudentWeeklyPlan[];
  worksheetSourceStatus: WorksheetCandidateSourceStatus | null;
  showModal: ReturnType<typeof useAdminModalState>['showModal'];
  adminMsgImagePreview: ReturnType<
    typeof useAdminModalState
  >['adminMsgImagePreview'];
  adminMsgRecipient: ReturnType<typeof useAdminModalState>['adminMsgRecipient'];
  adminMsgText: ReturnType<typeof useAdminModalState>['adminMsgText'];
  adminMsgTitle: ReturnType<typeof useAdminModalState>['adminMsgTitle'];
  editingDoc: ReturnType<typeof useAdminModalState>['editingDoc'];
  editingUser: ReturnType<typeof useAdminModalState>['editingUser'];
  formData: ReturnType<typeof useAdminModalState>['formData'];
  modalType: ReturnType<typeof useAdminModalState>['modalType'];
  handleAdminMessageSubmit: ReturnType<
    typeof useAdminModalSubmitHandlers
  >['handleAdminMessageSubmit'];
  resetModalState: ReturnType<typeof useAdminModalState>['resetModalState'];
  handleEditDocumentSubmit: ReturnType<
    typeof useAdminModalSubmitHandlers
  >['handleEditDocumentSubmit'];
  handleEditUserSubmit: ReturnType<
    typeof useAdminModalSubmitHandlers
  >['handleEditUserSubmit'];
  handleSubmit: ReturnType<typeof useAdminModalSubmitHandlers>['handleSubmit'];
  handleSendDocSubmit: ReturnType<
    typeof useAdminModalSubmitHandlers
  >['handleSendDocSubmit'];
  selectedDoc: ReturnType<typeof useAdminModalState>['selectedDoc'];
  setAdminMsgImagePreview: ReturnType<
    typeof useAdminModalState
  >['setAdminMsgImagePreview'];
  setAdminMsgImageUrl: ReturnType<
    typeof useAdminModalState
  >['setAdminMsgImageUrl'];
  setAdminMsgText: ReturnType<typeof useAdminModalState>['setAdminMsgText'];
  setAdminMsgTitle: ReturnType<typeof useAdminModalState>['setAdminMsgTitle'];
  setFormData: ReturnType<typeof useAdminModalState>['setFormData'];
  setIsSubmitting: ReturnType<typeof useAdminModalState>['setIsSubmitting'];
  setSelectedDoc: ReturnType<typeof useAdminModalState>['setSelectedDoc'];
  success: ReturnType<typeof useAdminModalState>['success'];
  showSubmissionsModal: ReturnType<
    typeof useAdminModalState
  >['showSubmissionsModal'];
  activeAssignment: ReturnType<typeof useAdminModalState>['activeAssignment'];
  closeSubmissionsModal: ReturnType<
    typeof useAdminModalState
  >['closeSubmissionsModal'];
  updateSubmission: (
    submissionId: string,
    grade: number,
    feedback: string,
  ) => Promise<void>;
  selectedAssignmentSubmissions: Submission[];
  activeStudentProfileId: string | null;
  activeStudentProfileData: AdminStudentProfileData | null;
  activeStudentProfileError: string | null;
  activeStudentProfileLoading: boolean;
  handleAddStudentAdminNote: (student: AdminUser) => Promise<void>;
  handleCloseStudentProfile: () => void;
  activeStudentProfileUser: AppUser | null;
  isSpotlightOpen: boolean;
  isBroadcastOpen: boolean;
};
