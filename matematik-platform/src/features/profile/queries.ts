import type { Session } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/admin';
import { supabase } from '@/lib/supabase/client';
import { resolveCurrentGoal } from '@/features/progress/utils';
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
  ProfileDashboardData,
  ProfileProgressRow,
  ProfileStudySessionRow,
} from '@/features/profile/types';
import {
  normalizeDashboardBadges,
  type DashboardBadgeRow,
} from '@/features/profile/utils/dashboard-view-model';
import {
  buildProfileAvatarPath,
  compressProfileAvatar,
  PROFILE_AVATAR_BUCKET,
} from '@/features/profile/utils/avatar-upload';

export const resolveClientProfileUser = async (
  session: Session,
): Promise<StudentProfile> => {
  const isAdmin = isAdminEmail(session.user.email);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profile) {
    return {
      ...profile,
      email: session.user.email || '',
      isAdmin,
    };
  }

  return {
    id: session.user.id,
    name: session.user.user_metadata?.name || 'Öğrenci',
    email: session.user.email || '',
    grade: session.user.user_metadata?.grade ?? 5,
    isAdmin,
    current_streak: 0,
  };
};

export const loadClientProfileDashboardCollections = async (
  user: StudentProfile,
): Promise<Omit<ProfileDashboardData, 'isHydrated' | 'user'>> => {
  if (user.isAdmin) {
    return {
      assignments: [],
      availableQuizzes: [],
      badges: [],
      goal: null,
      notifications: [],
      progressRows: [],
      quizResults: [],
      sharedDocs: [],
      studySessions: [],
      submissions: [],
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
    goalRes,
    badgesRes,
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
    supabase
      .from('study_goals')
      .select('target_duration, week_start')
      .eq('user_id', user.id),
    supabase
      .from('user_badges')
      .select('id, badge_name, icon_name, earned_at')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(6),
  ]);

  return {
    assignments: (assignmentsRes.data || []) as DashboardAssignment[],
    availableQuizzes: (availableQuizzesRes.data ||
      []) as DashboardQuizSummary[],
    badges: normalizeDashboardBadges(
      (badgesRes.data || []) as DashboardBadgeRow[],
    ),
    goal: resolveCurrentGoal(goalRes.data || []),
    notifications: (notifRes.data || []) as DashboardNotification[],
    progressRows: (progressRes.data || []) as ProfileProgressRow[],
    quizResults: (quizResultsRes.data || []) as DashboardQuizResult[],
    sharedDocs: (sharedDocsRes.data || []) as DashboardDocument[],
    studySessions: (studySessionsRes.data || []) as ProfileStudySessionRow[],
    submissions: (submissionsRes.data || []) as DashboardSubmission[],
  };
};

export const markProfileNotificationAsRead = async (id: string) => {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
};

export const markProfileNotificationsAsRead = async (ids: string[]) => {
  if (ids.length === 0) {
    return;
  }

  await supabase.from('notifications').update({ is_read: true }).in('id', ids);
};

export const updateProfileAvatar = async (userId: string, avatarId: string) => {
  await supabase
    .from('profiles')
    .update({ avatar_id: avatarId })
    .eq('id', userId);
};

export const uploadProfileAvatar = async (userId: string, file: File) => {
  const compressedAvatar = await compressProfileAvatar(file);
  const avatarPath = buildProfileAvatarPath(userId);
  const { error: uploadError } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(avatarPath, compressedAvatar, {
      cacheControl: '3600',
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(avatarPath);

  await updateProfileAvatar(userId, publicUrl);

  return publicUrl;
};
