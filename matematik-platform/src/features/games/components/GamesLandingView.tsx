'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, Trophy } from 'lucide-react';
import Link from 'next/link';
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

  return (
    <main className="oyunlar-page min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pb-20">
      <FloatingParticles />

      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Uğur Hoca Matematik
            </span>
          </Link>

          <Link
            href={profileHref}
            className="text-slate-300 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {user.isAdmin ? 'Admin Panel' : 'Profil'}
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Eğlenceli Oyunlar
            </h1>
            <p className="text-slate-400">Oyna, eğlen ve matematik öğren!</p>
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
              className="mt-8 glass rounded-3xl p-8 text-center max-w-sm mx-auto border border-white/5"
            >
              <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
              <h3 className="text-lg font-bold text-slate-300 mb-1">
                Oturum Puanın
              </h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {totalScore}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
