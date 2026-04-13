'use client';

import { ArrowLeft } from 'lucide-react';
import { FloatingParticles } from '@/features/games/components/gameLibrary';
import type { GameDefinition } from '@/features/games/types';

type SelectedGameViewProps = {
  game: GameDefinition;
  onBack: () => void;
  onScore: (score: number) => void;
  totalScore: number;
};

export function SelectedGameView({
  game,
  onBack,
  onScore,
  totalScore,
}: SelectedGameViewProps) {
  const GameComponent = game.component;

  return (
    <main className="oyunlar-page min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <FloatingParticles />

      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-3 text-white hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">Oyunlara Dön</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold">
              Toplam: {totalScore} Puan
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <GameComponent onScore={onScore} />
        </div>
      </div>
    </main>
  );
}
