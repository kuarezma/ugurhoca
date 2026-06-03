import { parseSupportPayload } from '@/features/messages/supportChatUtils';
import type {
  AdminAssignment,
  AdminNotification,
  AdminQuizResultRow,
  AdminStudyGoalRow,
  AdminStudySessionRow,
  AdminSubmission,
  AdminUser,
  StudentActivityEvent,
  StudentAdminStatus,
  StudentWeeklyPlan,
} from '@/features/admin/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export type TrackingInsight = {
  activityStatus: 'today' | 'week' | 'inactive';
  currentWeekPlan?: StudentWeeklyPlan;
  inactiveDays: number;
  lastActivityAt: string | null;
  latestQuizPercent: number | null;
  overdueAssignments: AdminAssignment[];
  riskLevel: 'high' | 'medium' | 'low';
  riskReasons: string[];
  status: StudentAdminStatus | null;
  student: AdminUser;
  targetMinutes: number;
  unreadMessages: number;
  weeklyMinutes: number;
  weeklyProgress: number;
};

export type TrackingSortOption =
  | 'risk'
  | 'lastActivity'
  | 'inactiveDays'
  | 'unreadMessages'
  | 'weeklyTargetLag'
  | 'latestQuizPercent';

type BuildTrackingInsightsInput = {
  activityEvents: StudentActivityEvent[];
  adminStatuses: StudentAdminStatus[];
  assignments: AdminAssignment[];
  notifications: AdminNotification[];
  now?: Date;
  quizResults: AdminQuizResultRow[];
  studyGoals: AdminStudyGoalRow[];
  studySessions: AdminStudySessionRow[];
  students: AdminUser[];
  submissions: AdminSubmission[];
  todayStart: Date;
  weekStart: Date;
  weeklyPlans: StudentWeeklyPlan[];
};

const getDaysSince = (value: string | null, now: Date) => {
  if (!value) return Number.POSITIVE_INFINITY;
  return Math.floor((now.getTime() - new Date(value).getTime()) / DAY_MS);
};

const assignmentAppliesToStudent = (
  assignment: AdminAssignment,
  student: AdminUser,
) => {
  if (assignment.student_id) {
    return assignment.student_id === student.id;
  }

  if (assignment.grade === null || typeof assignment.grade === 'undefined') {
    return true;
  }

  return String(assignment.grade) === String(student.grade);
};

const getQuizPercent = (result?: AdminQuizResultRow | null) => {
  if (!result) return null;
  return Math.round((result.score / Math.max(result.total_questions, 1)) * 100);
};

const getTime = (value: string | null) =>
  value ? new Date(value).getTime() : Number.NEGATIVE_INFINITY;

const compareByName = (left: TrackingInsight, right: TrackingInsight) =>
  (left.student.name || '').localeCompare(right.student.name || '', 'tr-TR');

export const sortTrackingInsights = (
  insights: TrackingInsight[],
  sortOption: TrackingSortOption,
) => {
  const riskOrder = { high: 0, medium: 1, low: 2 };
  const sortedInsights = [...insights].sort((left, right) => {
    if (sortOption === 'lastActivity') {
      const activityDelta =
        getTime(right.lastActivityAt) - getTime(left.lastActivityAt);
      if (activityDelta !== 0) return activityDelta;
    } else if (sortOption === 'inactiveDays') {
      const inactiveDelta = right.inactiveDays - left.inactiveDays;
      if (inactiveDelta !== 0) return inactiveDelta;
    } else if (sortOption === 'unreadMessages') {
      const unreadDelta = right.unreadMessages - left.unreadMessages;
      if (unreadDelta !== 0) return unreadDelta;
    } else if (sortOption === 'weeklyTargetLag') {
      const leftLag = Math.max(0, 100 - left.weeklyProgress);
      const rightLag = Math.max(0, 100 - right.weeklyProgress);
      const targetDelta = rightLag - leftLag;
      if (targetDelta !== 0) return targetDelta;
    } else if (sortOption === 'latestQuizPercent') {
      const leftPercent = left.latestQuizPercent ?? Number.POSITIVE_INFINITY;
      const rightPercent = right.latestQuizPercent ?? Number.POSITIVE_INFINITY;
      const quizDelta = leftPercent - rightPercent;
      if (quizDelta !== 0) return quizDelta;
    }

    const riskDelta = riskOrder[left.riskLevel] - riskOrder[right.riskLevel];
    if (riskDelta !== 0) return riskDelta;

    const favoriteDelta =
      Number(Boolean(right.student.is_favorite)) -
      Number(Boolean(left.student.is_favorite));
    if (favoriteDelta !== 0) return favoriteDelta;

    return compareByName(left, right);
  });

  return sortedInsights;
};

