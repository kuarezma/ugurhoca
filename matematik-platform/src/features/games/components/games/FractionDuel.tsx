'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import {
  FractionBlock,
  mathClass,
} from '@/features/games/components/math/MathTypography';

type Cmp = 'left' | 'right' | 'equal';

function compareFrac(a: number, b: number, c: number, d: number): Cmp {
  const l = a * d;
  const r = c * b;
  if (l === r) return 'equal';
  return l > r ? 'left' : 'right';
}

export function FractionDuel({ onScore }: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [left, setLeft] = useState<[number, number]>([1, 2]);
  const [right, setRight] = useState<[number, number]>([1, 3]);
  const [answer, setAnswer] = useState<Cmp>('left');
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState('ended');
          onScore(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, onScore, score]);

  const generateProblem = useCallback(() => {
    for (let attempt = 0; attempt < 80; attempt++) {
      const b = Math.floor(Math.random() * 11) + 4;
      const d = Math.floor(Math.random() * 11) + 4;
      const a = Math.floor(Math.random() * (b - 1)) + 1;
      const c = Math.floor(Math.random() * (d - 1)) + 1;
      if (a >= b || c >= d) continue;
      const cmp = compareFrac(a, b, c, d);
      if (level >= 3 && cmp === 'equal') continue;
      setLeft([a, b]);
      setRight([c, d]);
      setAnswer(cmp);
      setFeedback(null);
      return;
    }
    setLeft([2, 3]);
    setRight([3, 5]);
    setAnswer(compareFrac(2, 3, 3, 5));
    setFeedback(null);
  }, [level]);

  useEffect(() => {
    if (gameState === 'playing') generateProblem();
  }, [gameState, generateProblem]);

  const pick = (choice: Cmp) => {
    if (feedback !== null) return;
    if (choice === answer) {
      const bonus = streak > 3 ? 20 : streak > 1 ? 8 : 0;
      setScore((s) => s + 12 * level + bonus);
      setStreak((s) => s + 1);
      if (score >= level * 70) {
        setLevel((lv) => Math.min(lv + 1, 12));
      }
      setFeedback('correct');
      setTimeout(generateProblem, 700);
    } else {
      setStreak(0);
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        generateProblem();
      }, 900);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setStreak(0);
  };

  if (gameState === 'idle') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="mb-8">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-red-600"
          >
            <span className="text-5xl">⚔️</span>
          </motion.div>
          <h2 className="mb-4 text-3xl font-bold text-white">Kesir Düellosu</h2>
          <p className="mx-auto mb-6 max-w-md text-slate-400">
            İki kesri karşılaştır: hangisi büyük, hangisi küçük veya eşit?
            Zorlayıcı paydalar — 60 saniye!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-8 py-4 text-xl font-bold text-white shadow-lg"
        >
          <Play className="mr-2 inline h-6 w-6" />
          Oyunu Başlat
        </motion.button>
      </motion.div>
    );
  }

  if (gameState === 'ended') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500"
        >
          <Trophy className="h-16 w-16 text-white" />
        </motion.div>
        <h2 className="mb-2 text-3xl font-bold text-white">Süre Doldu!</h2>
        <p className="mb-2 text-5xl font-bold text-green-400">{score} Puan</p>
        <p className="mb-8 text-slate-400">Seviye {level}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-8 py-4 text-xl font-bold text-white"
        >
          <RotateCcw className="mr-2 inline h-6 w-6" />
          Tekrar Oyna
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="rounded-xl bg-black/50 px-4 py-2 font-bold text-white backdrop-blur-sm">
          Puan: <span className="text-green-400">{score}</span>
        </div>
        <div className="rounded-xl bg-black/50 px-4 py-2 font-bold text-white backdrop-blur-sm">
          Seviye <span className="text-rose-400">{level}</span>
        </div>
        <div className="rounded-xl bg-black/50 px-4 py-2 font-bold text-white backdrop-blur-sm">
          {timeLeft}s
        </div>
      </div>

      <motion.div
        animate={
          feedback === 'correct'
            ? { scale: [1, 1.04, 1] }
            : feedback === 'wrong'
              ? { x: [-8, 8, -8, 8, 0] }
              : {}
        }
        className={`mb-6 rounded-3xl border-2 bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center transition-colors ${
          feedback === 'correct'
            ? 'border-green-500'
            : feedback === 'wrong'
              ? 'border-red-500'
              : 'border-slate-700'
        }`}
      >
        <p
          className={`mb-6 text-sm font-semibold uppercase tracking-wider text-slate-500 ${mathClass}`}
        >
          Hangisi büyük?
        </p>
        <div
          className={`flex flex-wrap items-center justify-center gap-3 md:gap-6 ${mathClass}`}
        >
          <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
            <FractionBlock den={left[1]} num={left[0]} size="lg" />
          </div>
          <span
            className="select-none px-1 text-sm font-medium uppercase tracking-widest text-slate-500"
            aria-hidden
          >
            vs
          </span>
          <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
            <FractionBlock den={right[1]} num={right[0]} size="lg" />
          </div>
        </div>
        {feedback === 'wrong' && (
          <div
            className={`mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-red-400 ${mathClass}`}
          >
            <span>Doğru:</span>
            {answer === 'equal' ? (
              <span className="font-semibold">Eşitler</span>
            ) : answer === 'left' ? (
              <>
                <span>Sol</span>
                <FractionBlock den={left[1]} num={left[0]} size="sm" />
              </>
            ) : (
              <>
                <span>Sağ</span>
                <FractionBlock den={right[1]} num={right[0]} size="sm" />
              </>
            )}
          </div>
        )}
      </motion.div>

      {streak > 2 && (
        <div className="mb-4 rounded-xl border border-orange-500/30 bg-orange-500/20 px-4 py-2 text-center">
          <span className="font-bold text-orange-400">🔥 {streak} seri!</span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            {
              key: 'left' as Cmp,
              className:
                'border-rose-400/40 bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:brightness-110',
              label: (
                <span className="flex flex-col items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide opacity-95">
                    Sol büyük
                  </span>
                  <FractionBlock den={left[1]} num={left[0]} size="sm" />
                </span>
              ),
            },
            {
              key: 'equal' as Cmp,
              className:
                'border-amber-300/50 bg-gradient-to-br from-amber-400 to-yellow-400 text-slate-900 shadow-lg shadow-amber-400/30 hover:brightness-105',
              label: (
                <span className="flex flex-col items-center gap-1 py-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wide">
                    Eşit
                  </span>
                  <span className="text-3xl font-light leading-none" aria-hidden>
                    =
                  </span>
                </span>
              ),
            },
            {
              key: 'right' as Cmp,
              className:
                'border-cyan-400/40 bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-500/25 hover:brightness-110',
              label: (
                <span className="flex flex-col items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide opacity-95">
                    Sağ büyük
                  </span>
                  <FractionBlock den={right[1]} num={right[0]} size="sm" />
                </span>
              ),
            },
          ] as { key: Cmp; className: string; label: ReactNode }[]
        ).map(({ key, className, label }) => (
          <motion.button
            key={key}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={feedback !== null}
            onClick={() => pick(key)}
            className={`rounded-2xl border-2 px-2 py-4 text-center text-sm font-bold transition disabled:opacity-45 ${className}`}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
