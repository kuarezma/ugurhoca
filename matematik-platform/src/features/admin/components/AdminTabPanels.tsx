"use client";

import { AnimatePresence, motion } from "framer-motion";
import AdminStatistics from "@/components/AdminStatistics";
import AdminAnnouncementsTab from "@/features/admin/components/tabs/AdminAnnouncementsTab";
import AdminAssignmentsTab from "@/features/admin/components/tabs/AdminAssignmentsTab";
import AdminDocumentsTab from "@/features/admin/components/tabs/AdminDocumentsTab";
import AdminGradeUpdateTab from "@/features/admin/components/tabs/AdminGradeUpdateTab";
import AdminMessagesTab from "@/features/admin/components/tabs/AdminMessagesTab";
import AdminPrivateStudentsTab from "@/features/admin/components/tabs/AdminPrivateStudentsTab";
import AdminQuizzesTab from "@/features/admin/components/tabs/AdminQuizzesTab";
import AdminUsersTab from "@/features/admin/components/tabs/AdminUsersTab";
import AdminWritingsTab from "@/features/admin/components/tabs/AdminWritingsTab";
import type {
  AdminActiveTab,
  AdminAnnouncement,
  AdminAssignment,
  AdminChatMessage,
  AdminChatRoom,
  AdminDocument,
  AdminFormState,
  AdminQuiz,
  AdminSharedDocument,
  AdminUser,
} from "@/features/admin/types";

type AdminTabPanelsProps = {
  activeChatRoom: AdminChatRoom | null;
  activeTab: AdminActiveTab;
  announcements: AdminAnnouncement[];
  assignments: AdminAssignment[];
  chatMessages: AdminChatMessage[];
  chatRooms: AdminChatRoom[];
  documents: AdminDocument[];
  formatDate: (dateString?: string | null) => string;
  isSubmitting: boolean;
  lastGradeUpdate: string | null;
  onAddQuizQuestion: (quiz: AdminQuiz) => Promise<void> | void;
  onCreateAnnouncement: () => void;
  onCreateAssignment: () => void;
  onCreateAssignmentForStudent: (studentId: string) => void;
  onCreatePrivateStudent: () => void;
  onCreateQuiz: () => void;
  onCreateSendDocument: () => void;
  onDeleteAnnouncement: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  onDeleteChatRoom: (room: AdminChatRoom) => Promise<void> | void;
  onDeleteDocument: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
  onDeleteSharedDocument: (id: string) => void;
  onDeleteWriting: (id: string) => void;
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
  onRefreshDocumentCategories: () => Promise<void> | void;
  onRefreshUsers: () => Promise<void> | void;
  onReplyTextChange: (value: string) => void;
  onSelectChatRoom: (room: AdminChatRoom) => Promise<void> | void;
  onSendAdminMessage: (user: AdminUser) => void;
  onSendChatMessage: (roomId: string, text: string) => Promise<void> | void;
  onShowImportQuestions: () => void;
  onShowSubmissions: (assignment: AdminAssignment) => Promise<void> | void;
  onTogglePrivateStudent: (
    userId: string,
    isCurrentlyPrivate: boolean,
  ) => Promise<void> | void;
  onUpdateGrades: () => Promise<void> | void;
  pdfStudentsLoading: boolean;
  privateStudents: AdminUser[];
  quizzes: AdminQuiz[];
  replyText: string;
  sharedDocs: AdminSharedDocument[];
  studentUsers: AdminUser[];
  writings: AdminDocument[];
};

export default function AdminTabPanels({
  activeChatRoom,
  activeTab,
  announcements,
  assignments,
  chatMessages,
  chatRooms,
  documents,
  formatDate,
  isSubmitting,
  lastGradeUpdate,
  onAddQuizQuestion,
  onCreateAnnouncement,
  onCreateAssignment,
  onCreateAssignmentForStudent,
  onCreatePrivateStudent,
  onCreateSendDocument,
  onDeleteAnnouncement,
  onDeleteAssignment,
  onDeleteChatRoom,
  onDeleteDocument,
  onDeleteQuiz,
  onDeleteSharedDocument,
  onDeleteWriting,
  onDownloadStudentsPdf,
  onEditAnnouncement,
  onEditAssignment,
  onEditDocument,
  onEditQuiz,
  onEditSharedDocument,
  onEditUser,
  onRefreshDocumentCategories,
  onRefreshUsers,
  onReplyTextChange,
  onSelectChatRoom,
  onSendAdminMessage,
  onSendChatMessage,
  onShowSubmissions,
  onTogglePrivateStudent,
  onUpdateGrades,
  pdfStudentsLoading,
  privateStudents,
  quizzes,
  replyText,
  sharedDocs,
  studentUsers,
  writings,
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
          onRefreshCategories={onRefreshDocumentCategories}
        />
      )}

      {activeTab === "writings" && (
        <AdminWritingsTab
          formatDate={formatDate}
          onDelete={onDeleteWriting}
          writings={writings}
        />
      )}

      {activeTab === "users" && (
        <AdminUsersTab
          formatDate={formatDate}
          onDownloadPdf={onDownloadStudentsPdf}
          onEditUser={onEditUser}
          onRefresh={onRefreshUsers}
          onSendMessage={onSendAdminMessage}
          onTogglePrivateStudent={onTogglePrivateStudent}
          pdfStudentsLoading={pdfStudentsLoading}
          students={studentUsers}
        />
      )}

      {activeTab === "privateStudents" && (
        <AdminPrivateStudentsTab
          assignments={assignments}
          onCreateAssignment={onCreateAssignmentForStudent}
          onCreateStudent={onCreatePrivateStudent}
          onDeleteAssignment={onDeleteAssignment}
          students={privateStudents}
        />
      )}

      {activeTab === "messages" && (
        <AdminMessagesTab
          activeChatRoom={activeChatRoom}
          chatMessages={chatMessages}
          chatRooms={chatRooms}
          onDeleteRoom={onDeleteChatRoom}
          onReplyTextChange={onReplyTextChange}
          onSelectRoom={onSelectChatRoom}
          onSendMessage={onSendChatMessage}
          replyText={replyText}
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
