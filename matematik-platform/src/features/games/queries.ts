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

export type LeaderboardPeriod = 'all' | 'week' | 'month';

const getCutoffISO = (period: LeaderboardPeriod): string | null => {
  if (period === 'all') {
    return null;
  }
  const days = period === 'week' ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff.toISOString();
};

export const loadGamesLeaderboard = async (
  period: LeaderboardPeriod = 'all',
): Promise<LeaderboardRow[]> => {
  if (period === 'all') {
    const { data, error } = await supabase
      .from('global_leaderboard')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return (data || []) as LeaderboardRow[];
  }

  const cutoff = getCutoffISO(period);
  if (!cutoff) {
    return [];
  }

  const { data, error } = await supabase
    .from('game_scores')
    .select('user_id, user_name, score, created_at')
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    throw error;
  }

  const totals = new Map<
    string,
    { id: string; total_score: number; user_name: string }
  >();

  for (const row of data ?? []) {
    const row_ = row as {
      user_id: string | null;
      user_name: string | null;
      score: number | null;
    };
    if (!row_.user_id) {
      continue;
    }
    const existing = totals.get(row_.user_id);
    const score = Number(row_.score || 0);
    if (existing) {
      existing.total_score += score;
    } else {
      totals.set(row_.user_id, {
        id: row_.user_id,
        total_score: score,
        user_name: row_.user_name ?? 'Anonim',
      });
    }
  }

  return Array.from(totals.values())
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 10);
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
