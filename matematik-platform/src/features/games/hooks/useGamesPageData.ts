'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AppUser } from '@/types';
import type {
  GameAlias,
  GameDefinition,
  LeaderboardRow,
} from '@/features/games/types';
import {
  insertGameScore,
  loadGameAlias,
  loadGamesLeaderboard,
  loadGamesPageUser,
  saveGameAlias,
  type LeaderboardPeriod,
} from '@/features/games/queries';

type RouterLike = {
  push: (href: string) => void;
};

export const useGamesPageData = (router: RouterLike) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] =
    useState<LeaderboardPeriod>('all');
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameAlias, setGameAlias] = useState<GameAlias | null>(null);
  const [aliasSaving, setAliasSaving] = useState(false);
  const [aliasError, setAliasError] = useState<string | null>(null);

  const refreshLeaderboard = useCallback(
    async (period: LeaderboardPeriod = leaderboardPeriod) => {
      const nextLeaderboard = await loadGamesLeaderboard(period);
      setLeaderboard(nextLeaderboard);
    },
    [leaderboardPeriod],
  );

  useEffect(() => {
    if (user) {
      void refreshLeaderboard(leaderboardPeriod);
    }
  }, [leaderboardPeriod, refreshLeaderboard, user]);

  useEffect(() => {
    const loadUser = async () => {
      const nextUser = await loadGamesPageUser(router);
      setUser(nextUser);
      if (nextUser) {
        setGameAlias(await loadGameAlias(nextUser.id));
      }
      setLoading(false);
    };

    void loadUser();
  }, [router]);

  const submitAlias = useCallback(
    async (alias: string) => {
      setAliasSaving(true);
      setAliasError(null);
      try {
        const nextAlias = await saveGameAlias(alias);
        setGameAlias(nextAlias);
        await refreshLeaderboard();
        return true;
      } catch (error) {
        setAliasError(
          error instanceof Error
            ? error.message
            : 'Rumuz kaydedilemedi.',
        );
        return false;
      } finally {
        setAliasSaving(false);
      }
    },
    [refreshLeaderboard],
  );

  const recordScore = useCallback(
    async (score: number, game: GameDefinition | null) => {
      setTotalScore((currentScore) => currentScore + score);

      if (score <= 0 || !user || !game || !gameAlias) {
        return;
      }

      const isSaved = await insertGameScore({
        gameId: game.id,
        score,
        user,
      });

      if (isSaved) {
        await refreshLeaderboard();
      }
    },
    [gameAlias, refreshLeaderboard, user],
  );

  return {
    aliasError,
    aliasSaving,
    gameAlias,
    leaderboard,
    leaderboardPeriod,
    loading,
    recordScore,
    submitAlias,
    setLeaderboardPeriod,
    totalScore,
    user,
  };
};
