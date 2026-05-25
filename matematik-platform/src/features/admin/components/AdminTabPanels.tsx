"use client";

import { AnimatePresence, motion } from "framer-motion";
import AdminStatistics from "@/components/AdminStatistics";
import AdminAnnouncementsTab from "@/features/admin/components/tabs/AdminAnnouncementsTab";
import AdminAnnualPlanTab from "@/features/admin/components/tabs/AdminAnnualPlanTab";
import AdminAssignmentsTab from "@/features/admin/components/tabs/AdminAssignmentsTab";
import AdminDocumentsTab from "@/features/admin/components/tabs/AdminDocumentsTab";
import AdminGradeUpdateTab from "@/features/admin/components/tabs/AdminGradeUpdateTab";
import AdminQuizzesTab from "@/features/admin/components/tabs/AdminQuizzesTab";
import AdminLiveLessonsTab from "@/features/admin/components/tabs/AdminLiveLessonsTab";
import AdminTrackingTab from "@/features/admin/components/tabs/AdminTrackingTab";
import AdminUsersTab from "@/features/admin/components/tabs/AdminUsersTab";
import AdminWorksheetCandidatesTab from "@/features/admin/components/tabs/AdminWorksheetCandidatesTab";
import type {
  AdminActiveTab,
  AdminAnnouncement,
  AdminAssignment,
  AnnualPlanImportResult,
  AnnualPlanItem,
  AdminDocument,
  AdminFormState,
  GoogleDriveConnectionStatus,
  AdminQuizResultRow,
  AdminQuiz,
  AdminSharedDocument,
  AdminStudyGoalRow,
  AdminStudySessionRow,
  AdminUser,
  StudentActivityEvent,
  StudentAdminStatus,
  StudentWeeklyPlan,
  WorksheetCandidate,
  WorksheetCandidateDiscoveryResult,
  WorksheetCandidateSourceStatus,
  WorksheetCandidateStatus,
  WorksheetCandidateWeekScanResult,
} from "@/features/admin/types";
import type { AdminNotification, AdminSubmission } from "@/features/admin/types";
import type { LiveLessonDashboardData } from "@/features/live-lessons/types";

