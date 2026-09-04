'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Heart, Play, RotateCcw, Trophy } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type MoleTarget = {
  question: string;
  targetAnswer: number;
};

type MoleItem = {
  holeIndex: number;
  expression: string;
  value: number;
  isHit: boolean;
  hitSuccess?: boolean;
};

const makeRoundTarget = (level: number): MoleTarget => {
  const operations = ['+', '-', '*', '/'];
  const op = operations[Math.floor(Math.random() * (level > 2 ? 4 : 3))];

  if (op === '+') {
    const a = Math.floor(Math.random() * (level * 15 + 10)) + 5;
    const b = Math.floor(Math.random() * (level * 10 + 10)) + 5;
    return { question: `${a} + ${b} = ?`, targetAnswer: a + b };
  } else if (op === '-') {
    const a = Math.floor(Math.random() * (level * 20 + 20)) + 15;
    const b = Math.floor(Math.random() * (a - 5)) + 3;
    return { question: `${a} - ${b} = ?`, targetAnswer: a - b };
  } else if (op === '*') {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    return { question: `${a} × ${b} = ?`, targetAnswer: a * b };
  } else {
    const b = Math.floor(Math.random() * 8) + 2;
    const ans = Math.floor(Math.random() * 10) + 2;
    return { question: `${b * ans} ÷ ${b} = ?`, targetAnswer: ans };
  }
};

