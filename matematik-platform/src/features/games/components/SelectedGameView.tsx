'use client';

import { ArrowLeft } from 'lucide-react';
import { FloatingParticles } from '@/features/games/components/gameLibrary';
import type { GameDefinition } from '@/features/games/types';

type SelectedGameViewProps = {
  game: GameDefinition;
  onBack: () => void;
  onScore: (score: number) => void;
  scoreMultiplier: number;
  totalScore: number;
};

export function SelectedGameView({
  game,
  onBack,
  onScore,
  scoreMultiplier,
  totalScore,
}: SelectedGameViewProps) {
  const GameComponent = game.component;

  return (
    <main className="oyunlar-page min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <FloatingParticles />

      <nav className="fixed top-0 left-0 right-0 z-50 glass py-3 sm:py-4 px-4 sm:px-6">
        <div className="container mx-auto flex justify-between items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors min-w-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span className="font-bold text-sm sm:text-base truncate">Oyunlara Dön</span>
          </button>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-xs sm:text-base">
              Toplam: {totalScore} Puan
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 sm:pt-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <GameComponent
            onExit={onBack}
            onScore={onScore}
            scoreMultiplier={scoreMultiplier}
          />
        </div>
      </div>
    </main>
  );
}
