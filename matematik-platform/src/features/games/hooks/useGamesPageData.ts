'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AppUser } from '@/types';
import type { GameDefinition, LeaderboardRow } from '@/features/games/types';
import {
  insertGameScore,
  loadGamesLeaderboard,
  loadGamesPageUser,
} from '@/features/games/queries';

type RouterLike = {
  push: (href: string) => void;
};

export const useGamesPageData = (router: RouterLike) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshLeaderboard = useCallback(async () => {
    const nextLeaderboard = await loadGamesLeaderboard();
    setLeaderboard(nextLeaderboard);
  }, []);

  useEffect(() => {
    void refreshLeaderboard();
  }, [refreshLeaderboard]);

  useEffect(() => {
    const loadUser = async () => {
      const nextUser = await loadGamesPageUser(router);
      setUser(nextUser);
      setLoading(false);
    };

    void loadUser();
  }, [router]);

  const recordScore = useCallback(
    async (score: number, game: GameDefinition | null) => {
      setTotalScore((currentScore) => currentScore + score);

      if (score <= 0 || !user || !game) {
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
    [refreshLeaderboard, user],
  );

  return {
    leaderboard,
    loading,
    recordScore,
    totalScore,
    user,
  };
};
