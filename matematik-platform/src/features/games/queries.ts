import { getCurrentUserProfile } from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';
import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import type { AppUser } from '@/types';
import type { GameAlias, LeaderboardRow } from '@/features/games/types';

export const loadGamesPageUser = async (router: {
  push: (href: string) => void;
}) => {
  const result = await getCurrentUserProfile<AppUser>({ router });
  return result?.profile ?? null;
};

export type LeaderboardPeriod = 'all' | 'week' | 'month';

const isMissingSchemaError = (error: { code?: string } | null) =>
  error?.code === 'PGRST202' || error?.code === 'PGRST205';

export const loadGamesLeaderboard = async (
  period: LeaderboardPeriod = 'all',
): Promise<LeaderboardRow[]> => {
  const { data, error } = await supabase.rpc('get_game_leaderboard', {
    p_period: period,
  });

  if (error) {
    if (isMissingSchemaError(error)) {
      return [];
    }
    throw error;
  }

  return (data || []) as LeaderboardRow[];
};

export const loadGameAlias = async (userId: string) => {
  const { data, error } = await supabase
    .from('game_aliases')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      return null;
    }
    throw error;
  }

  return (data || null) as GameAlias | null;
};

export const saveGameAlias = async (alias: string) => {
  const { data, error } = await supabase.rpc('set_game_alias', {
    p_alias: alias,
  });

  if (error) {
    throw error;
  }

  return data as GameAlias;
};

export const insertGameScore = async (payload: {
  gameId: number;
  score: number;
  user: Pick<AppUser, 'id'>;
}) => {
  const { error } = await supabase.from('game_scores').insert([
    {
      game_id: payload.gameId,
      score: payload.score,
      user_id: payload.user.id,
      user_name: null,
    },
  ]);

  if (!error) {
    void trackStudentActivityEvent({
      entityId: String(payload.gameId),
      entityType: 'game',
      eventType: 'game_score_saved',
      metadata: {
        score: payload.score,
      },
      userId: payload.user.id,
    });
  }

  return !error;
};
