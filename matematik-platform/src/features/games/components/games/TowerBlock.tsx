'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  Heart,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type TowerChallenge = {
  sequence: number[];
  correctAnswer: number;
  options: number[];
  ruleText: string;
};

const makePatternChallenge = (_level: number): TowerChallenge => {
  const patternType = Math.floor(Math.random() * 3);

  if (patternType === 0) {
    // Arithmetic step (+3, +4, +5, +6, etc.)
    const step = Math.floor(Math.random() * 5) + 2;
    const start = Math.floor(Math.random() * 15) + 2;
    const seq = [start, start + step, start + step * 2, start + step * 3];
    const nextVal = start + step * 4;

    const distractors = new Set<number>();
    while (distractors.size < 2) {
      const wrong =
        nextVal +
        (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1);
      if (wrong !== nextVal && wrong > 0) distractors.add(wrong);
    }

    return {
      sequence: seq,
      correctAnswer: nextVal,
      options: [nextVal, ...Array.from(distractors)].sort(
        () => Math.random() - 0.5,
      ),
      ruleText: `Örüntü kuralı: Her adımda +${step}`,
    };
  } else if (patternType === 1) {
    // Multiples or powers of 2
    const base = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
    const seq = [base * 1, base * 2, base * 3, base * 4];
    const nextVal = base * 5;

    const distractors = new Set<number>();
    while (distractors.size < 2) {
      const wrong = nextVal + (Math.floor(Math.random() * 6) + 1) * base;
      if (wrong !== nextVal && wrong > 0) distractors.add(wrong);
    }

    return {
      sequence: seq,
      correctAnswer: nextVal,
      options: [nextVal, ...Array.from(distractors)].sort(
        () => Math.random() - 0.5,
      ),
      ruleText: `${base}'in katları şeklinde ilerliyor`,
    };
  } else {
    // Subtraction pattern
    const step = Math.floor(Math.random() * 4) + 2;
    const start = 40 + step * 5;
    const seq = [start, start - step, start - step * 2, start - step * 3];
    const nextVal = start - step * 4;

    const distractors = new Set<number>();
    while (distractors.size < 2) {
      const wrong =
        nextVal +
        (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1);
      if (wrong !== nextVal && wrong > 0) distractors.add(wrong);
    }

    return {
      sequence: seq,
      correctAnswer: nextVal,
      options: [nextVal, ...Array.from(distractors)].sort(
        () => Math.random() - 0.5,
      ),
      ruleText: `Örüntü kuralı: Her adımda -${step}`,
    };
  }
};

type TowerFloor = {
  id: number;
  value: number;
  width: number;
  color: string;
};

const FLOOR_COLORS = [
  'bg-emerald-500 border-emerald-400',
  'bg-cyan-500 border-cyan-400',
  'bg-indigo-500 border-indigo-400',
  'bg-purple-500 border-purple-400',
  'bg-pink-500 border-pink-400',
  'bg-amber-500 border-amber-400',
];

