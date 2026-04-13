import 'server-only';

import { getServerAccessToken, getServerAuthSnapshot } from '@/lib/auth-snapshot.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type {
  DashboardAssignment,
  DashboardDocument,
  DashboardNotification,
  DashboardQuizResult,
  DashboardQuizSummary,
  DashboardSubmission,
  StudentProfile,
} from '@/types/dashboard';
import type {
  InitialProfileDashboardData,
  ProfileProgressRow,
  ProfileStudySessionRow,
} from '@/features/profile/types';

export const loadInitialProfileDashboardData =
  async (): Promise<InitialProfileDashboardData> => {
    const [snapshot, accessToken] = await Promise.all([
      getServerAuthSnapshot(),
      getServerAccessToken(),
    ]);

    if (!snapshot) {
      return {
        assignments: [],
        availableQuizzes: [],
        isHydrated: false,
        notifications: [],
        progressRows: [],
        quizResults: [],
        sharedDocs: [],
        studySessions: [],
        submissions: [],
        user: null,
      };
    }

    if (!accessToken) {
      return {
        assignments: [],
        availableQuizzes: [],
        isHydrated: false,
        notifications: [],
        progressRows: [],
        quizResults: [],
        sharedDocs: [],
        studySessions: [],
        submissions: [],
        user: {
          ...snapshot,
        },
      };
    }

    const supabase = createServerSupabaseClient(accessToken);
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', snapshot.id)
      .single();

    const user: StudentProfile = profile
      ? {
          ...profile,
          email: snapshot.email,
          isAdmin: snapshot.isAdmin,
        }
      : {
          ...snapshot,
          current_streak: 0,
        };

    if (snapshot.isAdmin) {
      return {
        assignments: [],
        availableQuizzes: [],
        isHydrated: true,
        notifications: [],
        progressRows: [],
        quizResults: [],
        sharedDocs: [],
        studySessions: [],
        submissions: [],
        user,
      };
    }

    const gradeValue =
      typeof user.grade === 'number' || typeof user.grade === 'string'
        ? user.grade
        : 5;

    const gradeClause =
      typeof gradeValue === 'string'
        ? `grade.eq.${gradeValue},student_id.eq.${user.id}`
        : `grade.eq.${Number(gradeValue)},student_id.eq.${user.id}`;

    const numericGrade = Number(gradeValue);

    const assignmentsQuery = supabase
      .from('assignments')
      .select('*')
      .or(gradeClause)
      .order('created_at', { ascending: false });

    const availableQuizzesQuery = Number.isFinite(numericGrade)
      ? supabase
          .from('quizzes')
          .select('id, title, difficulty, grade, time_limit')
          .eq('is_active', true)
          .eq('grade', numericGrade)
          .order('created_at', { ascending: false })
      : supabase
          .from('quizzes')
          .select('id, title, difficulty, grade, time_limit')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

    const [
      notifRes,
      sharedDocsRes,
      assignmentsRes,
      submissionsRes,
      quizResultsRes,
      availableQuizzesRes,
      studySessionsRes,
      progressRes,
    ] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('shared_documents')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false }),
      assignmentsQuery,
      supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', user.id),
      supabase
        .from('quiz_results')
        .select('*, quizzes(title, difficulty, grade)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false }),
      availableQuizzesQuery,
      supabase
        .from('study_sessions')
        .select('id, duration, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30),
      supabase
        .from('user_progress')
        .select('id, topic, mastery_level')
        .eq('user_id', user.id)
        .order('mastery_level', { ascending: false }),
    ]);

    return {
      assignments: (assignmentsRes.data || []) as DashboardAssignment[],
      availableQuizzes:
        (availableQuizzesRes.data || []) as DashboardQuizSummary[],
      isHydrated: true,
      notifications: (notifRes.data || []) as DashboardNotification[],
      progressRows: (progressRes.data || []) as ProfileProgressRow[],
      quizResults: (quizResultsRes.data || []) as DashboardQuizResult[],
      sharedDocs: (sharedDocsRes.data || []) as DashboardDocument[],
      studySessions: (studySessionsRes.data || []) as ProfileStudySessionRow[],
      submissions: (submissionsRes.data || []) as DashboardSubmission[],
      user,
    };
  };
