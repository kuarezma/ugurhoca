import { getCurrentUserProfile } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/error-utils';
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

const GAME_ALIAS_STORAGE_PREFIX = 'ugur-hoca-game-alias:';
let useLegacyAliasFallback = false;

const getStoredAlias = (userId: string): GameAlias | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawAlias = window.localStorage
    .getItem(`${GAME_ALIAS_STORAGE_PREFIX}${userId}`)
    ?.trim();

  if (!rawAlias) {
    return null;
  }

  return {
    alias: rawAlias,
    alias_normalized: normalizeAlias(rawAlias),
    user_id: userId,
  };
};

const storeAlias = (alias: GameAlias) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    `${GAME_ALIAS_STORAGE_PREFIX}${alias.user_id}`,
    alias.alias,
  );
};

const normalizeAlias = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9çğıöşü]/gi, '');

const buildClientAlias = (userId: string, alias: string): GameAlias => ({
  alias: alias.trim(),
  alias_normalized: normalizeAlias(alias),
  user_id: userId,
});

export const loadGamesLeaderboard = async (
  period: LeaderboardPeriod = 'all',
): Promise<LeaderboardRow[]> => {
  const { data, error } = await supabase.rpc('get_game_leaderboard', {
    p_period: period,
  });

  if (error) {
    if (isMissingSchemaError(error)) {
      useLegacyAliasFallback = true;
      const { data: legacyData, error: legacyError } = await supabase
        .from('global_leaderboard')
        .select('*');

      if (legacyError) {
        return [];
      }

      return ((legacyData || []) as Array<{
        alias?: string | null;
        total_score?: number | null;
        user_name?: string | null;
      }>)
        .map((row, index) => ({
          alias: row.alias || row.user_name || '',
          rank: index + 1,
          total_score: row.total_score || 0,
        }))
        .filter((row) => row.alias.trim().length > 0);
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
      useLegacyAliasFallback = true;
      return getStoredAlias(userId);
    }
    throw error;
  }

  return (data || null) as GameAlias | null;
};

export const saveGameAlias = async (alias: string) => {
  const trimmedAlias = alias.trim();
  const { data, error } = await supabase.rpc('set_game_alias', {
    p_alias: trimmedAlias,
  });

  if (error) {
    if (isMissingSchemaError(error)) {
      useLegacyAliasFallback = true;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        throw new Error('Oturum açmanız gerekiyor.');
      }

      if (trimmedAlias.length < 3 || trimmedAlias.length > 16) {
        throw new Error('Rumuz 3-16 karakter olmalıdır.');
      }

      if (/(@|https?:\/\/|www\.|[0-9]{7,})/i.test(trimmedAlias)) {
        throw new Error('Rumuz e-posta, link veya telefon içermemelidir.');
      }

      if (!/^[A-Za-zÇĞİÖŞÜçğıöşü0-9 _.-]+$/.test(trimmedAlias)) {
        throw new Error(
          'Rumuz yalnızca harf, rakam, boşluk, nokta, tire ve alt çizgi içerebilir.',
        );
      }

      const fallbackAlias = buildClientAlias(user.id, trimmedAlias);
      storeAlias(fallbackAlias);
      return fallbackAlias;
    }

    throw error;
  }

  const nextAlias = data as GameAlias;
  storeAlias(nextAlias);
  return nextAlias;
};

export const insertGameScore = async (payload: {
  gameId: number;
  score: number;
  user: Pick<AppUser, 'id'>;
}) => {
  const fallbackAlias =
    useLegacyAliasFallback && typeof window !== 'undefined'
      ? getStoredAlias(payload.user.id)?.alias || null
      : null;
  const { error } = await supabase.from('game_scores').insert([
    {
      game_id: payload.gameId,
      score: payload.score,
      user_id: payload.user.id,
      user_name: fallbackAlias,
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

export const getGameAliasErrorMessage = (error: unknown) =>
  getErrorMessage(error, 'Rumuz kaydedilemedi.');
