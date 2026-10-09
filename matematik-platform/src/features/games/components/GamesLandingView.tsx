'use client';

import Image from 'next/image';

import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Volume2, VolumeX, Sparkles } from 'lucide-react';
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
    <main className="oyunlar-page page-surface min-h-screen pb-20 relative">
      {/* Ambient Glow Mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-48 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl" />
      </div>

      <FloatingParticles />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-default bg-surface-1/90 backdrop-blur-xl py-3 sm:py-4 px-4 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="container mx-auto flex justify-between items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border-2 border-[#58cc02] bg-[#d7ffb8] p-0.5 shadow-[0_3px_0_#46a302]">
              <Image
                src="/ugur.jpeg"
                alt="Uğur Hoca"
                width={44}
                height={44}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <span className="font-display text-base sm:text-xl font-bold text-primary truncate">
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

      <div className="pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-24 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center max-w-2xl mx-auto"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 backdrop-blur-md shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>19 Eğlenceli Matematik Oyunu · Puan Topla & Yarış</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-primary font-display mb-2">
              Matematik Oyun Dünyası
            </h1>
            <p className="text-sm sm:text-base text-secondary">
              Hızlı işlem, geometri dedektifliği ve zihin açıcı strateji oyunlarıyla matematiği eğlenerek keşfet.
            </p>
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
