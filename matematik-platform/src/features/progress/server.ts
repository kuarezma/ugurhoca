import 'server-only';

import { getServerAccessToken, getServerAuthSkeleton } from '@/lib/auth-snapshot.server';
import { getVerifiedServerUser } from '@/lib/auth-verify.server';
import { toDisplayGrade } from '@/lib/grade';
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
    // Sorgu kimliği yalnızca doğrulanmış kullanıcıdan gelir; imzasız snapshot
    // çerezi doğrulama başarısızsa yalnız yükleme iskeleti için kullanılır.
    const [verifiedUser, skeleton, accessToken] = await Promise.all([
      getVerifiedServerUser(),
      getServerAuthSkeleton(),
      getServerAccessToken(),
    ]);

    if (!verifiedUser || !accessToken) {
      return {
        badges: [],
        goal: null,
        isHydrated: false,
        progressData: [],
        sessions: [],
        user: skeleton,
      };
    }

    const supabase = createServerSupabaseClient(accessToken);
    // Kimlik zaten doğrulandığı için profil sorgusu diğerlerini beklemez;
    // doğrulamanın eklediği gidiş-dönüş burada geri kazanılır.
    const [profileRes, sessionsRes, progressRes, goalRes, badgesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', verifiedUser.id)
        .single(),
      supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', verifiedUser.id)
        .order('date', { ascending: false }),
      supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', verifiedUser.id)
        .order('mastery_level', { ascending: false }),
      supabase.from('study_goals').select('*').eq('user_id', verifiedUser.id),
      supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', verifiedUser.id)
        .order('earned_at', { ascending: false }),
    ]);

    const profile = profileRes.data;
    const user: AppUser = profile
      ? {
          ...profile,
          grade: toDisplayGrade(profile.grade),
          email: verifiedUser.email,
          isAdmin: verifiedUser.isAdmin,
        }
      : {
          ...verifiedUser,
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
