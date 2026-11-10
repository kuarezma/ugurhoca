'use client';

import { useState, useCallback, useRef } from 'react';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { useAdminListActions } from '@/features/admin/hooks/useAdminListActions';
import { useAdminModalState } from '@/features/admin/hooks/useAdminModalState';
import { useAdminModalSubmitHandlers } from '@/features/admin/hooks/useAdminModalSubmitHandlers';
import { useAdminNotifications } from '@/features/admin/hooks/useAdminNotifications';
import { refreshAdminUsers as refreshAdminUsersQuery } from '@/features/admin/queries';
import type {
  AdminActiveTab,
  AdminAnnouncement as Announcement,
  AdminAssignment as Assignment,
  AdminDocument as Document,
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
  WorksheetCandidateSourceStatus,
  WorksheetCandidateWeekScanResult,
} from '@/features/admin/types';
import type { LiveLessonDashboardData } from '@/features/live-lessons/types';

import { useAdminData } from './AdminPage/useAdminData';
import { useAdminEffects } from './AdminPage/useAdminEffects';
import { useAdminNavigation } from './AdminPage/useAdminNavigation';
import { getAdminWorksheetActions } from './AdminPage/getAdminWorksheetActions';
import { getAdminTrackingActions } from './AdminPage/getAdminTrackingActions';
import { AdminView } from './AdminPage/AdminView';

