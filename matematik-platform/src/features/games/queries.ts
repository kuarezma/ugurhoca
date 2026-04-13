import { getCurrentUserProfile } from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';
import type { AppUser } from '@/types';
import type { LeaderboardRow } from '@/features/games/types';

export const loadGamesPageUser = async (router: {
  push: (href: string) => void;
}) => {
  const result = await getCurrentUserProfile<AppUser>({ router });
  return result?.profile ?? null;
};

export const loadGamesLeaderboard = async () => {
  const { data, error } = await supabase
    .from('global_leaderboard')
    .select('*')
    .order('total_score', { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  return (data || []) as LeaderboardRow[];
};

export const insertGameScore = async (payload: {
  gameId: number;
  score: number;
  user: Pick<AppUser, 'id' | 'name'>;
}) => {
  const { error } = await supabase.from('game_scores').insert([
    {
      game_id: payload.gameId,
      score: payload.score,
      user_id: payload.user.id,
      user_name: payload.user.name,
    },
  ]);

  return !error;
};
