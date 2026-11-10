import { ADMIN_EMAIL, isAdminEmail } from '@/lib/admin';
import { getClientSession } from '@/lib/auth-client';
import { toDisplayGrade } from '@/lib/grade';
import { supabase } from '@/lib/supabase/client';
import { LIVE_LESSON_CLIENT_COLUMNS } from '@/features/live-lessons/lib/lesson-access';
import type {
  AdminDashboardData,
  AdminQuizResultRow,
  AdminStudyGoalRow,
  AdminSubmission,
  AdminUser,
  AnnualPlanItem,
  StudentAdminStatus,
  StudentWeeklyPlan,
  WorksheetCandidate,
} from '@/features/admin/types';
import {
  ADMIN_QUERY_LIMIT,
  ADMIN_USERS_QUERY_LIMIT,
  type ResolveAdminAuthResult,
} from './shared';

export const resolveAdminAuth = async (): Promise<ResolveAdminAuthResult> => {
  const session = await getClientSession();

  if (!session?.user) {
    return { status: 'unauthenticated' };
  }

  if (!isAdminEmail(session.user.email)) {
    return { status: 'unauthorized' };
  }

  return {
    session,
    status: 'ok',
    user: {
      email: session.user.email ?? ADMIN_EMAIL,
      grade: 5,
      id: session.user.id,
      isAdmin: true,
      name: 'Uğur Hoca',
    },
  };
};

export const loadAdminDashboardData = async (
  adminUserId?: string | null,
): Promise<AdminDashboardData> => {
  const [
    announcementsRes,
    documentsRes,
    allUsersRes,
    assignmentsRes,
    sharedDocsRes,
    quizzesRes,
    notificationsRes,
    submissionsRes,
    quizResultsRes,
    studyGoalsRes,
    adminStatusesRes,
    weeklyPlansRes,
    annualPlanItemsRes,
    worksheetCandidatesRes,
    liveLessonsRes,
  ] = await Promise.all([
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(ADMIN_QUERY_LIMIT),
    supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(ADMIN_QUERY_LIMIT),
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(ADMIN_USERS_QUERY_LIMIT),
    supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(ADMIN_QUERY_LIMIT),
    supabase
      .from('shared_documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(ADMIN_QUERY_LIMIT),
    supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(ADMIN_QUERY_LIMIT),
    adminUserId
      ? supabase
          .from('notifications')
          .select('*')
          .eq('user_id', adminUserId)
          .order('created_at', { ascending: false })
          .limit(ADMIN_QUERY_LIMIT)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from('assignment_submissions')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(ADMIN_QUERY_LIMIT),
    supabase
      .from('quiz_results')
      .select(
        'id, user_id, quiz_id, score, total_questions, completed_at, quizzes(title, difficulty, grade)',
      )
      .order('completed_at', { ascending: false })
      .limit(ADMIN_QUERY_LIMIT),
    supabase
      .from('study_goals')
      .select('user_id, target_duration, week_start')
      .limit(ADMIN_USERS_QUERY_LIMIT),
    supabase
      .from('student_admin_statuses')
      .select('*')
      .limit(ADMIN_USERS_QUERY_LIMIT),
    supabase
      .from('student_weekly_plans')
      .select('*, student_weekly_plan_items(*)')
      .order('week_start', { ascending: false })
      .limit(ADMIN_QUERY_LIMIT),
    supabase
      .from('annual_plan_items')
      .select('*')
      .order('grade', { ascending: true })
      .order('week_start', { ascending: true })
      .limit(ADMIN_QUERY_LIMIT),
    supabase
      .from('worksheet_candidates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(ADMIN_QUERY_LIMIT),
    supabase
      .from('live_lessons')
      .select(LIVE_LESSON_CLIENT_COLUMNS)
      .order('starts_at', { ascending: false })
      .limit(100),
  ]);

  return {
    adminStatuses: (adminStatusesRes.data || []) as StudentAdminStatus[],
    allUsers: ((allUsersRes.data || []) as AdminUser[]).map((user) => ({
      ...user,
      grade: toDisplayGrade(user.grade),
    })),
    announcements: (
      (announcementsRes.data || []) as AdminDashboardData['announcements']
    ).sort(
      (left, right) =>
        new Date(right.created_at || 0).getTime() -
        new Date(left.created_at || 0).getTime(),
    ),
    annualPlanItems: (annualPlanItemsRes.data || []) as AnnualPlanItem[],
    assignments: (assignmentsRes.data ||
      []) as AdminDashboardData['assignments'],
    documents: (documentsRes.data || []) as AdminDashboardData['documents'],
    liveLessons: {
      lessons: liveLessonsRes.data || [],
    },
    notifications: (notificationsRes.data ||
      []) as AdminDashboardData['notifications'],
    quizResults: (quizResultsRes.data || []) as AdminQuizResultRow[],
    quizzes: (quizzesRes.data || []) as AdminDashboardData['quizzes'],
    sharedDocs: (sharedDocsRes.data || []) as AdminDashboardData['sharedDocs'],
    studyGoals: (studyGoalsRes.data || []) as AdminStudyGoalRow[],
    submissions: (submissionsRes.data || []) as AdminSubmission[],
    weeklyPlans: (weeklyPlansRes.data || []) as StudentWeeklyPlan[],
    worksheetCandidates: (worksheetCandidatesRes.data ||
      []) as WorksheetCandidate[],
  };
};
