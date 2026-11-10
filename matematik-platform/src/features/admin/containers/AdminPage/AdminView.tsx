import { AnimatePresence } from 'framer-motion';
import { Plus, Upload } from 'lucide-react';

import { AdminActionDialogHost } from '@/features/admin/components/AdminActionDialog';
import {
  AdminMainModal,
  AdminNotificationDetailModal,
  AdminNotificationsPanel,
  AdminStudentProfileDrawer,
  AdminSubmissionsModal,
  AdminSpotlightModal,
  AdminBroadcastModal,
  AdminDiagnosticsCard,
} from './lazy';
import { AdminNavigation } from './AdminNavigation';
import { AdminWelcome } from './AdminWelcome';
import { AdminTabs } from './AdminTabs';
import { AdminPanels } from './AdminPanels';
import type { AdminViewProps } from './view-types';

export function AdminView(props: AdminViewProps) {
  return (
    <main className="page-surface admin-page min-h-screen pb-20">
      <AdminNavigation
        setIsSpotlightOpen={props.setIsSpotlightOpen}
        setShowNotifications={props.setShowNotifications}
        unreadNotifications={props.unreadNotifications}
        handleLogout={props.handleLogout}
      />

      {props.showNotifications && (
        <AdminNotificationsPanel
          formatRelativeTime={props.formatRelativeTime}
          getNotificationBody={props.getNotificationBody}
          isIncomingAdminMessage={props.isIncomingAdminMessage}
          notifications={props.notifications}
          onSelectNotification={props.markNotificationAsRead}
          unreadCount={props.unreadNotifications.length}
        />
      )}

      {props.selectedNotification && (
        <AdminNotificationDetailModal
          getMetadataText={props.getMetadataText}
          getNotificationBody={props.getNotificationBody}
          notification={props.selectedNotification}
          onClose={() => props.setSelectedNotification(null)}
          onDelete={props.deleteMessage}
          onModerationAction={props.applyModerationAction}
          onReplyTextChange={props.setReplyText}
          onSendReply={props.sendReply}
          payload={props.selectedNotificationPayload}
          replyText={props.replyText}
          status={props.selectedNotificationStatus}
        />
      )}

      <div className="pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-24 px-4 sm:px-6 overflow-x-clip">
        <div className="container mx-auto min-w-0">
          {/* Executive Welcome & KPI Summary Hero */}
          <AdminWelcome
            user={props.user}
            studentUsers={props.studentUsers}
            documents={props.documents}
            quizzes={props.quizzes}
            worksheetCandidates={props.worksheetCandidates}
            openModal={props.openModal}
            setIsBroadcastOpen={props.setIsBroadcastOpen}
          />

          {/* System Diagnostics & Integration Status Card */}
          <AdminDiagnosticsCard
            driveConnected={Boolean(props.googleDriveConnection?.connected)}
            pendingCandidatesCount={
              props.worksheetCandidates.filter((c) => c.status === 'pending')
                .length
            }
            unreadMessagesCount={
              props.notifications.filter(
                (n) => !n.is_read && n.type === 'message',
              ).length
            }
            studentCount={props.studentUsers.length}
            onRefresh={() => {
              void props.loadData();
              void props.refreshUsers();
              void props.refreshGoogleDriveConnection();
            }}
          />

          {/* Category Filter Pills & Tab Navigation */}
          <AdminTabs
            setTabCategory={props.setTabCategory}
            tabCategory={props.tabCategory}
            studentUsers={props.studentUsers}
            documents={props.documents}
            quizzes={props.quizzes}
            assignments={props.assignments}
            liveLessons={props.liveLessons}
            annualPlanItems={props.annualPlanItems}
            worksheetCandidates={props.worksheetCandidates}
            announcements={props.announcements}
            setActiveTab={props.setActiveTab}
            activeTab={props.activeTab}
          />

          {props.activeTab !== 'statistics' &&
            props.activeTab !== 'tracking' &&
            props.activeTab !== 'classroom' &&
            props.activeTab !== 'contentCoverage' &&
            props.activeTab !== 'annualPlan' &&
            props.activeTab !== 'worksheetCandidates' &&
            props.activeTab !== 'users' &&
            props.activeTab !== 'gradeUpdate' &&
            props.activeTab !== 'assignments' &&
            props.activeTab !== 'quizzes' &&
            props.activeTab !== 'liveLessons' && (
              <div className="flex justify-stretch sm:justify-end mb-6">
                <button
                  onClick={() =>
                    props.openModal(
                      props.activeTab === 'announcements'
                        ? 'announcement'
                        : 'document',
                    )
                  }
                  className="btn-primary w-full sm:w-auto justify-center"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Ekle
                </button>
              </div>
            )}

          {props.activeTab === 'quizzes' && (
            <div className="flex flex-col justify-stretch gap-3 mb-6 sm:flex-row sm:justify-end">
              <button
                onClick={() => props.openModal('quiz')}
                className="btn-primary w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5" />
                Yeni Test
              </button>
              <button
                onClick={() => props.openModal('importQuestions')}
                className="px-4 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-95 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center bg-accent-bg hover:bg-accent-bg text-primary dark:text-primary shadow-btn-3d-green active:translate-y-1 active:shadow-none"
              >
                <Upload className="w-5 h-5" />
                Toplu Yükle
              </button>
            </div>
          )}

          <AdminPanels
            activeTab={props.activeTab}
            dashboardVersion={props.dashboardVersion}
            activityEvents={props.activityEvents}
            learningActivityStatus={props.learningActivityStatus}
            liveLessonActivityStatus={props.liveLessonActivityStatus}
            refreshLearningActivity={props.refreshLearningActivity}
            refreshLiveLessonActivity={props.refreshLiveLessonActivity}
            adminStatuses={props.adminStatuses}
            announcements={props.announcements}
            annualPlanItems={props.annualPlanItems}
            assignments={props.assignments}
            dashboardQuizResults={props.dashboardQuizResults}
            dashboardStudyGoals={props.dashboardStudyGoals}
            dashboardStudySessions={props.dashboardStudySessions}
            dashboardSubmissions={props.dashboardSubmissions}
            documents={props.documents}
            formatDate={props.formatDate}
            googleDriveConnection={props.googleDriveConnection}
            isSubmitting={props.isSubmitting}
            isGoogleDriveBusy={props.isGoogleDriveBusy}
            isWeekScanRunning={props.isWeekScanRunning}
            lastGradeUpdate={props.lastGradeUpdate}
            lastWeekScanResult={props.lastWeekScanResult}
            liveLessons={props.liveLessons}
            notifications={props.notifications}
            handleAddQuizQuestion={props.handleAddQuizQuestion}
            handleApproveWorksheetCandidate={
              props.handleApproveWorksheetCandidate
            }
            handleConnectGoogleDrive={props.handleConnectGoogleDrive}
            openModal={props.openModal}
            handleCreateWeeklyPlan={props.handleCreateWeeklyPlan}
            handleDiscoverWorksheetCandidates={
              props.handleDiscoverWorksheetCandidates
            }
            deleteItem={props.deleteItem}
            handleDisconnectGoogleDrive={props.handleDisconnectGoogleDrive}
            handleDownloadStudentsPdf={props.handleDownloadStudentsPdf}
            openEditAnnouncement={props.openEditAnnouncement}
            editAssignment={props.editAssignment}
            openEditDocument={props.openEditDocument}
            handleEditQuiz={props.handleEditQuiz}
            editSharedDocument={props.editSharedDocument}
            openEditUser={props.openEditUser}
            handleImportAnnualPlan={props.handleImportAnnualPlan}
            handleMigrateWorksheetDocuments={
              props.handleMigrateWorksheetDocuments
            }
            handleRefreshDocumentCategories={
              props.handleRefreshDocumentCategories
            }
            refreshWorksheetSourceStatus={props.refreshWorksheetSourceStatus}
            loadData={props.loadData}
            handleScanCurrentWeekCandidates={
              props.handleScanCurrentWeekCandidates
            }
            openAdminMessage={props.openAdminMessage}
            handleOpenSubmissions={props.handleOpenSubmissions}
            handleToggleFavoriteStudent={props.handleToggleFavoriteStudent}
            handleUpdateStudentStatus={props.handleUpdateStudentStatus}
            handleUpdateGrades={props.handleUpdateGrades}
            handleUpdateWorksheetCandidateStatus={
              props.handleUpdateWorksheetCandidateStatus
            }
            handleOpenStudentProfile={props.handleOpenStudentProfile}
            pdfStudentsLoading={props.pdfStudentsLoading}
            quizzes={props.quizzes}
            sharedDocs={props.sharedDocs}
            studentUsers={props.studentUsers}
            weeklyPlans={props.weeklyPlans}
            worksheetSourceStatus={props.worksheetSourceStatus}
            worksheetCandidates={props.worksheetCandidates}
          />
        </div>
      </div>

      {props.showModal && (
        <AdminMainModal
          adminMsgImagePreview={props.adminMsgImagePreview}
          adminMsgRecipient={props.adminMsgRecipient}
          adminMsgText={props.adminMsgText}
          adminMsgTitle={props.adminMsgTitle}
          documents={props.documents}
          editingDoc={props.editingDoc}
          editingUser={props.editingUser}
          formData={props.formData}
          isSubmitting={props.isSubmitting}
          modalType={props.modalType}
          onAdminMessageSubmit={props.handleAdminMessageSubmit}
          onClose={props.resetModalState}
          onEditDocumentSubmit={props.handleEditDocumentSubmit}
          onEditUserSubmit={props.handleEditUserSubmit}
          onGenericSubmit={props.handleSubmit}
          onSendDocSubmit={props.handleSendDocSubmit}
          selectedDoc={props.selectedDoc}
          setAdminMsgImagePreview={props.setAdminMsgImagePreview}
          setAdminMsgImageUrl={props.setAdminMsgImageUrl}
          setAdminMsgText={props.setAdminMsgText}
          setAdminMsgTitle={props.setAdminMsgTitle}
          setFormData={props.setFormData}
          setIsSubmitting={props.setIsSubmitting}
          setSelectedDoc={props.setSelectedDoc}
          studentUsers={props.studentUsers}
          success={props.success}
        />
      )}

      {props.showSubmissionsModal && props.activeAssignment && (
        <AdminSubmissionsModal
          assignment={props.activeAssignment}
          onClose={props.closeSubmissionsModal}
          onUpdateSubmission={props.updateSubmission}
          submissions={props.selectedAssignmentSubmissions}
        />
      )}

      <AnimatePresence>
        {props.activeStudentProfileId && (
          <AdminStudentProfileDrawer
            data={props.activeStudentProfileData}
            error={props.activeStudentProfileError}
            formatDate={props.formatDate}
            isLoading={props.activeStudentProfileLoading}
            onAddAdminNote={props.handleAddStudentAdminNote}
            onClose={props.handleCloseStudentProfile}
            onCreateWeeklyPlan={props.handleCreateWeeklyPlan}
            onUpdateStatus={props.handleUpdateStudentStatus}
            student={props.activeStudentProfileUser}
          />
        )}
      </AnimatePresence>

      <AdminSpotlightModal
        isOpen={props.isSpotlightOpen}
        onClose={() => props.setIsSpotlightOpen(false)}
        students={props.studentUsers}
        quizzes={props.quizzes}
        documents={props.documents}
        liveLessons={props.liveLessons.lessons}
        onSelectStudent={(student) =>
          void props.handleOpenStudentProfile(student)
        }
        onSelectTab={(tab) => {
          props.setActiveTab(tab);
        }}
        onOpenModal={(modal) => props.openModal(modal)}
        onOpenBroadcast={() => props.setIsBroadcastOpen(true)}
      />

      <AdminBroadcastModal
        isOpen={props.isBroadcastOpen}
        onClose={() => props.setIsBroadcastOpen(false)}
        students={props.studentUsers}
      />

      <AdminActionDialogHost />
    </main>
  );
}
