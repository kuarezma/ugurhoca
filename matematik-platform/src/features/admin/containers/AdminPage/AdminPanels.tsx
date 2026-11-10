import type { ContentDocument, SharedDocumentAssignment } from '@/types';
import type { AnnualPlanImportResult } from '@/features/admin/types';

import { useAdminListActions } from '@/features/admin/hooks/useAdminListActions';
import { useAdminModalState } from '@/features/admin/hooks/useAdminModalState';

import type {
  AdminActiveTab,
  AdminAnnouncement as Announcement,
  AdminAssignment as Assignment,
  AdminNotification as Notification,
  AdminQuizResultRow,
  AdminQuiz as Quiz,
  AdminStudyGoalRow,
  AdminStudySessionRow,
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

import { AdminTabPanels } from './lazy';

type AdminPanelsProps = {
  activeTab: AdminActiveTab;
  dashboardVersion: number;
  activityEvents: StudentActivityEvent[];
  learningActivityStatus: 'error' | 'idle' | 'loading' | 'ready';
  liveLessonActivityStatus: 'error' | 'idle' | 'loading' | 'ready';
  refreshLearningActivity: () => Promise<void>;
  refreshLiveLessonActivity: () => Promise<void>;
  adminStatuses: StudentAdminStatus[];
  announcements: Announcement[];
  annualPlanItems: AnnualPlanItem[];
  assignments: Assignment[];
  dashboardQuizResults: AdminQuizResultRow[];
  dashboardStudyGoals: AdminStudyGoalRow[];
  dashboardStudySessions: AdminStudySessionRow[];
  dashboardSubmissions: Submission[];
  documents: ContentDocument[];
  formatDate: (dateString?: string | null) => string;
  googleDriveConnection: GoogleDriveConnectionStatus | null;
  isSubmitting: ReturnType<typeof useAdminModalState>['isSubmitting'];
  isGoogleDriveBusy: boolean;
  isWeekScanRunning: boolean;
  lastGradeUpdate: string | null;
  lastWeekScanResult: WorksheetCandidateWeekScanResult | null;
  liveLessons: LiveLessonDashboardData;
  notifications: Notification[];
  handleAddQuizQuestion: (quiz: Quiz) => Promise<void>;
  handleApproveWorksheetCandidate: (
    candidate: WorksheetCandidate,
  ) => Promise<void>;
  handleConnectGoogleDrive: () => Promise<void>;
  openModal: ReturnType<typeof useAdminModalState>['openModal'];
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
  loadData: (adminUserId?: string | null) => Promise<void>;
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
  quizzes: Quiz[];
  sharedDocs: SharedDocumentAssignment[];
  studentUsers: ReturnType<typeof useAdminListActions>['studentUsers'];
  weeklyPlans: StudentWeeklyPlan[];
  worksheetSourceStatus: WorksheetCandidateSourceStatus | null;
  worksheetCandidates: WorksheetCandidate[];
};

export function AdminPanels({
  activeTab,
  dashboardVersion,
  activityEvents,
  learningActivityStatus,
  liveLessonActivityStatus,
  refreshLearningActivity,
  refreshLiveLessonActivity,
  adminStatuses,
  announcements,
  annualPlanItems,
  assignments,
  dashboardQuizResults,
  dashboardStudyGoals,
  dashboardStudySessions,
  dashboardSubmissions,
  documents,
  formatDate,
  googleDriveConnection,
  isSubmitting,
  isGoogleDriveBusy,
  isWeekScanRunning,
  lastGradeUpdate,
  lastWeekScanResult,
  liveLessons,
  notifications,
  handleAddQuizQuestion,
  handleApproveWorksheetCandidate,
  handleConnectGoogleDrive,
  openModal,
  handleCreateWeeklyPlan,
  handleDiscoverWorksheetCandidates,
  deleteItem,
  handleDisconnectGoogleDrive,
  handleDownloadStudentsPdf,
  openEditAnnouncement,
  editAssignment,
  openEditDocument,
  handleEditQuiz,
  editSharedDocument,
  openEditUser,
  handleImportAnnualPlan,
  handleMigrateWorksheetDocuments,
  handleRefreshDocumentCategories,
  refreshWorksheetSourceStatus,
  loadData,
  handleScanCurrentWeekCandidates,
  openAdminMessage,
  handleOpenSubmissions,
  handleToggleFavoriteStudent,
  handleUpdateStudentStatus,
  handleUpdateGrades,
  handleUpdateWorksheetCandidateStatus,
  handleOpenStudentProfile,
  pdfStudentsLoading,
  quizzes,
  sharedDocs,
  studentUsers,
  weeklyPlans,
  worksheetSourceStatus,
  worksheetCandidates,
}: AdminPanelsProps) {
  return (
    <AdminTabPanels
      activeTab={activeTab}
      dashboardVersion={dashboardVersion}
      activityEvents={activityEvents}
      learningActivityStatus={learningActivityStatus}
      liveLessonActivityStatus={liveLessonActivityStatus}
      onRetryLearningActivity={refreshLearningActivity}
      onRetryLiveLessonActivity={refreshLiveLessonActivity}
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
      onUpdateStudentStatus={(student, status, labels) =>
        handleUpdateStudentStatus(student, status, labels, labels !== undefined)
      }
      onUpdateGrades={handleUpdateGrades}
      onUpdateWorksheetCandidateStatus={handleUpdateWorksheetCandidateStatus}
      onViewStudentProfile={handleOpenStudentProfile}
      pdfStudentsLoading={pdfStudentsLoading}
      quizzes={quizzes}
      sharedDocs={sharedDocs}
      studentUsers={studentUsers}
      weeklyPlans={weeklyPlans}
      worksheetSourceStatus={worksheetSourceStatus}
      worksheetCandidates={worksheetCandidates}
    />
  );
}
