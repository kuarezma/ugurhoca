import 'server-only';

import {
  getServerAccessToken,
  getServerAuthSnapshot,
} from '@/lib/auth-snapshot.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AppUser } from '@/types';
import type {
  ProgressRow,
  StudyGoal,
  StudySession,
  UserBadge,
} from '@/features/progress/types';
import { resolveCurrentGoal } from '@/features/progress/utils';

export type InitialProgressPageData = {
  badges: UserBadge[];
  goal: StudyGoal | null;
  isHydrated: boolean;
  progressData: ProgressRow[];
  sessions: StudySession[];
  user: AppUser | null;
};

export const loadInitialProgressPageData =
  async (): Promise<InitialProgressPageData> => {
    const [snapshot, accessToken] = await Promise.all([
      getServerAuthSnapshot(),
      getServerAccessToken(),
    ]);

    if (!snapshot) {
      return {
        badges: [],
        goal: null,
        isHydrated: false,
        progressData: [],
        sessions: [],
        user: null,
      };
    }

    if (!accessToken) {
      return {
        badges: [],
        goal: null,
        isHydrated: false,
        progressData: [],
        sessions: [],
        user: {
          ...snapshot,
        },
      };
    }

    const supabase = createServerSupabaseClient(accessToken);
    const {
      data: { user: verifiedUser },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    // Snapshot tek başına kimlik kanıtı değildir; aynı token kullanıcısını koru.
    if (authError || !verifiedUser || verifiedUser.id !== snapshot.id) {
      return {
        badges: [],
        goal: null,
        isHydrated: false,
        progressData: [],
        sessions: [],
        user: null,
      };
    }

    const [profileRes, sessionsRes, progressRes, goalRes, badgesRes] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', snapshot.id).single(),
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', snapshot.id)
          .order('date', { ascending: false }),
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', snapshot.id)
          .order('mastery_level', { ascending: false }),
        supabase.from('study_goals').select('*').eq('user_id', snapshot.id),
        supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', snapshot.id)
          .order('earned_at', { ascending: false }),
      ]);

    const profile = profileRes.data;
    const user: AppUser = profile
      ? {
          ...profile,
          email: snapshot.email,
          isAdmin: snapshot.isAdmin,
        }
      : {
          ...snapshot,
          current_streak: 0,
        };

    return {
      badges: (badgesRes.data || []) as UserBadge[],
      goal: resolveCurrentGoal((goalRes.data || []) as StudyGoal[]),
      isHydrated: true,
      progressData: (progressRes.data || []) as ProgressRow[],
      sessions: (sessionsRes.data || []) as StudySession[],
      user,
    };
  };
