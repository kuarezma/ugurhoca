'use client';

import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
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
      className="tilt-on-hover glass group relative flex w-full flex-col overflow-hidden rounded-3xl text-left transition-all hover:shadow-brand-glow focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/50"
    >
      <div
        className={`relative h-40 overflow-hidden bg-gradient-to-br ${game.color}`}
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
          <game.icon className="h-20 w-20 text-white/80" aria-hidden="true" />
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
          {game.grade}. Sınıf
        </div>
      </div>
      <div className="p-5">
        <h3 className="mb-2 font-display text-xl font-bold text-white">
          {game.title}
        </h3>
        <p className="mb-4 text-sm text-slate-300">{game.description}</p>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Star
              className="h-4 w-4 fill-current text-yellow-400"
              aria-hidden="true"
            />
            <span>{game.rating}</span>
            <span className="sr-only">yıldız</span>
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-orange-400" aria-hidden="true" />
            <span>{game.difficulty}</span>
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export const GameCard = memo(GameCardInner);
GameCard.displayName = 'GameCard';
