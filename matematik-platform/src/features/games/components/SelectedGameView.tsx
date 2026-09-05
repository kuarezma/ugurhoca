'use client';

import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { FloatingParticles } from '@/features/games/components/gameLibrary';
import { useGameSoundMute } from '@/features/games/hooks/useGameSoundMute';
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
  const { isMuted, toggleMute } = useGameSoundMute();
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

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors text-xs"
              aria-label={isMuted ? 'Oyun sesini aç' : 'Oyun sesini kapat'}
              title={isMuted ? 'Ses Kapalı (Açmak için tıkla)' : 'Ses Açık (Kapatmak için tıkla)'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="hidden sm:inline text-rose-300">Sessiz</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline text-emerald-300">Ses Açık</span>
                </>
              )}
            </button>

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