export default function AdminPage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const adminUserIdRef = useRef<string | null>(null);
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
  const [learningActivityStatus, setLearningActivityStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [liveLessonActivityStatus, setLiveLessonActivityStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [dashboardLoaded, setDashboardLoaded] = useState(false);
  const [dashboardVersion, setDashboardVersion] = useState(0);
  const learningActivityLoadedRef = useRef(false);
  const liveLessonActivityLoadedRef = useRef(false);
  const learningActivityRequestRef = useRef<Promise<void> | null>(null);
  const liveLessonActivityRequestRef = useRef<Promise<void> | null>(null);
  const [activeStudentProfileId, setActiveStudentProfileId] = useState<
    string | null
  >(null);
  const [activeStudentProfileData, setActiveStudentProfileData] =
    useState<AdminStudentProfileData | null>(null);
  const [activeStudentProfileError, setActiveStudentProfileError] = useState<
    string | null
  >(null);
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
    ? allUsers.find(
        (currentUser) => currentUser.id === activeStudentProfileId,
      ) || null
    : null;

  const {
    loadStudentProfile,
    loadSubmissions,
    updateSubmission,
    refreshLearningActivity,
    refreshLiveLessonActivity,
    loadData,
    refreshGoogleDriveConnection,
    refreshWorksheetSourceStatus,
  } = useAdminData({
    setActiveStudentProfileLoading,
    setActiveStudentProfileError,
    setActiveStudentProfileData,
    setSelectedAssignmentSubmissions,
    activeAssignment,
    showToast,
    setAnnouncements,
    setAnnualPlanItems,
    setWorksheetCandidates,
    setDocuments,
    setAllUsers,
    setAssignments,
    setSharedDocs,
    setQuizzes,
    setNotifications,
    setAdminStatuses,
    setWeeklyPlans,
    setDashboardSubmissions,
    setDashboardQuizResults,
    setDashboardStudyGoals,
    setLiveLessons,
    learningActivityRequestRef,
    learningActivityLoadedRef,
    setLearningActivityStatus,
    setActivityEvents,
    setDashboardStudySessions,
    liveLessonActivityRequestRef,
    liveLessonActivityLoadedRef,
    setLiveLessonActivityStatus,
    adminUserIdRef,
    setDashboardVersion,
    setDashboardLoaded,
    setGoogleDriveConnection,
    setWorksheetSourceStatus,
  });

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

  useAdminEffects({
    router,
    adminUserIdRef,
    setUser,
    loadData,
    refreshGoogleDriveConnection,
    refreshWorksheetSourceStatus,
    user,
    dashboardLoaded,
    learningActivityStatus,
    activeTab,
    refreshLearningActivity,
    liveLessonActivityStatus,
    refreshLiveLessonActivity,
    showToast,
    refreshUsers,
    activeStudentProfileId,
    activeStudentProfileUser,
    loadStudentProfile,
    setIsSpotlightOpen,
  });

  const {
    handleLogout,
    formatDate,
    getQuizFormState,
    lastGradeUpdate,
    handleAddQuizQuestion,
    handleOpenStudentProfile,
    handleCloseStudentProfile,
    handleOpenSubmissions,
    handleImportAnnualPlan,
    handleDiscoverWorksheetCandidates,
  } = useAdminNavigation({
    router,
    setQuizQuestions,
    setSelectedQuiz,
    openModal,
    setActiveStudentProfileData,
    setActiveStudentProfileError,
    setActiveStudentProfileId,
    activeStudentProfileId,
    loadStudentProfile,
    setActiveStudentProfileLoading,
    loadSubmissions,
    openSubmissionsModal,
    loadData,
    user,
  });

  const {
    handleUpdateWorksheetCandidateStatus,
    handleApproveWorksheetCandidate,
    handleConnectGoogleDrive,
    handleDisconnectGoogleDrive,
    handleScanCurrentWeekCandidates,
  } = getAdminWorksheetActions({
    user,
    setWorksheetCandidates,
    showToast,
    loadData,
    setIsGoogleDriveBusy,
    setGoogleDriveConnection,
    setIsWeekScanRunning,
    setLastWeekScanResult,
  });

  const {
    handleCreateWeeklyPlan,
    handleUpdateStudentStatus,
    handleAddStudentAdminNote,
    handleEditQuiz,
  } = getAdminTrackingActions({
    loadData,
    user,
    activeStudentProfileId,
    loadStudentProfile,
    showToast,
    adminStatuses,
    openEditQuiz,
    getQuizFormState,
  });

  if (!user) return null;

  return (
    <AdminView
      setIsSpotlightOpen={setIsSpotlightOpen}
      setShowNotifications={setShowNotifications}
      unreadNotifications={unreadNotifications}
      handleLogout={handleLogout}
      showNotifications={showNotifications}
      formatRelativeTime={formatRelativeTime}
      getNotificationBody={getNotificationBody}
      isIncomingAdminMessage={isIncomingAdminMessage}
      notifications={notifications}
      markNotificationAsRead={markNotificationAsRead}
      selectedNotification={selectedNotification}
      getMetadataText={getMetadataText}
      setSelectedNotification={setSelectedNotification}
      deleteMessage={deleteMessage}
      applyModerationAction={applyModerationAction}
      setReplyText={setReplyText}
      sendReply={sendReply}
      selectedNotificationPayload={selectedNotificationPayload}
      replyText={replyText}
      selectedNotificationStatus={selectedNotificationStatus}
      user={user}
      studentUsers={studentUsers}
      documents={documents}
      quizzes={quizzes}
      worksheetCandidates={worksheetCandidates}
      openModal={openModal}
      setIsBroadcastOpen={setIsBroadcastOpen}
      googleDriveConnection={googleDriveConnection}
      loadData={loadData}
      refreshUsers={refreshUsers}
      refreshGoogleDriveConnection={refreshGoogleDriveConnection}
      setTabCategory={setTabCategory}
      tabCategory={tabCategory}
      assignments={assignments}
      liveLessons={liveLessons}
      annualPlanItems={annualPlanItems}
      announcements={announcements}
      setActiveTab={setActiveTab}
      activeTab={activeTab}
      dashboardVersion={dashboardVersion}
      activityEvents={activityEvents}
      learningActivityStatus={learningActivityStatus}
      liveLessonActivityStatus={liveLessonActivityStatus}
      refreshLearningActivity={refreshLearningActivity}
      refreshLiveLessonActivity={refreshLiveLessonActivity}
      adminStatuses={adminStatuses}
      dashboardQuizResults={dashboardQuizResults}
      dashboardStudyGoals={dashboardStudyGoals}
      dashboardStudySessions={dashboardStudySessions}
      dashboardSubmissions={dashboardSubmissions}
      formatDate={formatDate}
      isSubmitting={isSubmitting}
      isGoogleDriveBusy={isGoogleDriveBusy}
      isWeekScanRunning={isWeekScanRunning}
      lastGradeUpdate={lastGradeUpdate}
      lastWeekScanResult={lastWeekScanResult}
      handleAddQuizQuestion={handleAddQuizQuestion}
      handleApproveWorksheetCandidate={handleApproveWorksheetCandidate}
      handleConnectGoogleDrive={handleConnectGoogleDrive}
      handleCreateWeeklyPlan={handleCreateWeeklyPlan}
      handleDiscoverWorksheetCandidates={handleDiscoverWorksheetCandidates}
      deleteItem={deleteItem}
      handleDisconnectGoogleDrive={handleDisconnectGoogleDrive}
      handleDownloadStudentsPdf={handleDownloadStudentsPdf}
      openEditAnnouncement={openEditAnnouncement}
      editAssignment={editAssignment}
      openEditDocument={openEditDocument}
      handleEditQuiz={handleEditQuiz}
      editSharedDocument={editSharedDocument}
      openEditUser={openEditUser}
      handleImportAnnualPlan={handleImportAnnualPlan}
      handleMigrateWorksheetDocuments={handleMigrateWorksheetDocuments}
      handleRefreshDocumentCategories={handleRefreshDocumentCategories}
      refreshWorksheetSourceStatus={refreshWorksheetSourceStatus}
      handleScanCurrentWeekCandidates={handleScanCurrentWeekCandidates}
      openAdminMessage={openAdminMessage}
      handleOpenSubmissions={handleOpenSubmissions}
      handleToggleFavoriteStudent={handleToggleFavoriteStudent}
      handleUpdateStudentStatus={handleUpdateStudentStatus}
      handleUpdateGrades={handleUpdateGrades}
      handleUpdateWorksheetCandidateStatus={
        handleUpdateWorksheetCandidateStatus
      }
      handleOpenStudentProfile={handleOpenStudentProfile}
      pdfStudentsLoading={pdfStudentsLoading}
      sharedDocs={sharedDocs}
      weeklyPlans={weeklyPlans}
      worksheetSourceStatus={worksheetSourceStatus}
      showModal={showModal}
      adminMsgImagePreview={adminMsgImagePreview}
      adminMsgRecipient={adminMsgRecipient}
      adminMsgText={adminMsgText}
      adminMsgTitle={adminMsgTitle}
      editingDoc={editingDoc}
      editingUser={editingUser}
      formData={formData}
      modalType={modalType}
      handleAdminMessageSubmit={handleAdminMessageSubmit}
      resetModalState={resetModalState}
      handleEditDocumentSubmit={handleEditDocumentSubmit}
      handleEditUserSubmit={handleEditUserSubmit}
      handleSubmit={handleSubmit}
      handleSendDocSubmit={handleSendDocSubmit}
      selectedDoc={selectedDoc}
      setAdminMsgImagePreview={setAdminMsgImagePreview}
      setAdminMsgImageUrl={setAdminMsgImageUrl}
      setAdminMsgText={setAdminMsgText}
      setAdminMsgTitle={setAdminMsgTitle}
      setFormData={setFormData}
      setIsSubmitting={setIsSubmitting}
      setSelectedDoc={setSelectedDoc}
      success={success}
      showSubmissionsModal={showSubmissionsModal}
      activeAssignment={activeAssignment}
      closeSubmissionsModal={closeSubmissionsModal}
      updateSubmission={updateSubmission}
      selectedAssignmentSubmissions={selectedAssignmentSubmissions}
      activeStudentProfileId={activeStudentProfileId}
      activeStudentProfileData={activeStudentProfileData}
      activeStudentProfileError={activeStudentProfileError}
      activeStudentProfileLoading={activeStudentProfileLoading}
      handleAddStudentAdminNote={handleAddStudentAdminNote}
      handleCloseStudentProfile={handleCloseStudentProfile}
      activeStudentProfileUser={activeStudentProfileUser}
      isSpotlightOpen={isSpotlightOpen}
      isBroadcastOpen={isBroadcastOpen}
    />
  );
}
