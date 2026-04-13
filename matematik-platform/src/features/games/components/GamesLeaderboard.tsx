'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { LeaderboardRow } from '@/features/games/types';

type GamesLeaderboardProps = {
  leaderboard: LeaderboardRow[];
};

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

export function GamesLeaderboard({ leaderboard }: GamesLeaderboardProps) {
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
                      <span className="text-slate-500 text-xs uppercase tracking-wider">
                        Puan
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
