import type {
  AdminAssignment,
  AdminNotification,
  AdminQuizResultRow,
  AdminStudyGoalRow,
  AdminStudySessionRow,
  AdminSubmission,
  AdminUser,
  StudentAdminStatus,
  StudentWeeklyPlan,
} from '@/features/admin/types';
import {
  buildTrackingDashboard,
  buildTrackingInsights,
} from '@/features/admin/utils/tracking-insights';

const now = new Date('2026-04-30T12:00:00Z');
const todayStart = new Date('2026-04-30T00:00:00Z');
const weekStart = new Date('2026-04-27T00:00:00Z');

const student = (id: string, name: string): AdminUser => ({
  email: `${id}@example.com`,
  grade: 8,
  id,
  isAdmin: false,
  name,
});

const assignment = (
  id: string,
  dueDate: string,
  grade: number | null = 8,
): AdminAssignment => ({
  created_at: '2026-04-20T08:00:00Z',
  due_date: dueDate,
  grade,
  id,
  title: id,
});

const quizResult = (
  id: string,
  userId: string,
  score: number,
  completedAt = '2026-04-29T10:00:00Z',
): AdminQuizResultRow => ({
  completed_at: completedAt,
  id,
  quiz_id: `quiz-${id}`,
  score,
  total_questions: 10,
  user_id: userId,
});

const session = (
  id: string,
  userId: string,
  date: string,
  duration: number,
): AdminStudySessionRow => ({
  date,
  duration,
  id,
  user_id: userId,
});

const notification = (
  id: string,
  senderId: string,
  isRead = false,
): AdminNotification => ({
  created_at: '2026-04-30T09:00:00Z',
  id,
  is_read: isRead,
  message: JSON.stringify({
    sender_id: senderId,
    sender_name: 'Öğrenci',
    text: 'Hocam bakar mısınız?',
  }),
  title: 'Yeni mesaj',
  type: 'message',
  user_id: 'admin-1',
});

const build = (overrides: {
  adminStatuses?: StudentAdminStatus[];
  assignments?: AdminAssignment[];
  notifications?: AdminNotification[];
  quizResults?: AdminQuizResultRow[];
  studyGoals?: AdminStudyGoalRow[];
  studySessions?: AdminStudySessionRow[];
  students?: AdminUser[];
  submissions?: AdminSubmission[];
  weeklyPlans?: StudentWeeklyPlan[];
} = {}) =>
  buildTrackingInsights({
    activityEvents: [],
    adminStatuses: overrides.adminStatuses ?? [],
    assignments: overrides.assignments ?? [],
    notifications: overrides.notifications ?? [],
    now,
    quizResults: overrides.quizResults ?? [],
    students: overrides.students ?? [student('student-1', 'Ayşe')],
    studyGoals: overrides.studyGoals ?? [],
    studySessions: overrides.studySessions ?? [],
    submissions: overrides.submissions ?? [],
    todayStart,
    weekStart,
    weeklyPlans: overrides.weeklyPlans ?? [],
  });