export const buildTrackingInsights = ({
  activityEvents,
  adminStatuses,
  assignments,
  notifications,
  now = new Date(),
  quizResults,
  studyGoals,
  studySessions,
  students,
  submissions,
  todayStart,
  weekStart,
  weeklyPlans,
}: BuildTrackingInsightsInput): TrackingInsight[] => {
  const submissionsByStudent = new Map<string, Set<string>>();
  for (const submission of submissions) {
    const set =
      submissionsByStudent.get(submission.student_id) ?? new Set<string>();
    set.add(submission.assignment_id);
    submissionsByStudent.set(submission.student_id, set);
  }

  const quizByStudent = new Map<string, AdminQuizResultRow[]>();
  for (const result of quizResults) {
    const rows = quizByStudent.get(result.user_id) ?? [];
    rows.push(result);
    quizByStudent.set(result.user_id, rows);
  }

  const sessionsByStudent = new Map<string, AdminStudySessionRow[]>();
  for (const session of studySessions) {
    const rows = sessionsByStudent.get(session.user_id) ?? [];
    rows.push(session);
    sessionsByStudent.set(session.user_id, rows);
  }

  const eventsByStudent = new Map<string, StudentActivityEvent[]>();
  for (const event of activityEvents) {
    const rows = eventsByStudent.get(event.user_id) ?? [];
    rows.push(event);
    eventsByStudent.set(event.user_id, rows);
  }

  const goalsByStudent = new Map(
    studyGoals.map((goal) => [goal.user_id, goal]),
  );
  const statusesByStudent = new Map(
    adminStatuses.map((status) => [status.student_id, status]),
  );
  const plansByStudent = new Map<string, StudentWeeklyPlan[]>();
  for (const plan of weeklyPlans) {
    const rows = plansByStudent.get(plan.student_id) ?? [];
    rows.push(plan);
    plansByStudent.set(plan.student_id, rows);
  }

  const unreadMessagesByStudent = new Map<string, number>();
  for (const notification of notifications) {
    if (notification.type !== 'message' || notification.is_read) continue;
    const parsed = parseSupportPayload(notification.message);
    if (!parsed?.sender_id) continue;
    unreadMessagesByStudent.set(
      parsed.sender_id,
      (unreadMessagesByStudent.get(parsed.sender_id) || 0) + 1,
    );
  }

  return students.map((student) => {
    const submittedAssignments =
      submissionsByStudent.get(student.id) ?? new Set<string>();
    const studentAssignments = assignments.filter((assignment) =>
      assignmentAppliesToStudent(assignment, student),
    );
    const overdueAssignments = studentAssignments.filter((assignment) => {
      if (!assignment.due_date || submittedAssignments.has(assignment.id)) {
        return false;
      }
      return new Date(assignment.due_date).getTime() < now.getTime();
    });

    const studentQuizResults = quizByStudent.get(student.id) ?? [];
    const latestQuiz = studentQuizResults[0] ?? null;
    const latestQuizPercent = getQuizPercent(latestQuiz);
    const studentSessions = sessionsByStudent.get(student.id) ?? [];
    const weeklyMinutes = studentSessions
      .filter((session) => new Date(session.date) >= weekStart)
      .reduce((sum, session) => sum + (session.duration || 0), 0);
    const targetMinutes =
      goalsByStudent.get(student.id)?.target_duration ?? 600;
    const weeklyProgress = Math.round(
      (weeklyMinutes / Math.max(targetMinutes, 1)) * 100,
    );

    const candidateDates = [
      ...studentSessions.map((session) => session.date),
      ...studentQuizResults.map((result) => result.completed_at),
      ...submissions
        .filter((submission) => submission.student_id === student.id)
        .map((submission) => submission.submitted_at || null),
      ...(eventsByStudent.get(student.id) ?? []).map(
        (event) => event.created_at,
      ),
    ].filter(Boolean) as string[];
    const lastActivityAt =
      candidateDates.sort(
        (left, right) => new Date(right).getTime() - new Date(left).getTime(),
      )[0] ||
      student.created_at ||
      null;
    const inactiveDays = getDaysSince(lastActivityAt, now);
    const status = statusesByStudent.get(student.id) ?? null;
    const studentPlans = plansByStudent.get(student.id) ?? [];
    const currentWeekPlan = studentPlans.find(
      (plan) => plan.week_start === weekStart.toISOString().slice(0, 10),
    );

    const riskReasons: string[] = [];
    if (inactiveDays >= 7) riskReasons.push('7+ gün pasif');
    if (overdueAssignments.length > 0) riskReasons.push('Gecikmiş ödev');
    if (latestQuizPercent !== null && latestQuizPercent < 60) {
      riskReasons.push('Düşük son test');
    }
    if (weeklyProgress < 40 && now.getDay() >= 4) {
      riskReasons.push('Haftalık hedef geride');
    }
    if ((unreadMessagesByStudent.get(student.id) || 0) > 0) {
      riskReasons.push('Okunmamış mesaj');
    }

    const riskLevel: 'high' | 'medium' | 'low' =
      status?.status === 'risk' || riskReasons.length >= 2
        ? 'high'
        : status?.status === 'watch' || riskReasons.length === 1
          ? 'medium'
          : 'low';
    const activityStatus =
      lastActivityAt && new Date(lastActivityAt) >= todayStart
        ? 'today'
        : inactiveDays <= 7
          ? 'week'
          : 'inactive';

    return {
      activityStatus,
      currentWeekPlan,
      inactiveDays,
      lastActivityAt,
      latestQuizPercent,
      overdueAssignments,
      riskLevel,
      riskReasons,
      status,
      student,
      targetMinutes,
      unreadMessages: unreadMessagesByStudent.get(student.id) || 0,
      weeklyMinutes,
      weeklyProgress,
    };
  });
};

export const buildTrackingDashboard = (insights: TrackingInsight[]) => {
  const activeToday = insights.filter(
    (insight) => insight.activityStatus === 'today',
  ).length;
  const inactive = insights.filter(
    (insight) => insight.inactiveDays >= 7,
  ).length;
  const highRisk = insights.filter(
    (insight) => insight.riskLevel === 'high',
  ).length;
  const unreadMessages = insights.reduce(
    (sum, insight) => sum + insight.unreadMessages,
    0,
  );

  return { activeToday, highRisk, inactive, unreadMessages };
};
