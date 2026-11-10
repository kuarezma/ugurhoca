import { normalizeProgressTopics } from '@/features/progress/constants';
import { isGraduateGrade, toDisplayGrade, toStoredGrade } from '@/lib/grade';
import { supabase } from '@/lib/supabase/client';
import { normalizeDashboardBadges } from '@/features/profile/utils/dashboard-view-model';
import { resolveCurrentGoal } from '@/features/progress/utils';
import type {
  AdminStudentProfileData,
  AdminUser,
  StudentAdminNote,
  StudentAdminStatus,
  StudentWeeklyPlan,
} from '@/features/admin/types';
import { ADMIN_USERS_QUERY_LIMIT } from './shared';

export const refreshAdminUsers = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(ADMIN_USERS_QUERY_LIMIT);

  return (data || []) as AdminUser[];
};

export const loadAdminStudentProfile = async (
  studentId: string,
): Promise<AdminStudentProfileData | null> => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    return null;
  }

  const student = {
    avatar_id: profile.avatar_id ?? null,
    created_at: profile.created_at ?? null,
    current_streak: profile.current_streak ?? 0,
    email: profile.email || '',
    grade: toDisplayGrade(profile.grade),
    id: profile.id,
    isAdmin: false,
    name: profile.name || 'Öğrenci',
  };

  const gradeValue =
    typeof student.grade === 'number' || typeof student.grade === 'string'
      ? student.grade
      : 5;

  const gradeClause = `grade.eq.${toStoredGrade(gradeValue)},student_id.eq.${student.id}`;

  const [
    studySessionsRes,
    progressRes,
    goalRes,
    quizResultsRes,
    assignmentsRes,
    submissionsRes,
    badgesRes,
    adminStatusRes,
    adminNotesRes,
    weeklyPlansRes,
  ] = await Promise.all([
    supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', student.id)
      .order('date', { ascending: false })
      .limit(30),
    supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', student.id)
      .order('mastery_level', { ascending: false }),
    supabase
      .from('study_goals')
      .select('target_duration, week_start')
      .eq('user_id', student.id),
    supabase
      .from('quiz_results')
      .select(
        'id, score, total_questions, completed_at, quizzes(title, difficulty, grade)',
      )
      .eq('user_id', student.id)
      .order('completed_at', { ascending: false }),
    supabase
      .from('assignments')
      .select('*')
      .or(gradeClause)
      .order('created_at', { ascending: false }),
    supabase
      .from('assignment_submissions')
      .select('*')
      .eq('student_id', student.id)
      .order('submitted_at', { ascending: false }),
    supabase
      .from('user_badges')
      .select('id, badge_name, icon_name, earned_at')
      .eq('user_id', student.id)
      .order('earned_at', { ascending: false })
      .limit(6),
    supabase
      .from('student_admin_statuses')
      .select('*')
      .eq('student_id', student.id)
      .maybeSingle(),
    supabase
      .from('student_admin_notes')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('student_weekly_plans')
      .select('*, student_weekly_plan_items(*)')
      .eq('student_id', student.id)
      .order('week_start', { ascending: false })
      .limit(8),
  ]);

  return {
    adminNotes: (adminNotesRes.data || []) as StudentAdminNote[],
    adminStatus: (adminStatusRes.data || null) as StudentAdminStatus | null,
    assignments: (assignmentsRes.data ||
      []) as AdminStudentProfileData['assignments'],
    badges: normalizeDashboardBadges(badgesRes.data || []),
    goal: resolveCurrentGoal(goalRes.data || []),
    progressRows: normalizeProgressTopics(
      (progressRes.data || []) as AdminStudentProfileData['progressRows'],
      student.grade,
    ),
    quizResults: (quizResultsRes.data ||
      []) as AdminStudentProfileData['quizResults'],
    student,
    studySessions: (studySessionsRes.data ||
      []) as AdminStudentProfileData['studySessions'],
    submissions: (submissionsRes.data ||
      []) as AdminStudentProfileData['submissions'],
    weeklyPlans: (weeklyPlansRes.data || []) as StudentWeeklyPlan[],
  };
};

const getNextAdminGrade = (grade: AdminUser['grade']): AdminUser['grade'] => {
  if (isGraduateGrade(grade)) {
    return 'Mezun';
  }

  const numericGrade = toStoredGrade(grade);
  return numericGrade >= 12 ? 12 : numericGrade + 1;
};

export const advanceAdminUserGrades = async (users: AdminUser[]) => {
  let updated = 0;

  for (const user of users) {
    if (
      user.isAdmin ||
      isGraduateGrade(user.grade) ||
      getNextAdminGrade(user.grade) === user.grade
    ) {
      continue;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ grade: getNextAdminGrade(user.grade) })
      .eq('id', user.id);

    if (!error) {
      updated++;
    }
  }

  return updated;
};

export const updateAdminUser = async (
  userId: string,
  updates: {
    grade?: AdminUser['grade'] | null;
    is_favorite?: boolean | null;
    name?: string | null;
  },
) => {
  const payload =
    updates.grade == null
      ? updates
      : { ...updates, grade: toStoredGrade(updates.grade) };
  return supabase.from('profiles').update(payload).eq('id', userId);
};
