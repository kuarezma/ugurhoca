'use client';

import dynamic from 'next/dynamic';
import type { ProfileProgressRow } from '@/features/profile/types';
import type {
  DashboardAssignment,
  DashboardGoalSnapshot,
  DashboardNotification,
  DashboardQuizResult,
  StudentProfile,
} from '@/types/dashboard';

const AvatarSelectionModal = dynamic(
  () => import('@/components/dashboard/AvatarSelectionModal'),
  { ssr: false },
);
const AssignmentDetailModal = dynamic(
  () => import('@/features/profile/components/AssignmentDetailModal'),
  { ssr: false },
);
const MessageDetailModal = dynamic(
  () => import('@/features/profile/components/MessageDetailModal'),
  { ssr: false },
);
const GrowthReportModal = dynamic(
  () => import('@/features/profile/components/GrowthReportModal'),
  { ssr: false },
);
const StudentPortfolioModal = dynamic(
  () => import('@/features/portfolio/components/StudentPortfolioModal'),
  { ssr: false },
);
const MathAhaMomentsModal = dynamic(
  () =>
    import('@/features/profile/components/MathAhaMomentsModal').then((m) => ({
      default: m.MathAhaMomentsModal,
    })),
  { ssr: false },
);
const GoalTimeCapsuleModal = dynamic(
  () =>
    import('@/features/profile/components/GoalTimeCapsuleModal').then((m) => ({
      default: m.GoalTimeCapsuleModal,
    })),
  { ssr: false },
);
const StudentQuestionAuthoringModal = dynamic(
  () =>
    import('@/features/authoring/components/StudentQuestionAuthoringModal').then(
      (m) => ({ default: m.StudentQuestionAuthoringModal }),
    ),
  { ssr: false },
);
const FeynmanVoiceExplanationModal = dynamic(
  () =>
    import('@/features/feynman/components/FeynmanVoiceExplanationModal').then(
      (m) => ({ default: m.FeynmanVoiceExplanationModal }),
    ),
  { ssr: false },
);

export type ProfileFeatureModalsProps = {
  user: StudentProfile;
  goalSnapshot: DashboardGoalSnapshot;
  quizResults: DashboardQuizResult[];
  latestQuizScore: number | null;
  progressRows: ProfileProgressRow[];
  isAvatarModalOpen: boolean;
  onCloseAvatarModal: () => void;
  onAvatarSelect: (avatar: string) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<void>;
  isParentReportOpen: boolean;
  onCloseParentReport: () => void;
  isPortfolioOpen: boolean;
  onClosePortfolio: () => void;
  isAhaModalOpen: boolean;
  onCloseAhaModal: () => void;
  isTimeCapsuleOpen: boolean;
  onCloseTimeCapsule: () => void;
  isAuthoringModalOpen: boolean;
  onCloseAuthoringModal: () => void;
  isFeynmanModalOpen: boolean;
  onCloseFeynmanModal: () => void;
  selectedAssignment: DashboardAssignment | null;
  onCloseAssignment: () => void;
  onOpenAssignments: () => void;
  selectedMessage: DashboardNotification | null;
  onCloseMessage: () => void;
};

export function ProfileFeatureModals({
  user,
  goalSnapshot,
  quizResults,
  latestQuizScore,
  progressRows,
  isAvatarModalOpen,
  onCloseAvatarModal,
  onAvatarSelect,
  onAvatarUpload,
  isParentReportOpen,
  onCloseParentReport,
  isPortfolioOpen,
  onClosePortfolio,
  isAhaModalOpen,
  onCloseAhaModal,
  isTimeCapsuleOpen,
  onCloseTimeCapsule,
  isAuthoringModalOpen,
  onCloseAuthoringModal,
  isFeynmanModalOpen,
  onCloseFeynmanModal,
  selectedAssignment,
  onCloseAssignment,
  onOpenAssignments,
  selectedMessage,
  onCloseMessage,
}: ProfileFeatureModalsProps) {
  const strongTopic =
    progressRows.find((r) => r.mastery_level >= 75)?.topic ?? null;
  const focusTopic =
    progressRows.find((r) => r.mastery_level < 60)?.topic ?? null;

  return (
    <>
      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={onCloseAvatarModal}
        onSelect={onAvatarSelect}
        onUpload={onAvatarUpload}
        currentAvatar={user.avatar_id}
      />

      <GrowthReportModal
        isOpen={isParentReportOpen}
        onClose={onCloseParentReport}
        studentName={user.name || user.email || 'Öğrenci'}
        studentGrade={user.grade ?? 'Belirtilmedi'}
        streakCount={user.current_streak || 0}
        progressPercent={goalSnapshot.progressPercent || 0}
        totalQuizzesSolved={quizResults?.length || 0}
        averageScore={latestQuizScore ?? 0}
        strongTopic={strongTopic}
        focusTopic={focusTopic}
      />

      <StudentPortfolioModal
        isOpen={isPortfolioOpen}
        onClose={onClosePortfolio}
        studentName={user.name || user.email || 'Öğrenci'}
        grade={String(user.grade ?? '8')}
      />

      <MathAhaMomentsModal
        isOpen={isAhaModalOpen}
        onClose={onCloseAhaModal}
        studentName={user.name || user.email || 'Öğrenci'}
        studentId={user.id}
      />

      <GoalTimeCapsuleModal
        isOpen={isTimeCapsuleOpen}
        onClose={onCloseTimeCapsule}
        studentName={user.name || user.email || 'Öğrenci'}
        studentId={user.id}
      />

      <StudentQuestionAuthoringModal
        isOpen={isAuthoringModalOpen}
        onClose={onCloseAuthoringModal}
        studentName={user.name || user.email || 'Öğrenci'}
        studentId={user.id}
        grade={String(user.grade ?? '8')}
      />

      <FeynmanVoiceExplanationModal
        isOpen={isFeynmanModalOpen}
        onClose={onCloseFeynmanModal}
        studentName={user.name || user.email || 'Öğrenci'}
        studentId={user.id}
        grade={String(user.grade ?? '8')}
      />

      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={onCloseAssignment}
          onOpenAssignments={onOpenAssignments}
        />
      )}

      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={onCloseMessage}
        />
      )}
    </>
  );
}
