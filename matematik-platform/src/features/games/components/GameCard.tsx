'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Zap } from 'lucide-react';
import { memo, type KeyboardEvent } from 'react';
import type { GameDefinition } from '@/features/games/types';

type GameCardProps = {
  game: GameDefinition;
  onClick: () => void;
};

function GameCardInner({ game, onClick }: GameCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${game.title} oyununu oyna`}
      className="tilt-on-hover group relative flex w-full flex-col overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 text-left transition-all duration-300 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 backdrop-blur-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/50"
    >
      <div
        className={`relative h-44 overflow-hidden bg-gradient-to-br ${game.color}`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          aria-hidden="true"
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
          <game.icon className="h-20 w-20 text-white/95 drop-shadow-md group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
        </div>
        <div className="absolute right-3.5 top-3.5 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-xs border border-white/20">
          {game.grade}. Sınıf
        </div>
      </div>
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 w-full">
        <div>
          <h3 className="mb-2 font-display text-xl font-bold text-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {game.title}
          </h3>
          <p className="mb-4 text-xs sm:text-sm text-secondary line-clamp-2 leading-relaxed">{game.description}</p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs w-full">
          <div className="flex items-center gap-3 text-secondary font-medium">
            <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
              <Star
                className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              <span>{game.rating}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
              <span>{game.difficulty}</span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            Oyna <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export const GameCard = memo(GameCardInner);
GameCard.displayName = 'GameCard';
