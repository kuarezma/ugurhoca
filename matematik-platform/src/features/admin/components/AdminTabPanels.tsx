"use client";

import { AnimatePresence, motion } from "framer-motion";
import AdminStatistics from "@/components/AdminStatistics";
import AdminAnnouncementsTab from "@/features/admin/components/tabs/AdminAnnouncementsTab";
import AdminAssignmentsTab from "@/features/admin/components/tabs/AdminAssignmentsTab";
import AdminDocumentsTab from "@/features/admin/components/tabs/AdminDocumentsTab";
import AdminGradeUpdateTab from "@/features/admin/components/tabs/AdminGradeUpdateTab";
import AdminQuizzesTab from "@/features/admin/components/tabs/AdminQuizzesTab";
import AdminLiveLessonsTab from "@/features/admin/components/tabs/AdminLiveLessonsTab";
import AdminTrackingTab from "@/features/admin/components/tabs/AdminTrackingTab";
import AdminUsersTab from "@/features/admin/components/tabs/AdminUsersTab";
import type {
  AdminActiveTab,
  AdminAnnouncement,
  AdminAssignment,
  AdminDocument,
  AdminFormState,
  AdminQuizResultRow,
  AdminQuiz,
  AdminSharedDocument,
  AdminStudyGoalRow,
  AdminStudySessionRow,
  AdminUser,
  StudentActivityEvent,
  StudentAdminStatus,
  StudentWeeklyPlan,
} from "@/features/admin/types";
import type { AdminNotification, AdminSubmission } from "@/features/admin/types";
import type { LiveLessonDashboardData } from "@/features/live-lessons/types";

type AdminTabPanelsProps = {
  activeTab: AdminActiveTab;
  activityEvents: StudentActivityEvent[];
  adminStatuses: StudentAdminStatus[];
  announcements: AdminAnnouncement[];
  assignments: AdminAssignment[];
  dashboardQuizResults: AdminQuizResultRow[];
  dashboardStudyGoals: AdminStudyGoalRow[];
  dashboardStudySessions: AdminStudySessionRow[];
  dashboardSubmissions: AdminSubmission[];
  documents: AdminDocument[];
  formatDate: (dateString?: string | null) => string;
  isSubmitting: boolean;
  lastGradeUpdate: string | null;
  liveLessons: LiveLessonDashboardData;
  notifications: AdminNotification[];
  onAddQuizQuestion: (quiz: AdminQuiz) => Promise<void> | void;
  onCreateAnnouncement: () => void;
  onCreateAssignment: () => void;
  onCreateSendDocument: () => void;
  onCreateWeeklyPlan: (user: AdminUser) => Promise<void> | void;
  onDeleteAnnouncement: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
  onDeleteSharedDocument: (id: string) => void;
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
  onMigrateWorksheets: () => Promise<void> | void;
  onRefreshDocumentCategories: () => Promise<void> | void;
  onRefreshUsers: () => Promise<void> | void;
  onSendAdminMessage: (user: AdminUser) => void;
  onShowSubmissions: (assignment: AdminAssignment) => Promise<void> | void;
  onToggleFavoriteStudent: (user: AdminUser) => Promise<void> | void;
  onUpdateStudentStatus: (
    user: AdminUser,
    status: StudentAdminStatus['status'],
    labels?: string[],
  ) => Promise<void> | void;
  onUpdateGrades: () => Promise<void> | void;
  onViewStudentProfile: (user: AdminUser) => Promise<void> | void;
  pdfStudentsLoading: boolean;
  quizzes: AdminQuiz[];
  sharedDocs: AdminSharedDocument[];
  studentUsers: AdminUser[];
  weeklyPlans: StudentWeeklyPlan[];
};

export default function AdminTabPanels({
  activeTab,
  activityEvents,
  adminStatuses,
  announcements,
  assignments,
  dashboardQuizResults,
  dashboardStudyGoals,
  dashboardStudySessions,
  dashboardSubmissions,
  documents,
  formatDate,
  isSubmitting,
  lastGradeUpdate,
  liveLessons,
  notifications,
  onAddQuizQuestion,
  onCreateAnnouncement,
  onCreateAssignment,
  onCreateSendDocument,
  onCreateWeeklyPlan,
  onDeleteAnnouncement,
  onDeleteAssignment,
  onDeleteDocument,
  onDeleteQuiz,
  onDeleteSharedDocument,
  onDownloadStudentsPdf,
  onEditAnnouncement,
  onEditAssignment,
  onEditDocument,
  onEditQuiz,
  onEditSharedDocument,
  onEditUser,
  onMigrateWorksheets,
  onRefreshDocumentCategories,
  onRefreshUsers,
  onSendAdminMessage,
  onShowSubmissions,
  onToggleFavoriteStudent,
  onUpdateStudentStatus,
  onUpdateGrades,
  onViewStudentProfile,
  pdfStudentsLoading,
  quizzes,
  sharedDocs,
  studentUsers,
  weeklyPlans,
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
        <AdminLiveLessonsTab data={liveLessons} onRefresh={onRefreshUsers} />
      )}
    </AnimatePresence>
  );
}
