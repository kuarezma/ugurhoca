import { describe, expect, it } from 'vitest';
import type {
  DashboardAssignment,
  DashboardBadge,
  DashboardQuizResult,
  DashboardSubmission,
  StudentProfile,
} from '@/types/dashboard';
import type { ProgressRow, StudyGoal, StudySession } from '@/features/progress/types';
import type { AdminStudentProfileData } from '@/features/admin/types';
import { buildAdminStudentProfileSummary } from '@/features/admin/utils/student-profile';

const referenceDate = new Date('2026-04-15T12:00:00Z');

const student: StudentProfile = {
  current_streak: 6,
  email: 'ogrenci@example.com',
  grade: 8,
  id: 'student-1',
  isAdmin: false,
  name: 'Ayşe Öğrenci',
};

const assignments: DashboardAssignment[] = [
  {
    created_at: '2026-04-10T08:00:00Z',
    description: 'Üslü ifadeler tekrar ödevi',
    due_date: '2026-04-17T12:00:00Z',
    id: 'assignment-1',
    title: 'Üslü İfadeler Ödevi',
  },
];

const badges: DashboardBadge[] = [
  {
    earnedAt: '2026-04-12T10:00:00Z',
    icon: 'Award',
    id: 'badge-1',
    name: 'İlk Adım',
  },
];

const goal: StudyGoal = {
  target_duration: 180,
  week_start: '2026-04-13',
};

const progressRows: ProgressRow[] = [
  {
    id: 'progress-1',
    mastery_level: 42,
    topic: 'Üslü İfadeler',
    user_id: 'student-1',
  },
  {
    id: 'progress-2',
    mastery_level: 80,
    topic: 'Olasılık',
    user_id: 'student-1',
  },
];

const quizResults: DashboardQuizResult[] = [
  {
    completed_at: '2026-04-14T12:00:00Z',
    id: 'quiz-result-1',
    score: 78,
    total_questions: 20,
  },
  {
    completed_at: '2026-04-10T12:00:00Z',
    id: 'quiz-result-2',
    score: 66,
    total_questions: 20,
  },
];

const studySessions: StudySession[] = [
  {
    date: '2026-04-14',
    duration: 40,
    id: 'session-1',
  },
  {
    date: '2026-04-15',
    duration: 35,
    id: 'session-2',
  },
];

const submissions: DashboardSubmission[] = [
  {
    assignment_id: 'assignment-1',
    feedback: 'Güzel ilerliyorsun.',
    grade: 90,
    id: 'submission-1',
    status: 'reviewed',
    student_id: 'student-1',
    submitted_at: '2026-04-13T12:00:00Z',
  },
];

const createProfileData = (
  overrides?: Partial<AdminStudentProfileData>,
): AdminStudentProfileData => ({
  assignments: overrides?.assignments ?? assignments,
  badges: overrides?.badges ?? badges,
  goal: overrides?.goal ?? goal,
  progressRows: overrides?.progressRows ?? progressRows,
  quizResults: overrides?.quizResults ?? quizResults,
  student: overrides?.student ?? student,
  studySessions: overrides?.studySessions ?? studySessions,
  submissions: overrides?.submissions ?? submissions,
});

describe('buildAdminStudentProfileSummary', () => {
  it('reuses dashboard calculations for weekly progress and topic focus', () => {
    const summary = buildAdminStudentProfileSummary(
      createProfileData(),
      referenceDate,
    );

    expect(summary.goalSnapshot.completedMinutes).toBe(75);
    expect(summary.goalSnapshot.targetMinutes).toBe(180);
    expect(summary.strongTopic).toBe('Olasılık');
    expect(summary.focusTopic).toBe('Üslü İfadeler');
    expect(summary.latestQuizScore).toBe(78);
  });

  it('surfaces sorted quiz and reviewed submission summaries', () => {
    const summary = buildAdminStudentProfileSummary(
      createProfileData(),
      referenceDate,
    );

    expect(summary.recentQuizResults.map((result) => result.id)).toEqual([
      'quiz-result-1',
      'quiz-result-2',
    ]);
    expect(summary.reviewedSubmissions.map((submission) => submission.id)).toEqual([
      'submission-1',
    ]);
    expect(summary.currentStreak).toBe(6);
    expect(summary.totalAssignments).toBe(1);
  });
});
