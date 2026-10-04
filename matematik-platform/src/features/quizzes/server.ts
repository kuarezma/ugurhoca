import 'server-only';

import { getServerAccessToken, getServerAuthSkeleton } from '@/lib/auth-snapshot.server';
import { getVerifiedServerUser } from '@/lib/auth-verify.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AppUser } from '@/types';
import type { Quiz } from '@/types/quiz';

type InitialTestsPageData = {
  initialQuizzes: Quiz[];
  initialUser: AppUser | null;
  isHydrated: boolean;
};

export const loadInitialTestsPageData = async (): Promise<InitialTestsPageData> => {
  // Sınıf filtresi ve admin bayrağı yalnızca doğrulanmış kullanıcıdan gelir;
  // imzasız snapshot çerezi doğrulama başarısızsa yalnız yükleme iskeleti.
  const [verifiedUser, skeleton, accessToken] = await Promise.all([
    getVerifiedServerUser(),
    getServerAuthSkeleton(),
    getServerAccessToken(),
  ]);

  if (!verifiedUser || !accessToken) {
    return {
      initialQuizzes: [],
      initialUser: skeleton,
      isHydrated: false,
    };
  }

  const initialUser: AppUser = {
    ...verifiedUser,
  };

  const supabase = createServerSupabaseClient(accessToken);
  let query = supabase
    .from('quizzes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (!verifiedUser.isAdmin && typeof verifiedUser.grade === 'number') {
    query = query.eq('grade', verifiedUser.grade);
  }

  const { data } = await query;

  return {
    initialQuizzes: (data || []) as Quiz[],
    initialUser,
    isHydrated: true,
  };
};
