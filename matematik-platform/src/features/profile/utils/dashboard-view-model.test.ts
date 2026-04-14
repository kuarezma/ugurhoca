import { describe, expect, it } from 'vitest';
import type {
  DashboardAssignment,
  DashboardBadge,
  DashboardDocument,
  DashboardNotification,
  DashboardQuizResult,
  DashboardQuizSummary,
  DashboardSubmission,
  StudentProfile,
} from '@/types/dashboard';
import type {
  ProfileProgressRow,
  ProfileStudySessionRow,
} from '@/features/profile/types';
import type { StudyGoal } from '@/features/progress/types';
import {
  buildDashboardGoalSnapshot,
  buildProfileDashboardViewModel,
} from '@/features/profile/utils/dashboard-view-model';

const referenceDate = new Date('2026-04-15T12:00:00Z');

const baseAssignments: DashboardAssignment[] = [
  {
    created_at: '2026-04-10T08:00:00Z',
    description: 'Üslü ifadeler çalışma kağıdı',
    due_date: '2026-04-16T12:00:00Z',
    id: 'assignment-1',
    title: 'Üslü İfadeler Ödevi',
  },
  {
    created_at: '2026-04-09T08:00:00Z',
    description: 'Karekök ödevi',
    id: 'assignment-2',
    title: 'Karekök Tekrarı',
  },
];

const baseQuizList: DashboardQuizSummary[] = [
  {
    difficulty: 'Orta',
    grade: 8,
    id: 'quiz-1',
    time_limit: 25,
    title: 'Üslü İfadeler Hız Testi',
  },
];

const baseProgressRows: ProfileProgressRow[] = [
  {
    id: 'progress-1',
    mastery_level: 45,
    topic: 'Üslü İfadeler',
  },
  {
    id: 'progress-2',
    mastery_level: 82,
    topic: 'Olasılık',
  },
];

const baseStudySessions: ProfileStudySessionRow[] = [
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

const baseGoal: StudyGoal = {
  target_duration: 180,
  week_start: '2026-04-13',
};

const baseNotifications: DashboardNotification[] = [
  {
    created_at: '2026-04-15T08:00:00Z',
    id: 'notification-1',
    is_read: false,
    message: 'Bu akşam kısa tekrar yap.',
    title: 'Uğur Hoca yazdı',
    type: 'admin-message',
    user_id: 'student-1',
  },
];

const baseDocuments: DashboardDocument[] = [
  {
    created_at: '2026-04-14T10:00:00Z',
    document_title: 'Yeni PDF',
    document_type: 'pdf',
    file_url: 'https://example.com/doc.pdf',
    id: 'document-1',
    is_read: false,
  },
];

const baseSubmissions: DashboardSubmission[] = [
  {
    assignment_id: 'assignment-2',
    feedback: 'Çözüm yöntemin temiz, bir tur daha tekrar et.',
    grade: 90,
    id: 'submission-1',
    status: 'reviewed',
    student_id: 'student-1',
    submitted_at: '2026-04-13T12:00:00Z',
  },
];

const baseQuizResults: DashboardQuizResult[] = [
  {
    completed_at: '2026-04-12T12:00:00Z',
    id: 'result-1',
    score: 78,
    total_questions: 20,
  },
];

const baseUser: StudentProfile = {
  email: 'ogrenci@example.com',
  grade: 8,
  id: 'student-1',
  isAdmin: false,
  name: 'Ayşe Öğrenci',
  current_streak: 4,
};

const baseBadges: DashboardBadge[] = [
  {
    earnedAt: '2026-04-11T08:00:00Z',
    icon: 'Award',
    id: 'badge-1',
    name: 'İlk Adım',
  },
];

const createViewModel = (overrides?: {
  assignments?: DashboardAssignment[];
  availableQuizzes?: DashboardQuizSummary[];
  badges?: DashboardBadge[];
  goal?: StudyGoal | null;
  notifications?: DashboardNotification[];
  progressRows?: ProfileProgressRow[];
  quizResults?: DashboardQuizResult[];
  sharedDocs?: DashboardDocument[];
  studySessions?: ProfileStudySessionRow[];
  submissions?: DashboardSubmission[];
  user?: StudentProfile | null;
}) =>
  buildProfileDashboardViewModel({
    assignments: overrides?.assignments ?? baseAssignments,
    availableQuizzes: overrides?.availableQuizzes ?? baseQuizList,
    badges: overrides?.badges ?? baseBadges,
    goal: overrides?.goal ?? baseGoal,
    notifications: overrides?.notifications ?? baseNotifications,
    progressRows: overrides?.progressRows ?? baseProgressRows,
    quizResults: overrides?.quizResults ?? baseQuizResults,
    referenceDate,
    sharedDocs: overrides?.sharedDocs ?? baseDocuments,
    studySessions: overrides?.studySessions ?? baseStudySessions,
    submissions: overrides?.submissions ?? baseSubmissions,
    user: overrides?.user ?? baseUser,
  });

describe('dashboard view model', () => {
  it('builds today plan tasks in the configured priority order', () => {
    const viewModel = createViewModel();

    expect(viewModel.tasks.map((task) => task.id)).toEqual([
      'assignment:assignment-1',
      'topic:Üslü İfadeler',
      'quiz:quiz-1',
    ]);
    expect(viewModel.primaryTask?.title).toBe('Yaklaşan ödevini tamamla');
  });

  it('uses a 600-minute fallback when there is no current study goal', () => {
    const snapshot = buildDashboardGoalSnapshot({
      goal: null,
      referenceDate,
      studySessions: baseStudySessions,
    });

    expect(snapshot.targetMinutes).toBe(600);
    expect(snapshot.completedMinutes).toBe(75);
    expect(snapshot.activeDays).toBe(2);
  });

  it('builds the quick updates list from message, feedback and document sources', () => {
    const viewModel = createViewModel();

    expect(viewModel.updates.map((update) => update.type)).toEqual([
      'message',
      'document',
      'feedback',
    ]);
    expect(viewModel.updates[0]).toMatchObject({
      title: 'Uğur Hoca yazdı',
      type: 'message',
    });
  });

  it('shows only the available quick update type when one source exists', () => {
    const viewModel = createViewModel({
      notifications: [],
      sharedDocs: [],
    });

    expect(viewModel.updates).toHaveLength(1);
    expect(viewModel.updates[0]?.type).toBe('feedback');
  });

  it('returns no quick updates when there is no source data', () => {
    const viewModel = createViewModel({
      notifications: [],
      sharedDocs: [],
      submissions: [],
    });

    expect(viewModel.updates).toEqual([]);
  });
});