type AdminTabPanelsProps = {
  activeTab: AdminActiveTab;
  activityEvents: StudentActivityEvent[];
  adminStatuses: StudentAdminStatus[];
  announcements: AdminAnnouncement[];
  annualPlanItems: AnnualPlanItem[];
  assignments: AdminAssignment[];
  dashboardQuizResults: AdminQuizResultRow[];
  dashboardStudyGoals: AdminStudyGoalRow[];
  dashboardStudySessions: AdminStudySessionRow[];
  dashboardSubmissions: AdminSubmission[];
  documents: AdminDocument[];
  formatDate: (dateString?: string | null) => string;
  googleDriveConnection: GoogleDriveConnectionStatus | null;
  isSubmitting: boolean;
  isGoogleDriveBusy: boolean;
  isWeekScanRunning: boolean;
  lastGradeUpdate: string | null;
  lastWeekScanResult: WorksheetCandidateWeekScanResult | null;
  liveLessons: LiveLessonDashboardData;
  notifications: AdminNotification[];
  onAddQuizQuestion: (quiz: AdminQuiz) => Promise<void> | void;
  onApproveWorksheetCandidate: (
    candidate: WorksheetCandidate,
  ) => Promise<void> | void;
  onConnectGoogleDrive: () => Promise<void> | void;
  onCreateAnnouncement: () => void;
  onCreateAssignment: () => void;
  onCreateSendDocument: () => void;
  onCreateWeeklyPlan: (user: AdminUser) => Promise<void> | void;
  onDiscoverWorksheetCandidates: (
    item: AnnualPlanItem,
  ) => Promise<WorksheetCandidateDiscoveryResult>;
  onDeleteAnnouncement: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
  onDeleteSharedDocument: (id: string) => void;
  onDisconnectGoogleDrive: () => Promise<void> | void;
  onDownloadStudentsPdf: () => Promise<void> | void;
  onEditAnnouncement: (
    announcement: AdminAnnouncement,
    nextFormData: AdminFormState,
  ) => void;
  onEditAssignment: (assignment: AdminAssignment) => Promise<void> | void;
  onEditDocument: (
    document: AdminDocument,
    nextFormData: AdminFormState,
  ) => void;
  onEditQuiz: (quiz: AdminQuiz) => void;
  onEditSharedDocument: (
    document: AdminSharedDocument,
  ) => Promise<void> | void;
  onEditUser: (user: AdminUser) => void;
  onImportAnnualPlan: (file: File) => Promise<AnnualPlanImportResult>;
  onMigrateWorksheets: () => Promise<void> | void;
  onRefreshDocumentCategories: () => Promise<void> | void;
  onRefreshWorksheetSourceStatus: () => Promise<void> | void;
  onRefreshUsers: () => Promise<void> | void;
  onScanCurrentWeekCandidates: () => Promise<void> | void;
  onSendAdminMessage: (user: AdminUser) => void;
  onShowSubmissions: (assignment: AdminAssignment) => Promise<void> | void;
  onToggleFavoriteStudent: (user: AdminUser) => Promise<void> | void;
  onUpdateStudentStatus: (
    user: AdminUser,
    status: StudentAdminStatus['status'],
    labels?: string[],
  ) => Promise<void> | void;
  onUpdateGrades: () => Promise<void> | void;
  onUpdateWorksheetCandidateStatus: (
    candidate: WorksheetCandidate,
    status: Extract<WorksheetCandidateStatus, "pending" | "rejected">,
    rejectionReason?: string | null,
  ) => Promise<void> | void;
  onViewStudentProfile: (user: AdminUser) => Promise<void> | void;
  pdfStudentsLoading: boolean;
  quizzes: AdminQuiz[];
  sharedDocs: AdminSharedDocument[];
  studentUsers: AdminUser[];
  weeklyPlans: StudentWeeklyPlan[];
  worksheetSourceStatus: WorksheetCandidateSourceStatus | null;
  worksheetCandidates: WorksheetCandidate[];
};

