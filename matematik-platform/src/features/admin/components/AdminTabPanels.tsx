"use client";

import { AnimatePresence, motion } from "framer-motion";
import AdminStatistics from "@/components/AdminStatistics";
import AdminAnnouncementsTab from "@/features/admin/components/tabs/AdminAnnouncementsTab";
import AdminAssignmentsTab from "@/features/admin/components/tabs/AdminAssignmentsTab";
import AdminDocumentsTab from "@/features/admin/components/tabs/AdminDocumentsTab";
import AdminGradeUpdateTab from "@/features/admin/components/tabs/AdminGradeUpdateTab";
import AdminQuizzesTab from "@/features/admin/components/tabs/AdminQuizzesTab";
import AdminUsersTab from "@/features/admin/components/tabs/AdminUsersTab";
import type {
  AdminActiveTab,
  AdminAnnouncement,
  AdminAssignment,
  AdminDocument,
  AdminFormState,
  AdminQuiz,
  AdminSharedDocument,
  AdminUser,
} from "@/features/admin/types";

type AdminTabPanelsProps = {
  activeTab: AdminActiveTab;
  announcements: AdminAnnouncement[];
  assignments: AdminAssignment[];
  documents: AdminDocument[];
  formatDate: (dateString?: string | null) => string;
  isSubmitting: boolean;
  lastGradeUpdate: string | null;
  onAddQuizQuestion: (quiz: AdminQuiz) => Promise<void> | void;
  onCreateAnnouncement: () => void;
  onCreateAssignment: () => void;
  onCreateSendDocument: () => void;
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
  onUpdateGrades: () => Promise<void> | void;
  onViewStudentProfile: (user: AdminUser) => Promise<void> | void;
  pdfStudentsLoading: boolean;
  quizzes: AdminQuiz[];
  sharedDocs: AdminSharedDocument[];
  studentUsers: AdminUser[];
};

export default function AdminTabPanels({
  activeTab,
  announcements,
  assignments,
  documents,
  formatDate,
  isSubmitting,
  lastGradeUpdate,
  onAddQuizQuestion,
  onCreateAnnouncement,
  onCreateAssignment,
  onCreateSendDocument,
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
  onUpdateGrades,
  onViewStudentProfile,
  pdfStudentsLoading,
  quizzes,
  sharedDocs,
  studentUsers,
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
    </AnimatePresence>
  );
}
