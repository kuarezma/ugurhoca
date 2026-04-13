'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GamesLandingView } from '@/features/games/components/GamesLandingView';
import { SelectedGameView } from '@/features/games/components/SelectedGameView';
import { useGamesPageData } from '@/features/games/hooks/useGamesPageData';
import type { GameDefinition } from '@/features/games/types';

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<GameDefinition | null>(null);
  const router = useRouter();
  const { leaderboard, loading, recordScore, totalScore, user } =
    useGamesPageData(router);

  const handleScore = useCallback(
    async (score: number) => {
      await recordScore(score, selectedGame);
    },
    [recordScore, selectedGame],
  );

  if (loading || !user) {
    return null;
  }

  if (selectedGame) {
    return (
      <SelectedGameView
        game={selectedGame}
        onBack={() => setSelectedGame(null)}
        onScore={handleScore}
        totalScore={totalScore}
      />
    );
  }

  return (
    <GamesLandingView
      leaderboard={leaderboard}
      onSelectGame={setSelectedGame}
      totalScore={totalScore}
      user={user}
    />
  );
}
