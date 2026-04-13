'use client';

import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import type { GameDefinition } from '@/features/games/types';

type GameCardProps = {
  game: GameDefinition;
  onClick: () => void;
};

export function GameCard({ game, onClick }: GameCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass rounded-3xl overflow-hidden cursor-pointer transition-all"
    >
      <div
        className={`h-40 bg-gradient-to-br ${game.color} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${
              game.color.split(' ')[1]
            }, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <game.icon className="w-20 h-20 text-white/80" />
        </div>
        <div className="absolute top-3 right-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
          {game.grade}. Sınıf
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
        <p className="text-slate-400 text-sm mb-4">{game.description}</p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            {game.rating}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-orange-400" />
            {game.difficulty}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