export function MoleWhack({
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
  const [timeLeft, setTimeLeft] = useState(60);
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState<MoleTarget>(() => makeRoundTarget(1));
  const [activeMoles, setActiveMoles] = useState<MoleItem[]>([]);
  const [whackedHole, setWhackedHole] = useState<number | null>(null);

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
    setTimeLeft(60);
    setRound(1);
    setActiveMoles([]);
    setWhackedHole(null);
    setTarget(makeRoundTarget(1));
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

  // Mole popup loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const speed = Math.max(900, 1800 - round * 100);

    const moleInterval = setInterval(() => {
      // Pick 2-3 random distinct holes
      const numHoles = Math.random() > 0.5 ? 3 : 2;
      const chosenHoles: number[] = [];
      while (chosenHoles.length < numHoles) {
        const h = Math.floor(Math.random() * 9);
        if (!chosenHoles.includes(h)) chosenHoles.push(h);
      }

      // Ensure at least one mole has the correct target answer!
      const correctHoleIdx = Math.floor(Math.random() * chosenHoles.length);

      const newMoles: MoleItem[] = chosenHoles.map((holeIndex, idx) => {
        if (idx === correctHoleIdx) {
          return {
            holeIndex,
            expression: String(target.targetAnswer),
            value: target.targetAnswer,
            isHit: false,
          };
        } else {
          // Distractor
          const offset =
            (Math.floor(Math.random() * 6) + 1) *
            (Math.random() > 0.5 ? 1 : -1);
          const wrongVal = Math.max(1, target.targetAnswer + offset);
          return {
            holeIndex,
            expression: String(
              wrongVal === target.targetAnswer ? wrongVal + 2 : wrongVal,
            ),
            value: wrongVal,
            isHit: false,
          };
        }
      });

      setActiveMoles(newMoles);
    }, speed);

    return () => clearInterval(moleInterval);
  }, [gameState, round, target.targetAnswer]);

  const whackMole = (mole: MoleItem) => {
    if (mole.isHit) return;

    gameAudio.playWhack();
    setWhackedHole(mole.holeIndex);
    setTimeout(() => setWhackedHole(null), 250);

    const isCorrect = mole.value === target.targetAnswer;

    setActiveMoles((prev) =>
      prev.map((m) =>
        m.holeIndex === mole.holeIndex
          ? { ...m, isHit: true, hitSuccess: isCorrect }
          : m,
      ),
    );

    if (isCorrect) {
      gameAudio.playCorrect();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const points = (50 + nextStreak * 10) * scoreMultiplier;
      setScore((prev) => prev + points);

      if (nextStreak > 1) {
        setTimeout(() => gameAudio.playCombo(nextStreak), 150);
      }

      // Next target!
      setTimeout(() => {
        const nextRound = round + 1;
        setRound(nextRound);
        setTarget(makeRoundTarget(nextRound));
        setActiveMoles([]);
      }, 400);
    } else {
      gameAudio.playWrong();
      setStreak(0);
      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        setTimeout(() => finishGame(score), 400);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl select-none rounded-3xl border border-emerald-500/30 bg-slate-950 p-6 text-white shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
            <Hammer className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-emerald-300">
              Köstebek Avı
            </h2>
            <p className="text-xs text-slate-400">
              Doğru cevabı tutan köstebeğe hızla vur!
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
            <div className="rounded-xl bg-emerald-500/20 px-3 py-1 text-emerald-300">
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
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/40">
            <Hammer className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">Çekiçleri Hazırla!</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
            Köstebekler yuvalarından fırlayıp sayılar gösteriyor. Üstteki
            işlemin doğru cevabını tutan köstebeği kaçırmadan yakala ve vur!
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              <Play className="h-5 w-5" /> Oyunu Başlat
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          {/* Target Question Display */}
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 px-6 py-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                HEDEF İŞLEM
              </span>
              <div className="font-display text-3xl font-black text-white">
                {target.question}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Tur</span>
              <div className="font-display text-xl font-black text-emerald-300">
                #{round}
              </div>
            </div>
          </div>

          {/* 3x3 Mole Holes Grid */}
          <div className="grid grid-cols-3 gap-4 rounded-3xl border border-emerald-900/40 bg-emerald-950/30 p-5 shadow-inner">
            {Array.from({ length: 9 }).map((_, holeIndex) => {
              const activeMole = activeMoles.find(
                (m) => m.holeIndex === holeIndex,
              );
              const isWhacked = whackedHole === holeIndex;

              return (
                <div
                  key={holeIndex}
                  className="relative flex h-28 flex-col items-center justify-end overflow-hidden rounded-2xl border border-amber-950/60 bg-gradient-to-b from-amber-900/40 to-stone-900/90 p-2 shadow-inner"
                >
                  {/* Mole hole mound */}
                  <div className="absolute bottom-0 h-9 w-full rounded-t-full bg-stone-950/80 border-t border-amber-900/40" />

                  {/* Popping mole */}
                  <AnimatePresence>
                    {activeMole && (
                      <motion.div
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 60, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 25,
                        }}
                        onClick={() => whackMole(activeMole)}
                        className="relative z-10 flex cursor-pointer flex-col items-center select-none active:scale-95"
                      >
                        {/* Mole Character */}
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 shadow-md border-2 border-amber-900">
                          <span className="text-2xl">
                            {activeMole.isHit
                              ? activeMole.hitSuccess
                                ? '⭐'
                                : '😵'
                              : '🐹'}
                          </span>
                        </div>

                        {/* Signboard holding the number */}
                        <div
                          className={`mt-1 rounded-lg px-2.5 py-0.5 font-display text-base font-black shadow-md border ${
                            activeMole.isHit
                              ? activeMole.hitSuccess
                                ? 'bg-emerald-500 text-white border-emerald-300'
                                : 'bg-red-600 text-white border-red-300'
                              : 'bg-amber-100 text-slate-950 border-amber-400'
                          }`}
                        >
                          {activeMole.expression}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hammer whack animation overlay */}
                  {isWhacked && (
                    <motion.div
                      initial={{ scale: 1.5, rotate: -30, opacity: 1 }}
                      animate={{ scale: 1, rotate: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-amber-300"
                    >
                      <Hammer className="h-14 w-14 fill-amber-400" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 shadow-xl">
            <Trophy className="h-10 w-10" />
          </div>
          <h3 className="font-display text-3xl font-black text-white">
            Harika Av!
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Köstebeklerin hakkından geldin! İşte başarın:
          </p>

          <div className="mx-auto my-6 grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-white/5 p-4 border border-white/10">
            <div>
              <div className="text-xs text-slate-400">Toplam Skor</div>
              <div className="font-display text-2xl font-black text-amber-400">
                {score}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Ulaşılan Tur</div>
              <div className="font-display text-2xl font-black text-emerald-400">
                #{round}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              <RotateCcw className="h-5 w-5" /> Tekrar Oyna
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