describe('buildTrackingInsights', () => {
  it('marks students high risk when multiple warning signals exist', () => {
    const [insight] = build({
      assignments: [assignment('assignment-1', '2026-04-20T12:00:00Z')],
      notifications: [notification('message-1', 'student-1')],
      quizResults: [quizResult('result-1', 'student-1', 4, '2026-04-10T10:00:00Z')],
      studyGoals: [
        {
          target_duration: 600,
          user_id: 'student-1',
          week_start: '2026-04-27',
        },
      ],
      studySessions: [session('session-old', 'student-1', '2026-04-10', 30)],
    });

    expect(insight.riskLevel).toBe('high');
    expect(insight.riskReasons).toEqual([
      '7+ gün pasif',
      'Gecikmiş ödev',
      'Düşük son test',
      'Haftalık hedef geride',
      'Okunmamış mesaj',
    ]);
    expect(insight.weeklyProgress).toBe(0);
  });

  it('marks a single warning signal as watch level', () => {
    const [insight] = build({
      notifications: [notification('message-1', 'student-1')],
      studySessions: [session('session-today', 'student-1', '2026-04-30', 600)],
    });

    expect(insight.riskLevel).toBe('medium');
    expect(insight.riskReasons).toEqual(['Okunmamış mesaj']);
    expect(insight.activityStatus).toBe('today');
  });

  it('keeps active students without warning signals normal', () => {
    const [insight] = build({
      quizResults: [quizResult('result-1', 'student-1', 9)],
      studyGoals: [
        {
          target_duration: 600,
          user_id: 'student-1',
          week_start: '2026-04-27',
        },
      ],
      studySessions: [session('session-today', 'student-1', '2026-04-30', 600)],
      submissions: [
        {
          assignment_id: 'assignment-1',
          id: 'submission-1',
          status: 'submitted',
          student_id: 'student-1',
          submitted_at: '2026-04-29T09:00:00Z',
        },
      ],
    });

    expect(insight.riskLevel).toBe('low');
    expect(insight.riskReasons).toEqual([]);
    expect(insight.weeklyProgress).toBe(100);
  });

  it('summarizes tracking dashboard totals', () => {
    const insights = build({
      notifications: [notification('message-1', 'student-1')],
      students: [student('student-1', 'Ayşe'), student('student-2', 'Mehmet')],
    });

    expect(buildTrackingDashboard(insights)).toEqual({
      activeToday: 0,
      highRisk: 2,
      inactive: 2,
      unreadMessages: 1,
    });
  });

  it('populates student status, weekly plan and handles student-specific assignments', () => {
    const [insight] = build({
      adminStatuses: [
        {
          labels: ['takip'],
          status: 'contact_needed',
          student_id: 'student-1',
        },
      ],
      assignments: [
        {
          created_at: '2026-04-20T08:00:00Z',
          due_date: '2026-04-25T12:00:00Z',
          grade: null,
          id: 'universal-assignment',
          student_id: 'student-1',
          title: 'Özel Ödev',
        },
      ],
      weeklyPlans: [
        {
          id: 'plan-1',
          status: 'active',
          student_id: 'student-1',
          target_minutes: 200,
          title: 'Bu haftaki plan',
          week_start: '2026-04-27',
        },
      ],
    });

    expect(insight.status?.status).toBe('contact_needed');
    expect(insight.currentWeekPlan?.id).toBe('plan-1');
    expect(insight.overdueAssignments.map((a) => a.id)).toContain(
      'universal-assignment',
    );
  });

  describe('followUpStatus and FollowUpFilter', () => {
    it('correctly calculates overdue, today, upcoming and none follow-up statuses', () => {
      // now: 2026-04-30T12:00:00Z, todayStart: 2026-04-30T00:00:00Z
      const insights = build({
        adminStatuses: [
          { student_id: 's-overdue', status: 'watch', follow_up_at: '2026-04-29T10:00:00Z', labels: [] },
          { student_id: 's-today', status: 'contact_needed', follow_up_at: '2026-04-30T15:00:00Z', labels: [] },
          { student_id: 's-upcoming', status: 'watch', follow_up_at: '2026-05-02T10:00:00Z', labels: [] },
          { student_id: 's-none', status: 'normal', follow_up_at: null, labels: [] },
        ],
        students: [
          student('s-overdue', 'Gecikmiş Öğrenci'),
          student('s-today', 'Bugünkü Öğrenci'),
          student('s-upcoming', 'Gelecek Öğrenci'),
          student('s-none', 'Takipsiz Öğrenci'),
        ],
      });

      const overdueInsight = insights.find((i) => i.student.id === 's-overdue')!;
      const todayInsight = insights.find((i) => i.student.id === 's-today')!;
      const upcomingInsight = insights.find((i) => i.student.id === 's-upcoming')!;
      const noneInsight = insights.find((i) => i.student.id === 's-none')!;

      expect(overdueInsight.followUpStatus).toBe('overdue');
      expect(todayInsight.followUpStatus).toBe('today');
      expect(upcomingInsight.followUpStatus).toBe('upcoming');
      expect(noneInsight.followUpStatus).toBe('none');
    });

    it('filters insights based on FollowUpFilter criteria', async () => {
      const { matchesFollowUpFilter } = await import('@/features/admin/utils/tracking-insights');

      const mockInsight = (followUpStatus: 'overdue' | 'today' | 'upcoming' | 'none') =>
        ({ followUpStatus }) as ReturnType<typeof buildTrackingInsights>[number];

      const overdue = mockInsight('overdue');
      const today = mockInsight('today');
      const upcoming = mockInsight('upcoming');
      const none = mockInsight('none');

      expect(matchesFollowUpFilter(overdue, 'all')).toBe(true);
      expect(matchesFollowUpFilter(none, 'all')).toBe(true);

      expect(matchesFollowUpFilter(overdue, 'any')).toBe(true);
      expect(matchesFollowUpFilter(today, 'any')).toBe(true);
      expect(matchesFollowUpFilter(none, 'any')).toBe(false);

      expect(matchesFollowUpFilter(overdue, 'overdue')).toBe(true);
      expect(matchesFollowUpFilter(today, 'overdue')).toBe(false);

      expect(matchesFollowUpFilter(today, 'today')).toBe(true);
      expect(matchesFollowUpFilter(upcoming, 'today')).toBe(false);

      expect(matchesFollowUpFilter(upcoming, 'upcoming')).toBe(true);
      expect(matchesFollowUpFilter(overdue, 'upcoming')).toBe(false);
    });
  });

  describe('appendUniqueStudentLabel', () => {
    it('appends trimmed new label without duplicates case-insensitively and respects 12 limit', async () => {
      const { appendUniqueStudentLabel } = await import('@/features/admin/utils/tracking-insights');

      expect(appendUniqueStudentLabel(['LGS', 'Deneme'], 'Ödev')).toEqual(['LGS', 'Deneme', 'Ödev']);
      expect(appendUniqueStudentLabel(['LGS', 'Deneme'], ' lgs ')).toEqual(['LGS', 'Deneme']);
      expect(appendUniqueStudentLabel(['LGS'], '   ')).toEqual(['LGS']);
      expect(appendUniqueStudentLabel(null, 'Hedef')).toEqual(['Hedef']);

      const twelveLabels = Array.from({ length: 12 }, (_, i) => `Etiket-${i + 1}`);
      const result = appendUniqueStudentLabel(twelveLabels, 'Yeni Etiket');
      expect(result).toHaveLength(12);
      expect(result).not.toContain('Yeni Etiket');
    });
  });
});
