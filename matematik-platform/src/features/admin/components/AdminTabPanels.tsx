'use client';

import dynamic from 'next/dynamic';
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
} from '@/features/admin/types';

function AdminPanelLoading() {
  return (
    <div className="glass rounded-3xl p-8 text-center animate-fade-in">
      <div className="mx-auto h-10 w-10 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
      <p className="mt-4 text-sm text-slate-400">Sekme yükleniyor...</p>
    </div>
  );
}

const AdminStatistics = dynamic(() => import('@/components/AdminStatistics'), {
  loading: () => <AdminPanelLoading />,
});

const AdminAnnouncementsTab = dynamic(
  () => import('@/features/admin/components/tabs/AdminAnnouncementsTab'),
  { loading: () => <AdminPanelLoading /> },
);

const AdminAssignmentsTab = dynamic(
  () => import('@/features/admin/components/tabs/AdminAssignmentsTab'),
  { loading: () => <AdminPanelLoading /> },
);

const AdminDocumentsTab = dynamic(
  () => import('@/features/admin/components/tabs/AdminDocumentsTab'),
  { loading: () => <AdminPanelLoading /> },
);

const AdminGradeUpdateTab = dynamic(
  () => import('@/features/admin/components/tabs/AdminGradeUpdateTab'),
  { loading: () => <AdminPanelLoading /> },
);

const AdminMessagesTab = dynamic(
  () => import('@/features/admin/components/tabs/AdminMessagesTab'),
  { loading: () => <AdminPanelLoading /> },
);

const AdminPrivateStudentsTab = dynamic(
  () => import('@/features/admin/components/tabs/AdminPrivateStudentsTab'),
  { loading: () => <AdminPanelLoading /> },
);

const AdminQuizzesTab = dynamic(
  () => import('@/features/admin/components/tabs/AdminQuizzesTab'),
  { loading: () => <AdminPanelLoading /> },
);

const AdminUsersTab = dynamic(
  () => import('@/features/admin/components/tabs/AdminUsersTab'),
  { loading: () => <AdminPanelLoading /> },
);

const AdminWritingsTab = dynamic(
  () => import('@/features/admin/components/tabs/AdminWritingsTab'),
  { loading: () => <AdminPanelLoading /> },
);

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
  onEditSharedDocument: (document: AdminSharedDocument) => Promise<void> | void;
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
  if (activeTab === 'statistics') {
    return <AdminStatistics />;
  }

  if (activeTab === 'announcements') {
    return (
      <AdminAnnouncementsTab
        announcements={announcements}
        formatDate={formatDate}
        onCreate={onCreateAnnouncement}
        onDelete={onDeleteAnnouncement}
        onEdit={onEditAnnouncement}
      />
    );
  }

  if (activeTab === 'documents') {
    return (
      <AdminDocumentsTab
        documents={documents}
        formatDate={formatDate}
        onDelete={onDeleteDocument}
        onEdit={onEditDocument}
        onRefreshCategories={onRefreshDocumentCategories}
      />
    );
  }

  if (activeTab === 'writings') {
    return (
      <AdminWritingsTab
        formatDate={formatDate}
        onDelete={onDeleteWriting}
        writings={writings}
      />
    );
  }

  if (activeTab === 'users') {
    return (
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
    );
  }

  if (activeTab === 'privateStudents') {
    return (
      <AdminPrivateStudentsTab
        assignments={assignments}
        onCreateAssignment={onCreateAssignmentForStudent}
        onCreateStudent={onCreatePrivateStudent}
        onDeleteAssignment={onDeleteAssignment}
        students={privateStudents}
      />
    );
  }

  if (activeTab === 'messages') {
    return (
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
    );
  }

  if (activeTab === 'gradeUpdate') {
    return (
      <AdminGradeUpdateTab
        isSubmitting={isSubmitting}
        lastGradeUpdate={lastGradeUpdate}
        onUpdateGrades={onUpdateGrades}
        users={studentUsers}
      />
    );
  }

  if (activeTab === 'assignments') {
    return (
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
    );
  }

  return (
    <AdminQuizzesTab
      onAddQuestion={onAddQuizQuestion}
      onDeleteQuiz={onDeleteQuiz}
      onEditQuiz={onEditQuiz}
      quizzes={quizzes}
    />
  );
}
