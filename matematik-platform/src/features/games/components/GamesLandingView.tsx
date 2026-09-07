'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, Trophy, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useGameSoundMute } from '@/features/games/hooks/useGameSoundMute';
import type { AppUser } from '@/types';
import {
  FloatingParticles,
  GameCard,
  games,
} from '@/features/games/components/gameLibrary';
import { GamesLeaderboard } from '@/features/games/components/GamesLeaderboard';
import type { LeaderboardPeriod } from '@/features/games/queries';
import type { GameDefinition, LeaderboardRow } from '@/features/games/types';

type GamesLandingViewProps = {
  leaderboard: LeaderboardRow[];
  leaderboardPeriod: LeaderboardPeriod;
  onLeaderboardPeriodChange: (period: LeaderboardPeriod) => void;
  onSelectGame: (game: GameDefinition) => void;
  totalScore: number;
  user: AppUser;
};

export function GamesLandingView({
  leaderboard,
  leaderboardPeriod,
  onLeaderboardPeriodChange,
  onSelectGame,
  totalScore,
  user,
}: GamesLandingViewProps) {
  const profileHref = user.isAdmin ? '/admin' : '/profil';
  const { isMuted, toggleMute } = useGameSoundMute();

  return (
    <main className="oyunlar-page page-surface min-h-screen pb-20">
      <FloatingParticles />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-default bg-surface-1/90 backdrop-blur-xl py-3 sm:py-4 px-4 sm:px-6">
        <div className="container mx-auto flex justify-between items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-700 dark:from-purple-300 dark:via-fuchsia-300 dark:to-pink-300 bg-clip-text text-transparent truncate">
              Uğur Hoca Matematik
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-default bg-surface-2 hover:bg-overlay-2 text-primary transition-colors text-xs"
              aria-label={isMuted ? 'Oyun sesini aç' : 'Oyun sesini kapat'}
              title={isMuted ? 'Ses Kapalı (Açmak için tıkla)' : 'Ses Açık (Kapatmak için tıkla)'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-accent-danger-ink shrink-0" />
                  <span className="hidden sm:inline text-accent-danger-ink font-semibold">Sessiz</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-accent-success-ink shrink-0" />
                  <span className="hidden sm:inline text-accent-success-ink font-semibold">Ses Açık</span>
                </>
              )}
            </button>

            <Link
              href={profileHref}
              className="text-secondary hover:text-primary flex items-center gap-1.5 text-xs sm:text-base shrink-0 font-medium"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{user.isAdmin ? 'Admin Panel' : 'Profil'}</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-20 sm:pt-24 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold text-primary mb-2">
              Eğlenceli Oyunlar
            </h1>
            <p className="text-secondary">Oyna, eğlen ve matematik öğren!</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GameCard game={game} onClick={() => onSelectGame(game)} />
              </motion.div>
            ))}
          </div>

          <GamesLeaderboard
            leaderboard={leaderboard}
            period={leaderboardPeriod}
            onPeriodChange={onLeaderboardPeriodChange}
          />

          {totalScore > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 rounded-3xl p-8 text-center max-w-sm mx-auto border border-default bg-surface-1 shadow-sm"
            >
              <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-500" />
              <h3 className="text-lg font-bold text-secondary mb-1">
                Oturum Puanın
              </h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                {totalScore}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
