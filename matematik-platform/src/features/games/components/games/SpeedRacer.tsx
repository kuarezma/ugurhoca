'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  Play,
  RotateCcw,
  Trophy,
  Zap,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type GateOption = {
  lane: number; // 0, 1, 2
  value: number;
  isCorrect: boolean;
};

type RacerQuestion = {
  text: string;
  answer: number;
  options: GateOption[];
};

const makeRacerProblem = (level: number): RacerQuestion => {
  const op = Math.floor(Math.random() * 4);
  let text = '';
  let answer = 0;

  if (op === 0) {
    const a = Math.floor(Math.random() * (level * 10 + 10)) + 6;
    const b = Math.floor(Math.random() * (level * 8 + 8)) + 4;
    answer = a + b;
    text = `${a} + ${b} = ?`;
  } else if (op === 1) {
    const a = Math.floor(Math.random() * (level * 12 + 15)) + 12;
    const b = Math.floor(Math.random() * (a - 4)) + 3;
    answer = a - b;
    text = `${a} - ${b} = ?`;
  } else if (op === 2) {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    answer = a * b;
    text = `${a} × ${b} = ?`;
  } else {
    const b = Math.floor(Math.random() * 8) + 2;
    const ans = Math.floor(Math.random() * 9) + 2;
    answer = ans;
    text = `${b * ans} ÷ ${b} = ?`;
  }

  // Generate 2 distractors
  const distractors = new Set<number>();
  while (distractors.size < 2) {
    const offset =
      (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const wrong = Math.max(1, answer + offset);
    if (wrong !== answer) distractors.add(wrong);
  }

  const values = [answer, ...Array.from(distractors)].sort(
    () => Math.random() - 0.5,
  );

  const options: GateOption[] = values.map((val, idx) => ({
    lane: idx,
    value: val,
    isCorrect: val === answer,
  }));

  return { text, answer, options };
};

export function SpeedRacer({
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
  const [speedLevel, setSpeedLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentLane, setCurrentLane] = useState(1); // 0: Left, 1: Center, 2: Right
  const [question, setQuestion] = useState<RacerQuestion>(() =>
    makeRacerProblem(1),
  );
  const [gateProgress, setGateProgress] = useState(0); // 0% (far) to 100% (at car)
  const [isNitro, setIsNitro] = useState(false);
  const [isCrash, setIsCrash] = useState(false);

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
    setSpeedLevel(1);
    setTimeLeft(60);
    setCurrentLane(1);
    setGateProgress(0);
    setIsNitro(false);
    setIsCrash(false);
    setQuestion(makeRacerProblem(1));
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

  // Keyboard navigation
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCurrentLane((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCurrentLane((prev) => Math.min(2, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Gate approach animation loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const stepMs = 30;
    const increment = 1.1 + speedLevel * 0.22;

    const approachInterval = setInterval(() => {
      setGateProgress((prev) => {
        if (prev >= 95) {
          // Gate collision moment!
          const chosenGate = question.options.find(
            (opt) => opt.lane === currentLane,
          );
          if (chosenGate?.isCorrect) {
            // NITRO!
            gameAudio.playNitro();
            gameAudio.playCorrect();
            setIsNitro(true);
            setTimeout(() => setIsNitro(false), 800);

            const nextStreak = streak + 1;
            setStreak(nextStreak);
            const points = (60 + nextStreak * 15) * scoreMultiplier;
            setScore((s) => s + points);

            if (nextStreak > 1) {
              setTimeout(() => gameAudio.playCombo(nextStreak), 200);
            }

            const nextLevel = Math.min(
              5,
              speedLevel + (nextStreak % 3 === 0 ? 1 : 0),
            );
            setSpeedLevel(nextLevel);
            setQuestion(makeRacerProblem(nextLevel));
          } else {
            // CRASH!
            gameAudio.playWrong();
            setIsCrash(true);
            setTimeout(() => setIsCrash(false), 500);

            setStreak(0);
            const nextLives = lives - 1;
            setLives(nextLives);

            if (nextLives <= 0) {
              finishGame(score);
            } else {
              setQuestion(makeRacerProblem(speedLevel));
            }
          }
          return 0; // reset gate to distance
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(approachInterval);
  }, [
    gameState,
    speedLevel,
    question,
    currentLane,
    streak,
    scoreMultiplier,
    lives,
    score,
    finishGame,
  ]);

  const lanePositions = ['16%', '50%', '84%'];

  return (
    <div className="mx-auto w-full max-w-2xl select-none overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 text-white shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Car className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-cyan-300">
              Hızlı Şoför
            </h2>
            <p className="text-xs text-slate-400">
              Doğru şeride gir, nitro hızını yakala!
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
            <div className="rounded-xl bg-cyan-500/20 px-3 py-1 text-cyan-300">
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
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/40">
            <Car className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Yarış Pisti Seni Bekliyor!
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
            Araban 3 şeritli pistte ilerliyor. Üstteki işlemin doğru cevabını
            taşıyan şeride geç! Doğru kapıdan geçtikçe alevli nitro boost kazan,
            rekor kır!
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              <Play className="h-5 w-5" /> Gaza Bas & Başla
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          {/* Question Banner */}
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 px-5 py-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
                İŞLEMİ ÇÖZ & ŞERİT SEÇ
              </span>
              <div className="font-display text-2xl font-black text-white">
                {question.text}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Vites / Hız</span>
              <div className="flex items-center justify-end gap-1 text-cyan-300 font-bold">
                <Zap className="h-4 w-4" /> {speedLevel}. Seviye
              </div>
            </div>
          </div>

          {/* 3-Lane Track Simulation */}
          <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-cyan-900/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
            {/* Perspective Road Markings */}
            <div className="absolute inset-0 flex justify-between px-2">
              <div className="w-1/3 border-r-2 border-dashed border-cyan-500/30" />
              <div className="w-1/3 border-r-2 border-dashed border-cyan-500/30" />
            </div>

            {/* Approaching Gates in 3 lanes */}
            <div
              className="absolute left-0 right-0 flex justify-around transition-all ease-linear"
              style={{
                top: `${gateProgress}%`,
                transform: `scale(${0.5 + (gateProgress / 100) * 0.7})`,
                opacity: gateProgress > 90 ? 0.4 : 1,
              }}
            >
              {question.options.map((opt) => (
                <div
                  key={opt.lane}
                  className="flex h-12 w-20 items-center justify-center rounded-xl border-2 border-cyan-400 bg-cyan-950/90 font-display text-lg font-black text-cyan-200 shadow-lg shadow-cyan-500/30"
                >
                  {opt.value}
                </div>
              ))}
            </div>

            {/* Nitro Flame Overlay */}
            <AnimatePresence>
              {isNitro && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-x-0 top-1/3 z-20 flex justify-center"
                >
                  <div className="flex items-center gap-2 rounded-2xl bg-amber-500/90 px-4 py-2 font-display text-lg font-black text-slate-950 shadow-2xl">
                    <Flame className="h-6 w-6 fill-red-600 text-red-600 animate-bounce" />
                    NITRO BOOST! +PUAN 🔥
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Crash Shake Notification */}
            <AnimatePresence>
              {isCrash && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-red-600/30 font-display text-lg font-black text-red-300 backdrop-blur-xs"
                >
                  BARİYERE ÇARPTIN! 💥 -1 CAN
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Sports Car */}
            <motion.div
              animate={{
                left: lanePositions[currentLane],
                x: '-50%',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="absolute bottom-4 z-10 flex flex-col items-center"
            >
              <div
                className={`flex h-14 w-12 items-center justify-center rounded-2xl bg-gradient-to-t from-cyan-600 to-cyan-400 p-1 shadow-xl ${
                  isNitro
                    ? 'shadow-amber-500 ring-4 ring-amber-400'
                    : 'shadow-cyan-500/50'
                }`}
              >
                <Car className="h-10 w-10 text-white" />
              </div>
              {/* Flame exhaust when nitro is active */}
              {isNitro && (
                <div className="flex gap-1">
                  <Flame className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <Flame className="h-5 w-5 text-red-500 fill-red-500" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Lane Controls (Touch / Clickable) */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentLane((prev) => Math.max(0, prev - 1))}
              disabled={currentLane === 0}
              className="flex-1 inline-flex h-12 items-center justify-center gap-1 rounded-xl border border-cyan-500/30 bg-cyan-950/60 font-bold text-cyan-300 transition hover:bg-cyan-900/60 disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" /> Sol Şerit
            </button>
            <div className="text-center text-xs text-slate-400">
              Klavye:{' '}
              <span className="font-bold text-cyan-300">← Sol / Sağ →</span>
            </div>
            <button
              onClick={() => setCurrentLane((prev) => Math.min(2, prev + 1))}
              disabled={currentLane === 2}
              className="flex-1 inline-flex h-12 items-center justify-center gap-1 rounded-xl border border-cyan-500/30 bg-cyan-950/60 font-bold text-cyan-300 transition hover:bg-cyan-900/60 disabled:opacity-30"
            >
              Sağ Şerit <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 shadow-xl">
            <Trophy className="h-10 w-10" />
          </div>
          <h3 className="font-display text-3xl font-black text-white">
            Yarış Tamamlandı!
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Pistteki reflekslerin göz kamaştırdı! İşte skorun:
          </p>

          <div className="mx-auto my-6 grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-white/5 p-4 border border-white/10">
            <div>
              <div className="text-xs text-slate-400">Kazanılan Puan</div>
              <div className="font-display text-2xl font-black text-amber-400">
                {score}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Ulaşılan Hız</div>
              <div className="font-display text-2xl font-black text-cyan-400">
                {speedLevel}. Vites
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              <RotateCcw className="h-5 w-5" /> Tekrar Yarış
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