export function TowerBlock({
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
  const [floorLevel, setFloorLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [challenge, setChallenge] = useState<TowerChallenge>(() =>
    makePatternChallenge(1),
  );
  const [floors, setFloors] = useState<TowerFloor[]>([
    { id: 0, value: 0, width: 220, color: 'bg-slate-700 border-slate-600' },
  ]);
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
    setFloorLevel(1);
    setTimeLeft(60);
    setFloors([
      { id: 0, value: 0, width: 220, color: 'bg-slate-700 border-slate-600' },
    ]);
    setFeedback(null);
    setChallenge(makePatternChallenge(1));
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

  const selectOption = (val: number) => {
    if (feedback) return;

    const isCorrect = val === challenge.correctAnswer;

    if (isCorrect) {
      gameAudio.playWhack();
      gameAudio.playCorrect();

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const points = (70 + nextStreak * 15) * scoreMultiplier;
      setScore((s) => s + points);

      if (nextStreak > 1) {
        setTimeout(() => gameAudio.playCombo(nextStreak), 150);
      }

      // Add floor to tower
      const color = FLOOR_COLORS[floorLevel % FLOOR_COLORS.length];
      const nextFloors = [
        {
          id: floorLevel,
          value: val,
          width: Math.max(120, 220 - floorLevel * 6),
          color,
        },
        ...floors.slice(0, 5), // Keep top 6 visible
      ];
      setFloors(nextFloors);

      setFeedback({
        isCorrect: true,
        message: `Mükemmel! ${challenge.ruleText} (+${points} Puan) 🏗️✨`,
      });

      setTimeout(() => {
        setFeedback(null);
        const nextLevel = floorLevel + 1;
        setFloorLevel(nextLevel);
        setTimeLeft((prev) => Math.min(prev + 8, 75));
        setChallenge(makePatternChallenge(nextLevel));
      }, 1200);
    } else {
      gameAudio.playWrong();
      setStreak(0);
      const nextLives = lives - 1;
      setLives(nextLives);

      setFeedback({
        isCorrect: false,
        message: `Hatalı Sayı! ${challenge.ruleText}`,
      });

      setTimeout(() => {
        if (nextLives <= 0) {
          finishGame(score);
        } else {
          setFeedback(null);
        }
      }, 1500);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl select-none rounded-3xl border border-indigo-500/30 bg-slate-950 p-6 text-white shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Boxes className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-indigo-300">
              Sayı Kulesi
            </h2>
            <p className="text-xs text-slate-400">
              Örüntüyü tamamla, kuleyi göklere yükselt!
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
            <div className="rounded-xl bg-indigo-500/20 px-3 py-1 text-indigo-300">
              Süre: {timeLeft}s
            </div>
            <div className="rounded-xl bg-amber-500/20 px-3 py-1 font-display text-amber-300">
              {score} Puan
            </div>
          </div>
        )}
      </div>

      {gameState === 'idle' && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/40">
            <Layers className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">Gökyüzüne Kule Dik!</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
            Sayı dizisini incele, sıradaki örüntü kuralını çöz. Doğru sayı
            bloğunu seçerek kulenin üstüne yerleştir ve bulutlara kadar yüksel!
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              <Play className="h-5 w-5" /> İnşaata Başla
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          {/* Pattern Sequence Display */}
          <div className="mb-4 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
                KAT #{floorLevel} — SAYI ÖRÜNTÜSÜ
              </span>
              <span className="text-xs text-slate-400">Soru İşaretini Bul</span>
            </div>

            <div className="my-3 flex items-center justify-center gap-2 sm:gap-3">
              {challenge.sequence.map((num, i) => (
                <div
                  key={i}
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border border-indigo-400/40 bg-slate-900 font-display text-lg sm:text-xl font-black text-indigo-300 shadow"
                >
                  {num}
                </div>
              ))}
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border-2 border-dashed border-amber-400 bg-amber-500/20 font-display text-2xl font-black text-amber-300 animate-pulse">
                ?
              </div>
            </div>

            <div className="text-center text-xs text-slate-400">
              {challenge.ruleText}
            </div>
          </div>

          {/* Stacking Tower Simulation Canvas */}
          <div className="relative h-60 w-full overflow-hidden rounded-2xl border border-indigo-900/60 bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-950 p-4">
            {/* Stars and clouds in background */}
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <Sparkles className="absolute left-8 top-6 h-4 w-4 text-indigo-300 animate-pulse" />
              <Sparkles className="absolute right-12 top-10 h-5 w-5 text-amber-300 animate-pulse" />
            </div>

            {/* Tower Floors */}
            <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-1">
              {floors.map((floor) => (
                <motion.div
                  key={floor.id}
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ width: `${floor.width}px` }}
                  className={`flex h-9 items-center justify-center rounded-lg border-2 font-display text-sm font-bold text-white shadow-lg ${floor.color}`}
                >
                  {floor.id === 0
                    ? 'Zemin Temel 🏰'
                    : `Kat ${floor.id}: ${floor.value}`}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Option Buttons to Stack */}
          <div className="mt-4">
            <div className="mb-2 text-center text-xs font-semibold text-slate-400">
              Hangi bloğu yerleştireceksin?
            </div>
            <div className="flex justify-center gap-3">
              {challenge.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => selectOption(opt)}
                  disabled={feedback !== null}
                  className="flex-1 max-w-[140px] rounded-2xl border-2 border-indigo-400/40 bg-gradient-to-tr from-indigo-600 to-purple-600 py-3 font-display text-2xl font-black text-white shadow-xl shadow-indigo-500/20 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="mt-3 flex justify-center">
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-xl px-4 py-1.5 text-sm font-semibold ${
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
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 text-slate-950 shadow-xl">
            <Trophy className="h-10 w-10" />
          </div>
          <h3 className="font-display text-3xl font-black text-white">
            İnşaat Tamamlandı!
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Muazzam bir gökdelen diktin! İşte mimari başarın:
          </p>

          <div className="mx-auto my-6 grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-white/5 p-4 border border-white/10">
            <div>
              <div className="text-xs text-slate-400">Toplam Puan</div>
              <div className="font-display text-2xl font-black text-amber-400">
                {score}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Kule Yüksekliği</div>
              <div className="font-display text-2xl font-black text-indigo-400">
                {floorLevel} Kat
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-6 py-3 font-bold text-white transition hover:bg-indigo-600"
            >
              <RotateCcw className="h-5 w-5" /> Tekrar İnşa Et
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
