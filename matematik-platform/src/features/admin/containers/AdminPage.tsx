'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Calculator,
  LogOut,
  ArrowLeft,
  Plus,
  FileText,
  Megaphone,
  Edit3,
  Upload,
  CheckCircle2,
  Users,
  BookOpen,
  RefreshCw,
  Bell,
  ClipboardList,
  MessageSquareText,
  BarChart3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOutClient } from '@/lib/auth-client';
import DeferredFloatingShapes from '@/components/DeferredFloatingShapes';
import { useAdminListActions } from '@/features/admin/hooks/useAdminListActions';
import { useAdminModalState } from '@/features/admin/hooks/useAdminModalState';
import { useAdminModalSubmitHandlers } from '@/features/admin/hooks/useAdminModalSubmitHandlers';
import { useAdminNotifications } from '@/features/admin/hooks/useAdminNotifications';
import {
  loadAdminAssignmentSubmissions,
  loadAdminChatMessages,
  loadAdminDashboardData,
  loadAdminQuizQuestions,
  loadAdminStudentProfile,
  refreshAdminUsers as refreshAdminUsersQuery,
  resolveAdminAuth,
  sendAdminChatMessage,
  updateAdminSubmissionReview,
} from '@/features/admin/queries';
import type {
  AdminActiveTab,
  AdminAnnouncement as Announcement,
  AdminAssignment as Assignment,
  AdminChatMessage as ChatMessage,
  AdminDashboardData,
  AdminChatRoom as ChatRoom,
  AdminDocument as Document,
  AdminFormState,
  AdminNotification as Notification,
  AdminQuiz as Quiz,
  AdminQuizQuestion as QuizQuestion,
  AdminSharedDocument as SharedDoc,
  AdminStudentProfileData,
  AdminSubmission as Submission,
  AdminUser,
} from '@/features/admin/types';

const ChatBubbleLoader = dynamic(
  () =>
    import('@/components/ChatBubbleLoader').then(
      (module) => module.ChatBubbleLoader,
    ),
  { loading: () => null },
);

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

