'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, MapPin, Play, RotateCcw, Trophy } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type TargetCoord = {
  x: number;
  y: number;
  hint: string;
};

const makeCoordTarget = (round: number): TargetCoord => {
  if (round <= 3) {
    // 1st quadrant only: 1 to 5
    const x = Math.floor(Math.random() * 5) + 1;
    const y = Math.floor(Math.random() * 5) + 1;
    return {
      x,
      y,
      hint: `Yatayda (X) ${x}. çizgiye, dikeyde (Y) ${y}. çizgiye git.`,
    };
  } else {
    // 4 quadrants: -3 to +3
    const x = Math.floor(Math.random() * 7) - 3;
    const y = Math.floor(Math.random() * 7) - 3;
    const xDir = x >= 0 ? `${x} (Sağ)` : `${x} (Sol)`;
    const yDir = y >= 0 ? `${y} (Yukarı)` : `${y} (Aşağı)`;
    return {
      x,
      y,
      hint: `X ekseninde ${xDir}, Y ekseninde ${yDir} noktasını bul.`,
    };
  }
};

export function TreasurePirate({
  onScore,
  scoreMultiplier,
  onExit,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [target, setTarget] = useState<TargetCoord>(() => makeCoordTarget(1));
  const [foundTreasure, setFoundTreasure] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);

  const finishGame = useCallback(
    (finalScore: number) => {
      setGameState('ended');
      gameAudio.playFanfare();
      onScore(finalScore);
    },
    [onScore],
  );

  const startNewGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setStreak(0);
    setRound(1);
    setTimeLeft(60);
    setFoundTreasure(false);
    setFeedback(null);
    setTarget(makeCoordTarget(1));
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, finishGame, score]);

  const isFourQuadrants = round > 3;
  const gridCoords = isFourQuadrants
    ? [-3, -2, -1, 0, 1, 2, 3]
    : [1, 2, 3, 4, 5];

  const handleCellClick = (x: number, y: number) => {
    if (foundTreasure || feedback) return;

    const isCorrect = x === target.x && y === target.y;

    if (isCorrect) {
      gameAudio.playCorrect();
      setFoundTreasure(true);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const points = (80 + nextStreak * 15) * scoreMultiplier;
      setScore((s) => s + points);

      if (nextStreak > 1) {
        setTimeout(() => gameAudio.playCombo(nextStreak), 150);
      }

      setFeedback({
        isCorrect: true,
        message: `BİNGO! Hazine sandığı (${x}, ${y}) noktasında açıldı! (+${points} Puan) 💎✨`,
      });

      setTimeout(() => {
        setFoundTreasure(false);
        setFeedback(null);
        const nextRound = round + 1;
        setRound(nextRound);
        setTimeLeft((prev) => Math.min(prev + 10, 75));
        setTarget(makeCoordTarget(nextRound));
      }, 1500);
    } else {
      gameAudio.playWrong();
      setStreak(0);
      const nextLives = lives - 1;
      setLives(nextLives);

      // Helpful navigational hint
      let dirHint = '';
      if (x < target.x) dirHint += 'Daha SAĞA ';
      else if (x > target.x) dirHint += 'Daha SOLA ';
      if (y < target.y) dirHint += 'Daha YUKARI ';
      else if (y > target.y) dirHint += 'Daha AŞAĞI ';

      setFeedback({
        isCorrect: false,
        message: `Burada sadece kum var (${x}, ${y})! İpucu: ${dirHint}gitmelisin.`,
      });

      setTimeout(() => {
        if (nextLives <= 0) {
          finishGame(score);
        } else {
          setFeedback(null);
        }
      }, 1800);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl select-none rounded-3xl border border-amber-500/30 bg-slate-950 p-6 text-white shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-lg shadow-amber-500/30">
            <Compass className="h-7 w-7 text-slate-950" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-amber-300">
              Koordinat Korsanı
            </h2>
            <p className="text-xs text-slate-400">
              Gizli koordinatı bul, hazine sandığını kaz!
            </p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-4 text-sm font-semibold">
            <div className="flex items-center gap-1 text-red-400">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`h-5 w-5 ${
                    i < lives ? 'fill-red-500 text-red-500' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <div className="rounded-xl bg-amber-500/20 px-3 py-1 text-amber-300">
              Süre: {timeLeft}s
            </div>
            <div className="rounded-xl bg-purple-500/20 px-3 py-1 font-display text-purple-300">
              {score} Puan
            </div>
          </div>
        )}
      </div>

      {gameState === 'idle' && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 shadow-xl shadow-amber-500/40">
            <Compass className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Ahoy Kaptan! Harita Açıldı!
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
            Korsan adasındaki gizli koordinatları (X, Y) pusulanla tespit et.
            Küreği vurarak sandıkları aç, altınları topla!
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-3.5 text-base font-bold text-slate-950 shadow-lg transition hover:scale-105 active:scale-95"
            >
              <Play className="h-5 w-5" /> Haritayı Aç & Başla
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          {/* Target Banner */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 px-5 py-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                KORSANIN HEDEFİ (#{round})
              </span>
              <div className="flex items-center gap-2 font-display text-2xl font-black text-white">
                <MapPin className="h-6 w-6 text-red-500 animate-bounce" />
                (X: <span className="text-amber-400">{target.x}</span>, Y:{' '}
                <span className="text-cyan-400">{target.y}</span>)
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Pusula İpucu</span>
              <div className="text-xs font-semibold text-amber-300">
                {target.hint}
              </div>
            </div>
          </div>

          {/* Coordinate Island Grid */}
          <div className="relative mx-auto flex flex-col items-center justify-center rounded-2xl border-2 border-amber-900/50 bg-amber-950/20 p-4">
            <div className="text-center text-xs font-bold text-cyan-400 mb-1">
              ▲ Y Ekseni (Dikey)
            </div>

            <div className="flex">
              {/* Y Axis labels */}
              <div className="flex flex-col justify-between py-2 pr-2 text-right text-xs font-bold text-cyan-400">
                {[...gridCoords].reverse().map((y) => (
                  <div key={y} className="flex h-10 items-center justify-end">
                    {y}
                  </div>
                ))}
              </div>

              {/* Grid cells */}
              <div
                className="grid gap-1.5 rounded-xl border border-amber-800/40 bg-stone-900/90 p-2 shadow-2xl"
                style={{
                  gridTemplateColumns: `repeat(${gridCoords.length}, minmax(0, 1fr))`,
                }}
              >
                {[...gridCoords].reverse().map((y) =>
                  gridCoords.map((x) => {
                    const isTargetCell = x === target.x && y === target.y;
                    const isOrigin = x === 0 && y === 0;

                    return (
                      <button
                        key={`${x}-${y}`}
                        type="button"
                        onClick={() => handleCellClick(x, y)}
                        className={`group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95 ${
                          isOrigin
                            ? 'border-red-500/50 bg-red-500/20 text-red-300'
                            : 'border-white/10 bg-slate-800/60 hover:border-amber-400 hover:bg-amber-500/20'
                        }`}
                        title={`(${x}, ${y})`}
                      >
                        {foundTreasure && isTargetCell ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.3 }}
                            className="text-2xl"
                          >
                            💎
                          </motion.span>
                        ) : (
                          <span className="text-[10px] text-slate-500 group-hover:text-amber-300">
                            {x},{y}
                          </span>
                        )}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>

            <div className="mt-2 text-center text-xs font-bold text-amber-400">
              ► X Ekseni (Yatay)
            </div>
          </div>

          {/* Feedback message */}
          <div className="mt-4 flex justify-center">
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    feedback.isCorrect
                      ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                      : 'border border-rose-500/40 bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 shadow-xl">
            <Trophy className="h-10 w-10" />
          </div>
          <h3 className="font-display text-3xl font-black text-white">
            Ada Feth Edildi!
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Bütün gizli hazineleri buldun! İşte toplam korsan ganimeti:
          </p>

          <div className="mx-auto my-6 grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-white/5 p-4 border border-white/10">
            <div>
              <div className="text-xs text-slate-400">Toplam Altın</div>
              <div className="font-display text-2xl font-black text-amber-400">
                {score}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Açılan Sandık</div>
              <div className="font-display text-2xl font-black text-emerald-400">
                {round - 1}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-amber-400"
            >
              <RotateCcw className="h-5 w-5" /> Tekrar Keşfe Çık
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Oyunlara Dön
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