export default function AdminTabPanels({
  activeTab,
  activityEvents,
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
  onAddQuizQuestion,
  onApproveWorksheetCandidate,
  onConnectGoogleDrive,
  onCreateAnnouncement,
  onCreateAssignment,
  onCreateSendDocument,
  onCreateWeeklyPlan,
  onDiscoverWorksheetCandidates,
  onDeleteAnnouncement,
  onDeleteAssignment,
  onDeleteDocument,
  onDeleteQuiz,
  onDeleteSharedDocument,
  onDisconnectGoogleDrive,
  onDownloadStudentsPdf,
  onEditAnnouncement,
  onEditAssignment,
  onEditDocument,
  onEditQuiz,
  onEditSharedDocument,
  onEditUser,
  onImportAnnualPlan,
  onMigrateWorksheets,
  onRefreshDocumentCategories,
  onRefreshWorksheetSourceStatus,
  onRefreshUsers,
  onScanCurrentWeekCandidates,
  onSendAdminMessage,
  onShowSubmissions,
  onToggleFavoriteStudent,
  onUpdateStudentStatus,
  onUpdateGrades,
  onUpdateWorksheetCandidateStatus,
  onViewStudentProfile,
  pdfStudentsLoading,
  quizzes,
  sharedDocs,
  studentUsers,
  weeklyPlans,
  worksheetSourceStatus,
  worksheetCandidates,
}: AdminTabPanelsProps) {
  return (
    <AnimatePresence mode="wait">
      {activeTab === "statistics" && (
        <motion.div
          key="statistics"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <AdminStatistics />
        </motion.div>
      )}

      {activeTab === "tracking" && (
        <AdminTrackingTab
          activityEvents={activityEvents}
          adminStatuses={adminStatuses}
          assignments={assignments}
          documents={documents}
          notifications={notifications}
          onCreateWeeklyPlan={onCreateWeeklyPlan}
          onSendMessage={onSendAdminMessage}
          onUpdateStatus={onUpdateStudentStatus}
          onViewProfile={onViewStudentProfile}
          quizResults={dashboardQuizResults}
          studyGoals={dashboardStudyGoals}
          studySessions={dashboardStudySessions}
          students={studentUsers}
          submissions={dashboardSubmissions}
          weeklyPlans={weeklyPlans}
        />
      )}

      {activeTab === "announcements" && (
        <AdminAnnouncementsTab
          announcements={announcements}
          formatDate={formatDate}
          onCreate={onCreateAnnouncement}
          onDelete={onDeleteAnnouncement}
          onEdit={onEditAnnouncement}
        />
      )}

      {activeTab === "documents" && (
        <AdminDocumentsTab
          documents={documents}
          formatDate={formatDate}
          onDelete={onDeleteDocument}
          onEdit={onEditDocument}
          onMigrateWorksheets={onMigrateWorksheets}
          onRefreshCategories={onRefreshDocumentCategories}
        />
      )}

      {activeTab === "annualPlan" && (
        <AdminAnnualPlanTab
          items={annualPlanItems}
          onDiscoverCandidates={onDiscoverWorksheetCandidates}
          onImport={onImportAnnualPlan}
          sourceStatus={worksheetSourceStatus}
        />
      )}

      {activeTab === "worksheetCandidates" && (
        <AdminWorksheetCandidatesTab
          candidates={worksheetCandidates}
          driveConnection={googleDriveConnection}
          sourceStatus={worksheetSourceStatus}
          isDriveBusy={isGoogleDriveBusy}
          isWeekScanRunning={isWeekScanRunning}
          lastWeekScanResult={lastWeekScanResult}
          onApprove={onApproveWorksheetCandidate}
          onConnectDrive={onConnectGoogleDrive}
          onDisconnectDrive={onDisconnectGoogleDrive}
          onRefreshSourceStatus={onRefreshWorksheetSourceStatus}
          onScanCurrentWeek={onScanCurrentWeekCandidates}
          onUpdateStatus={onUpdateWorksheetCandidateStatus}
        />
      )}

      {activeTab === "users" && (
        <AdminUsersTab
          formatDate={formatDate}
          onDownloadPdf={onDownloadStudentsPdf}
          onEditUser={onEditUser}
          onRefresh={onRefreshUsers}
          onSendMessage={onSendAdminMessage}
          onToggleFavorite={onToggleFavoriteStudent}
          onViewProfile={onViewStudentProfile}
          pdfStudentsLoading={pdfStudentsLoading}
          students={studentUsers}
        />
      )}

      {activeTab === "gradeUpdate" && (
        <AdminGradeUpdateTab
          isSubmitting={isSubmitting}
          lastGradeUpdate={lastGradeUpdate}
          onUpdateGrades={onUpdateGrades}
          users={studentUsers}
        />
      )}

      {activeTab === "assignments" && (
        <AdminAssignmentsTab
          assignments={assignments}
          onDeleteAssignment={onDeleteAssignment}
          onDeleteSharedDocument={onDeleteSharedDocument}
          onEditAssignment={onEditAssignment}
          onEditSharedDocument={onEditSharedDocument}
          onOpenAssignmentModal={onCreateAssignment}
          onOpenSendDocumentModal={onCreateSendDocument}
          onOpenSubmissions={onShowSubmissions}
          sharedDocs={sharedDocs}
        />
      )}

      {activeTab === "quizzes" && (
        <AdminQuizzesTab
          onAddQuestion={onAddQuizQuestion}
          onDeleteQuiz={onDeleteQuiz}
          onEditQuiz={onEditQuiz}
          quizzes={quizzes}
        />
      )}

      {activeTab === "liveLessons" && (
        <AdminLiveLessonsTab
          data={liveLessons}
          onRefresh={onRefreshUsers}
          students={studentUsers}
        />
      )}
    </AnimatePresence>
  );
}