const AdminSubmissionsModal = dynamic(
  () => import('@/features/admin/components/AdminSubmissionsModal'),
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

export default function AdminPage() {
  const RETENTION_DAYS = 180;
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<AdminActiveTab>('statistics');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [privateStudents, setPrivateStudents] = useState<AdminUser[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sharedDocs, setSharedDocs] = useState<SharedDoc[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedAssignmentSubmissions, setSelectedAssignmentSubmissions] =
    useState<Submission[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeStudentProfileId, setActiveStudentProfileId] = useState<string | null>(null);
  const [activeStudentProfileData, setActiveStudentProfileData] =
    useState<AdminStudentProfileData | null>(null);
  const [activeStudentProfileError, setActiveStudentProfileError] =
    useState<string | null>(null);
  const [activeStudentProfileLoading, setActiveStudentProfileLoading] =
    useState(false);
  const [pdfStudentsLoading, setPdfStudentsLoading] = useState(false);
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
    selectedStudent,
    setAdminMsgImagePreview,
    setAdminMsgImageUrl,
    setAdminMsgText,
    setAdminMsgTitle,
    setFormData,
    setIsSubmitting,
    setSelectedDoc,
    setSelectedQuiz,
    setSelectedStudent,
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
      alert('Değerlendirme kaydedildi.');
    }
  };

  const applyDashboardData = useCallback((data: AdminDashboardData) => {
    setAnnouncements(data.announcements);
    setDocuments(data.documents);
    setAllUsers(data.allUsers);
    setPrivateStudents(data.privateStudents);
    setAssignments(data.assignments);
    setSharedDocs(data.sharedDocs);
    setQuizzes(data.quizzes);
    setChatRooms(data.chatRooms);
    setNotifications(data.notifications);
  }, []);

  const loadData = useCallback(
    async (adminUserId?: string | null) => {
      applyDashboardData(
        await loadAdminDashboardData(RETENTION_DAYS, adminUserId ?? user?.id),
      );
    },
    [RETENTION_DAYS, applyDashboardData, user?.id],
  );

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
    handleDeleteChatRoom,
    handleDownloadStudentsPdf,
    handleMigrateWorksheetDocuments,
    handleRefreshDocumentCategories,
    handleUpdateGrades,
    studentUsers,
    togglePrivateStudent,
    writingDocuments,
  } = useAdminListActions({
    allUsers,
    announcements,
    assignments,
    documents,
    loadData,
    quizzes,
    setActiveChatRoom,
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
    handleStudentSubmit,
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
    selectedStudent,
    setAnnouncements,
    setAssignments,
    setDocuments,
    setIsSubmitting,
    setPrivateStudents,
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
    };
    void checkAuth();
  }, [loadData, router]);

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

  const handleLogout = async () => {
    await signOutClient();
    router.push('/');
  };

  const loadChatMessages = async (roomId: string) => {
    setChatMessages(await loadAdminChatMessages(roomId));
  };

  const sendChatMessage = async (roomId: string, text: string) => {
    if (!text.trim()) return;
    const { error } = await sendAdminChatMessage(roomId, text);
    if (!error) {
      setReplyText('');
      loadChatMessages(roomId);
    }
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

  const handleSelectChatRoom = async (room: ChatRoom) => {
    setActiveChatRoom(room);
    await loadChatMessages(room.id);
  };

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

  const handleCloseStudentProfile = () => {
    setActiveStudentProfileId(null);
    setActiveStudentProfileData(null);
    setActiveStudentProfileError(null);
    setActiveStudentProfileLoading(false);
  };

  const handleOpenSubmissions = async (assignment: Assignment) => {
    await loadSubmissions(assignment.id);
    openSubmissionsModal(assignment);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    openEditQuiz(quiz, getQuizFormState(quiz));
  };

  if (!user) return null;

  return (
    <main className="admin-page min-h-screen gradient-bg pb-20">
      <DeferredFloatingShapes />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-white/10 py-3 px-4 sm:py-4 sm:px-6 shadow-lg shadow-black/20">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-sm sm:text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent leading-tight">
              Uğur Hoca Matematik
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative p-2 text-slate-300 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            <span className="hidden md:block px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm font-semibold">
              Admin Paneli
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
            >
              <LogOut className="w-4 h-4" />
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

      <div className="pt-20 sm:pt-24 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="mb-6 sm:mb-8 animate-fade-up">
            <Link
              href="/profil"
              className="text-slate-400 hover:text-white inline-flex items-center gap-2 mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-5 h-5" />
              Profil'e Dön
            </Link>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
              Admin Paneli
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Hoş geldiniz, Uğur Hoca!
            </p>
          </div>

          <div className="sticky top-16 z-40 -mx-4 sm:mx-0 mb-6 sm:mb-8 px-4 sm:px-0 py-3 sm:py-0">
            <div className="flex flex-nowrap gap-1.5 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                {
                  id: 'statistics',
                  label: 'İstatistikler',
                  shortLabel: 'İstat.',
                  icon: BarChart3,
                  color: 'from-emerald-500 to-teal-500',
                },
                {
                  id: 'announcements',
                  label: 'Duyurular',
                  shortLabel: 'Duy.',
                  icon: Megaphone,
                  color: 'from-pink-500 to-rose-500',
                },
                {
                  id: 'documents',
                  label: 'Belgeler',
                  shortLabel: 'Bel.',
                  icon: FileText,
                  color: 'from-blue-500 to-cyan-500',
                },
                {
                  id: 'writings',
                  label: 'Yazılar',
                  shortLabel: 'Yazı',
                  icon: Edit3,
                  color: 'from-purple-500 to-violet-500',
                },
                {
                  id: 'users',
                  label: 'Kullanıcılar',
                  shortLabel: 'Kull.',
                  icon: Users,
                  color: 'from-green-500 to-emerald-500',
                },
                {
                  id: 'privateStudents',
                  label: 'Öğrencilerim',
                  shortLabel: 'Öğr.',
                  icon: BookOpen,
                  color: 'from-amber-500 to-orange-500',
                },
                {
                  id: 'messages',
                  label: 'Mesajlar',
                  shortLabel: 'Msj.',
                  icon: MessageSquareText,
                  color: 'from-indigo-500 to-purple-500',
                },
                {
                  id: 'gradeUpdate',
                  label: 'Sınıf Güncelle',
                  shortLabel: 'Sınıf',
                  icon: RefreshCw,
                  color: 'from-teal-500 to-cyan-500',
                },
                {
                  id: 'assignments',
                  label: 'Ödevlendirme',
                  shortLabel: 'Ödev',
                  icon: ClipboardList,
                  color: 'from-rose-500 to-pink-500',
                },
                {
                  id: 'quizzes',
                  label: 'Testler',
                  shortLabel: 'Test',
                  icon: CheckCircle2,
                  color: 'from-violet-500 to-purple-500',
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminActiveTab)}
                  className={`relative overflow-hidden px-3 py-2.5 sm:px-5 sm:py-3.5 rounded-xl flex items-center gap-1.5 sm:gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 border shadow-md ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white border-white/20 shadow-${tab.color.includes('pink') ? 'pink' : tab.color.includes('blue') ? 'cyan' : tab.color.includes('green') ? 'emerald' : 'violet'}-500/30`
                      : `bg-slate-900/80 border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-slate-800/80`
                  }`}
                >
                  {activeTab === tab.id && (
                    <span className="absolute inset-0 bg-white/10 pointer-events-none" />
                  )}
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="relative font-semibold text-[11px] sm:text-sm">
                    {activeTab === tab.id ? tab.label : tab.shortLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {activeTab !== 'statistics' &&
            activeTab !== 'users' &&
            activeTab !== 'gradeUpdate' &&
            activeTab !== 'assignments' &&
            activeTab !== 'quizzes' && (
              <div className="flex justify-stretch sm:justify-end mb-6">
                <button
                  onClick={() =>
                    openModal(
                      activeTab === 'announcements'
                        ? 'announcement'
                        : activeTab === 'documents'
                          ? 'document'
                          : 'writing',
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
            <div className="flex justify-stretch sm:justify-end mb-6 gap-3">
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
            activeChatRoom={activeChatRoom}
            activeTab={activeTab}
            announcements={announcements}
            assignments={assignments}
            chatMessages={chatMessages}
            chatRooms={chatRooms}
            documents={documents}
            formatDate={formatDate}
            isSubmitting={isSubmitting}
            lastGradeUpdate={lastGradeUpdate}
            onAddQuizQuestion={handleAddQuizQuestion}
            onCreateAnnouncement={() => openModal('announcement')}
            onCreateAssignment={() => openModal('assignment')}
            onCreateAssignmentForStudent={(studentId) =>
              openModal('assignment', studentId)
            }
            onCreatePrivateStudent={() => openModal('student')}
            onCreateQuiz={() => openModal('quiz')}
            onCreateSendDocument={() => openModal('sendDoc')}
            onDeleteAnnouncement={(id) => deleteItem('announcement', id)}
            onDeleteAssignment={(id) => deleteItem('assignment', id)}
            onDeleteChatRoom={handleDeleteChatRoom}
            onDeleteDocument={(id) => deleteItem('document', id)}
            onDeleteQuiz={(id) => deleteItem('quiz', id)}
            onDeleteSharedDocument={(id) => deleteItem('shared_document', id)}
            onDeleteWriting={(id) => deleteItem('writing', id)}
            onDownloadStudentsPdf={handleDownloadStudentsPdf}
            onEditAnnouncement={openEditAnnouncement}
            onEditAssignment={editAssignment}
            onEditDocument={openEditDocument}
            onEditQuiz={handleEditQuiz}
          onEditSharedDocument={editSharedDocument}
          onEditUser={openEditUser}
          onMigrateWorksheets={handleMigrateWorksheetDocuments}
          onRefreshDocumentCategories={handleRefreshDocumentCategories}
            onRefreshUsers={loadData}
            onReplyTextChange={setReplyText}
            onSelectChatRoom={handleSelectChatRoom}
            onSendAdminMessage={openAdminMessage}
            onSendChatMessage={sendChatMessage}
            onShowImportQuestions={() => openModal('importQuestions')}
            onShowSubmissions={handleOpenSubmissions}
            onTogglePrivateStudent={togglePrivateStudent}
            onUpdateGrades={handleUpdateGrades}
            onViewStudentProfile={handleOpenStudentProfile}
            pdfStudentsLoading={pdfStudentsLoading}
            privateStudents={privateStudents}
            quizzes={quizzes}
            replyText={replyText}
            sharedDocs={sharedDocs}
            studentUsers={studentUsers}
            writings={writingDocuments}
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
          onStudentSubmit={handleStudentSubmit}
          privateStudents={privateStudents}
          selectedDoc={selectedDoc}
          selectedStudent={selectedStudent}
          setAdminMsgImagePreview={setAdminMsgImagePreview}
          setAdminMsgImageUrl={setAdminMsgImageUrl}
          setAdminMsgText={setAdminMsgText}
          setAdminMsgTitle={setAdminMsgTitle}
          setFormData={setFormData}
          setIsSubmitting={setIsSubmitting}
          setSelectedDoc={setSelectedDoc}
          setSelectedStudent={setSelectedStudent}
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
      <ChatBubbleLoader />
    </main>
  );
}
