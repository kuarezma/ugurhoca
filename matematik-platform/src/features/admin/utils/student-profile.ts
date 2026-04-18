import type {
  DashboardQuizResult,
  DashboardSubmission,
} from '@/types/dashboard';
import {
  buildProfileDashboardViewModel,
  type ProfileDashboardViewModel,
} from '@/features/profile/utils/dashboard-view-model';
import type { AdminStudentProfileData } from '@/features/admin/types';

export type AdminStudentProfileSummary = Pick<
  ProfileDashboardViewModel,
  | 'focusTopic'
  | 'goalSnapshot'
  | 'latestQuizScore'
  | 'pendingAssignments'
  | 'strongTopic'
> & {
  currentStreak: number;
  recentQuizResults: DashboardQuizResult[];
  reviewedSubmissions: DashboardSubmission[];
  totalAssignments: number;
};

const sortByCompletedAtDesc = (results: DashboardQuizResult[]) =>
  [...results].sort(
    (left, right) =>
      new Date(right.completed_at || 0).getTime() -
      new Date(left.completed_at || 0).getTime(),
  );

const sortBySubmittedAtDesc = (submissions: DashboardSubmission[]) =>
  [...submissions].sort(
    (left, right) =>
      new Date(right.submitted_at || 0).getTime() -
      new Date(left.submitted_at || 0).getTime(),
  );

export const buildAdminStudentProfileSummary = (
  data: AdminStudentProfileData,
  referenceDate?: Date,
): AdminStudentProfileSummary => {
  const sortedProgressRows = [...data.progressRows].sort(
    (left, right) => right.mastery_level - left.mastery_level,
  );

  const viewModel = buildProfileDashboardViewModel({
    assignments: data.assignments,
    availableQuizzes: [],
    badges: data.badges,
    goal: data.goal,
    notifications: [],
    progressRows: sortedProgressRows.map((row) => ({
      id: row.id || `${row.user_id}:${row.topic}`,
      mastery_level: row.mastery_level,
      topic: row.topic,
    })),
    quizResults: data.quizResults,
    referenceDate,
    sharedDocs: [],
    studySessions: data.studySessions.map((session) => ({
      date: session.date,
      duration: session.duration,
      id: session.id || `${data.student.id}:${session.date}:${session.duration}`,
    })),
    submissions: data.submissions,
    user: data.student,
  });

  return {
    currentStreak: data.student.current_streak || 0,
    focusTopic: viewModel.focusTopic,
    goalSnapshot: viewModel.goalSnapshot,
    latestQuizScore: viewModel.latestQuizScore,
    pendingAssignments: viewModel.pendingAssignments,
    recentQuizResults: sortByCompletedAtDesc(data.quizResults).slice(0, 5),
    reviewedSubmissions: sortBySubmittedAtDesc(
      data.submissions.filter((submission) => submission.status === 'reviewed'),
    ).slice(0, 5),
    strongTopic: viewModel.strongTopic,
    totalAssignments: data.assignments.length,
  };
};
