import 'server-only';

import { getServerAccessToken, getServerAuthSnapshot } from '@/lib/auth-snapshot.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AppUser } from '@/types';
import type { Quiz } from '@/types/quiz';

type InitialTestsPageData = {
  initialQuizzes: Quiz[];
  initialUser: AppUser | null;
  isHydrated: boolean;
};

export const loadInitialTestsPageData = async (): Promise<InitialTestsPageData> => {
  const [snapshot, accessToken] = await Promise.all([
    getServerAuthSnapshot(),
    getServerAccessToken(),
  ]);

  if (!snapshot) {
    return {
      initialQuizzes: [],
      initialUser: null,
      isHydrated: false,
    };
  }

  const initialUser: AppUser = {
    ...snapshot,
  };

  if (!accessToken) {
    return {
      initialQuizzes: [],
      initialUser,
      isHydrated: false,
    };
  }

  const supabase = createServerSupabaseClient(accessToken);
  let query = supabase
    .from('quizzes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (!snapshot.isAdmin && typeof snapshot.grade === 'number') {
    query = query.eq('grade', snapshot.grade);
  }

  const { data } = await query;

  return {
    initialQuizzes: (data || []) as Quiz[],
    initialUser,
    isHydrated: true,
  };
};
