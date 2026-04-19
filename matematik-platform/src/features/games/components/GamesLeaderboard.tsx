'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, Trophy } from 'lucide-react';
import type { LeaderboardRow } from '@/features/games/types';

type GamesLeaderboardProps = {
  leaderboard: LeaderboardRow[];
};

type PodiumConfig = {
  border: string;
  glow: string;
  gradient: string;
  icon: React.ElementType;
  iconClass: string;
  label: string;
  order: string;
  rank: number;
  size: string;
};

const PODIUM: PodiumConfig[] = [
  {
    border: 'border-slate-300/40',
    glow: 'shadow-[0_0_40px_rgba(226,232,240,0.35)]',
    gradient: 'from-slate-200 via-slate-300 to-slate-400',
    icon: Medal,
    iconClass: 'text-slate-600',
    label: 'Gümüş',
    order: 'order-1',
    rank: 2,
    size: 'h-28 sm:h-32',
  },
  {
    border: 'border-amber-300/50',
    glow: 'shadow-[0_0_50px_rgba(251,191,36,0.45)]',
    gradient: 'from-amber-300 via-yellow-400 to-amber-500',
    icon: Crown,
    iconClass: 'text-amber-800',
    label: 'Şampiyon',
    order: 'order-2 sm:-translate-y-3',
    rank: 1,
    size: 'h-36 sm:h-44',
  },
  {
    border: 'border-orange-500/40',
    glow: 'shadow-[0_0_40px_rgba(234,88,12,0.35)]',
    gradient: 'from-orange-300 via-orange-400 to-amber-700',
    icon: Medal,
    iconClass: 'text-amber-100',
    label: 'Bronz',
    order: 'order-3',
    rank: 3,
    size: 'h-24 sm:h-28',
  },
];

const medalClasses = [
  {
    container:
      'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 shadow-[0_0_20px_rgba(251,191,36,0.3)]',
    score: 'text-amber-400',
    row: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20',
  },
  {
    container:
      'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-[0_0_20px_rgba(203,213,225,0.3)]',
    score: 'text-slate-300',
    row: 'bg-slate-300/10 border-slate-300/20 hover:bg-slate-300/20',
  },
  {
    container:
      'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 shadow-[0_0_20px_rgba(180,83,9,0.3)]',
    score: 'text-amber-600',
    row: 'bg-amber-700/10 border-amber-700/20 hover:bg-amber-700/20',
  },
];

const getLeaderboardClasses = (index: number) => {
  return (
    medalClasses[index] || {
      container: 'bg-slate-800 text-slate-400 border border-slate-700',
      score: 'text-green-400',
      row: 'bg-white/5 border-transparent hover:bg-white/10',
    }
  );
};

function GamesLeaderboardInner({ leaderboard }: GamesLeaderboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-16 max-w-5xl mx-auto glass rounded-3xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 py-5 px-6 border-b border-white/5 flex items-center justify-center gap-3">
        <Trophy className="w-8 h-8 text-amber-400" />
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Global Liderlik Tablosu
        </h2>
      </div>

      <div className="p-6">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Henüz hiç skor kaydedilmemiş. İlk skor senin olabilir!
          </div>
        ) : (
          <>
            {leaderboard.length >= 2 && (
              <div className="mb-10 grid grid-cols-3 gap-3 sm:gap-6 items-end">
                {PODIUM.map((podium) => {
                  const entry = leaderboard[podium.rank - 1];
                  if (!entry) {
                    return <div key={podium.rank} className={podium.order} />;
                  }
                  const PodiumIcon = podium.icon;
                  return (
                    <motion.div
                      key={`podium-${podium.rank}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: podium.rank * 0.1 }}
                      className={`relative flex flex-col items-center ${podium.order}`}
                    >
                      <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${podium.gradient} ${podium.glow}`}>
                        <PodiumIcon className={`h-7 w-7 ${podium.iconClass}`} aria-hidden="true" />
                      </div>
                      <p className="text-center text-sm font-bold text-white line-clamp-1">
                        {entry.user_name || 'Gizemli Şampiyon'}
                      </p>
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">
                        {podium.label}
                      </p>
                      <div
                        className={`relative w-full overflow-hidden rounded-t-2xl border ${podium.border} bg-gradient-to-b ${podium.gradient} ${podium.size} flex items-end justify-center pb-2`}
                      >
                        <span className="relative z-10 font-display text-2xl sm:text-3xl font-black text-slate-900 drop-shadow">
                          {entry.total_score}
                        </span>
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent"
                          style={{ backgroundSize: '200% 100%' }}
                        />
                      </div>
                      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        #{podium.rank}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const classes = getLeaderboardClasses(index);

              return (
                <motion.div
                  key={`${entry.id ?? entry.user_name}-${index}`}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-colors border ${classes.row}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${classes.container}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-bold text-white text-lg block">
                        {entry.user_name || 'Gizemli Şampiyon'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Genel Ortalama Sıralaması
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                      <span className={`font-bold text-2xl ${classes.score}`}>
                        {entry.total_score}
                      </span>
                      <span className="text-slate-400 text-xs uppercase tracking-wider">
                        Puan
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export const GamesLeaderboard = memo(GamesLeaderboardInner);
GamesLeaderboard.displayName = 'GamesLeaderboard';
