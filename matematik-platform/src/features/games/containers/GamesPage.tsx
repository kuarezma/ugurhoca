'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2 } from 'lucide-react';
import { GamesLandingView } from '@/features/games/components/GamesLandingView';
import { SelectedGameView } from '@/features/games/components/SelectedGameView';
import { useGamesPageData } from '@/features/games/hooks/useGamesPageData';
import type { GameDefinition } from '@/features/games/types';
import { Skeleton } from '@/components/ui/Skeleton';

const GAME_SCORE_MULTIPLIER = 10;

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<GameDefinition | null>(null);
  const router = useRouter();
  const {
    leaderboard,
    leaderboardPeriod,
    loading,
    recordScore,
    setLeaderboardPeriod,
    totalScore,
    user,
  } = useGamesPageData(router);

  const handleScore = useCallback(
    async (score: number) => {
      await recordScore(score, selectedGame);
    },
    [recordScore, selectedGame],
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8 flex items-center gap-3" aria-hidden="true">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/20 text-brand-primary-soft">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-60" />
              <Skeleton className="h-4 w-80" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" rounded="lg" />
            ))}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            Oyunlar yükleniyor
          </p>
        </div>
      </div>
    );
  }

  if (selectedGame) {
    return (
      <SelectedGameView
        game={selectedGame}
        onBack={() => setSelectedGame(null)}
        onScore={handleScore}
        scoreMultiplier={GAME_SCORE_MULTIPLIER}
        totalScore={totalScore}
      />
    );
  }

  return (
    <GamesLandingView
      leaderboard={leaderboard}
      leaderboardPeriod={leaderboardPeriod}
      onLeaderboardPeriodChange={setLeaderboardPeriod}
      onSelectGame={setSelectedGame}
      totalScore={totalScore}
      user={user}
    />
  );
}
