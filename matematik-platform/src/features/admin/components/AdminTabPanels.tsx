"use client";

import { Activity, useEffect, useState, type ReactNode } from "react";
import AdminStatistics from "@/components/AdminStatistics";
import AdminAnnouncementsTab from "@/features/admin/components/tabs/AdminAnnouncementsTab";
import AdminAnnualPlanTab from "@/features/admin/components/tabs/AdminAnnualPlanTab";
import AdminAssignmentsTab from "@/features/admin/components/tabs/AdminAssignmentsTab";
import AdminClassroomTab from "@/features/admin/components/tabs/AdminClassroomTab";
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

/**
 * Tek bir admin sekmesi paneli.
 *
 * Paneller ziyaret edildikten sonra mount'ta kalir (sekme durumu korunsun diye),
 * ama AdminPage kullanici listesini 30 sn'de bir yeniliyor; bu her poll'da
 * gizli sekmelerin de yeniden render edilmesine yol aciyordu. `<Activity>` ile
 * gizli paneller dusuk oncelikte render edilir ve efektleri sokulur (gizli
 * sekmedeki zamanlayici/abonelikler durur), state ise korunur.
 *
 * `visitedTabs` kontrolu korunuyor: hic acilmamis sekme hic render edilmez.
 */
function AdminTabPanel({
  activeTab,
  children,
  tab,
  visitedTabs,
}: {
  activeTab: AdminActiveTab;
  children: ReactNode;
  tab: AdminActiveTab;
  visitedTabs: Set<AdminActiveTab>;
}) {
  const isActive = activeTab === tab;

  return (
    <div
      id={`admin-tabpanel-${tab}`}
      role="tabpanel"
      aria-labelledby={`admin-tab-${tab}`}
      className={isActive ? "block" : "hidden"}
    >
      {visitedTabs.has(tab) ? (
        <Activity mode={isActive ? "visible" : "hidden"}>{children}</Activity>
      ) : null}
    </div>
  );
}

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
  const [visitedTabs, setVisitedTabs] = useState<Set<AdminActiveTab>>(
    () => new Set<AdminActiveTab>([activeTab]),
  );

  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  return (
    <div className="w-full">
      <AdminTabPanel activeTab={activeTab} tab="statistics" visitedTabs={visitedTabs}>
        <AdminStatistics />
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="tracking" visitedTabs={visitedTabs}>
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
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="classroom" visitedTabs={visitedTabs}>
        <AdminClassroomTab
          students={studentUsers}
          assignments={assignments}
          quizResults={dashboardQuizResults}
          submissions={dashboardSubmissions}
          studySessions={dashboardStudySessions}
          onSendMessage={onSendAdminMessage}
          onViewProfile={onViewStudentProfile}
          onQuickResetPassword={onEditUser}
        />
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="announcements" visitedTabs={visitedTabs}>
        <AdminAnnouncementsTab
          announcements={announcements}
          formatDate={formatDate}
          onCreate={onCreateAnnouncement}
          onDelete={onDeleteAnnouncement}
          onEdit={onEditAnnouncement}
        />
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="documents" visitedTabs={visitedTabs}>
        <AdminDocumentsTab
          documents={documents}
          formatDate={formatDate}
          onDelete={onDeleteDocument}
          onEdit={onEditDocument}
          onMigrateWorksheets={onMigrateWorksheets}
          onRefreshCategories={onRefreshDocumentCategories}
        />
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="annualPlan" visitedTabs={visitedTabs}>
        <AdminAnnualPlanTab
          items={annualPlanItems}
          onDiscoverCandidates={onDiscoverWorksheetCandidates}
          onImport={onImportAnnualPlan}
          sourceStatus={worksheetSourceStatus}
        />
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="worksheetCandidates" visitedTabs={visitedTabs}>
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
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="users" visitedTabs={visitedTabs}>
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
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="gradeUpdate" visitedTabs={visitedTabs}>
        <AdminGradeUpdateTab
          isSubmitting={isSubmitting}
          lastGradeUpdate={lastGradeUpdate}
          onUpdateGrades={onUpdateGrades}
          users={studentUsers}
        />
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="assignments" visitedTabs={visitedTabs}>
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
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="quizzes" visitedTabs={visitedTabs}>
        <AdminQuizzesTab
          onAddQuestion={onAddQuizQuestion}
          onDeleteQuiz={onDeleteQuiz}
          onEditQuiz={onEditQuiz}
          quizzes={quizzes}
        />
      </AdminTabPanel>

      <AdminTabPanel activeTab={activeTab} tab="liveLessons" visitedTabs={visitedTabs}>
        <AdminLiveLessonsTab
          data={liveLessons}
          onRefresh={onRefreshUsers}
          students={studentUsers}
        />
      </AdminTabPanel>
    </div>
  );
}
