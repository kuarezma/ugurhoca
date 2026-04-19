'use client';

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import {
  MathNum,
  MathRow,
  MathVar,
  mathClass,
} from '@/features/games/components/math/MathTypography';

type Problem = {
  display: ReactNode;
  answer: number;
  hint: string;
};

const sym = {
  eq: '=',
  minus: '\u2212',
  mul: '\u00d7',
  div: '\u00f7',
} as const;

export function EquationHunter({ onScore }: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState<Problem>({
    display: null,
    answer: 0,
    hint: '',
  });
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(75);
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
    const hard = level >= 4;
    const templates: (() => Problem)[] = [
      () => {
        const x = Math.floor(Math.random() * 12) + 2;
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 15) + 3;
        const c = a * x + b;
        return {
          answer: x,
          display: (
            <MathRow>
              <MathNum>{a}</MathNum>
              <MathVar>x</MathVar>
              <span className="text-slate-400">+</span>
              <MathNum>{b}</MathNum>
              <span className="px-1 text-slate-500">{sym.eq}</span>
              <MathNum>{c}</MathNum>
            </MathRow>
          ),
          hint: 'Önce sabit terimi karşıya at',
        };
      },
      () => {
        const x = Math.floor(Math.random() * 10) + 3;
        const a = Math.floor(Math.random() * 6) + 3;
        const b = Math.floor(Math.random() * 20) + 5;
        const c = a * x - b;
        return {
          answer: x,
          display: (
            <MathRow>
              <MathNum>{a}</MathNum>
              <MathVar>x</MathVar>
              <span className="text-slate-300">{sym.minus}</span>
              <MathNum>{b}</MathNum>
              <span className="px-1 text-slate-500">{sym.eq}</span>
              <MathNum>{c}</MathNum>
            </MathRow>
          ),
          hint: 'x terimini tek başına bırak',
        };
      },
      () => {
        const x = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 6) + 1;
        const k = Math.floor(Math.random() * 5) + 2;
        const rhs = k * (x + b);
        return {
          answer: x,
          display: (
            <MathRow>
              <MathNum>{k}</MathNum>
              <span className="text-slate-300">(</span>
              <MathVar>x</MathVar>
              <span className="text-slate-400">+</span>
              <MathNum>{b}</MathNum>
              <span className="text-slate-300">)</span>
              <span className="px-1 text-slate-500">{sym.eq}</span>
              <MathNum>{rhs}</MathNum>
            </MathRow>
          ),
          hint: 'Parantezi aç: k · (x + b) = k·x + k·b',
        };
      },
    ];

    if (hard) {
      templates.push(
        () => {
          const x = Math.floor(Math.random() * 8) + 2;
          const a = Math.floor(Math.random() * 4) + 2;
          const b = Math.floor(Math.random() * 8) + 2;
          const sum = a * x + b * x;
          return {
            answer: x,
            display: (
              <MathRow>
                <MathNum>{a}</MathNum>
                <MathVar>x</MathVar>
                <span className="text-slate-400">+</span>
                <MathNum>{b}</MathNum>
                <MathVar>x</MathVar>
                <span className="px-1 text-slate-500">{sym.eq}</span>
                <MathNum>{sum}</MathNum>
              </MathRow>
            ),
            hint: 'Soldaki x terimlerini topla',
          };
        },
        () => {
          const denom = Math.floor(Math.random() * 4) + 2;
          const k = Math.floor(Math.random() * 12) + 3;
          const x = k * denom;
          return {
            answer: x,
            display: (
              <MathRow>
                <MathVar>x</MathVar>
                <span className="px-1 text-slate-400">{sym.div}</span>
                <MathNum>{denom}</MathNum>
                <span className="px-1 text-slate-500">{sym.eq}</span>
                <MathNum>{k}</MathNum>
              </MathRow>
            ),
            hint: `Her iki tarafı ${denom} ile çarp`,
          };
        },
      );
    }

    const p = templates[Math.floor(Math.random() * templates.length)]();
    setProblem(p);
    setInput('');
    setFeedback(null);
  }, [level]);

  useEffect(() => {
    if (gameState === 'playing') generateProblem();
  }, [gameState, generateProblem]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    const value = parseInt(input.trim(), 10);
    if (Number.isNaN(value)) return;

    if (value === problem.answer) {
      const bonus = streak > 4 ? 18 : streak > 2 ? 8 : 0;
      setScore((s) => s + 14 * level + bonus);
      setStreak((s) => s + 1);
      if (score >= level * 85) {
        setLevel((lv) => Math.min(lv + 1, 12));
      }
      setFeedback('correct');
      setTimeout(generateProblem, 750);
      return;
    }
    setStreak(0);
    setFeedback('wrong');
    setTimeout(() => setFeedback(null), 1100);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTimeLeft(75);
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
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700"
          >
            <span className={`text-5xl ${mathClass} italic text-white`}>x</span>
          </motion.div>
          <h2 className="mb-4 text-3xl font-bold text-white">Denklem Avcısı</h2>
          <p className="mx-auto mb-6 max-w-md text-slate-400">
            x&apos;i bul: doğrusal denklemler, parantez ve bölme. İleri seviye —
            75 saniye!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-xl font-bold text-white shadow-lg"
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
          className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-xl font-bold text-white"
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
          Seviye <span className="text-violet-400">{level}</span>
        </div>
        <div className="rounded-xl bg-black/50 px-4 py-2 font-bold text-white backdrop-blur-sm">
          {timeLeft}s
        </div>
      </div>

      <motion.div
        animate={
          feedback === 'correct'
            ? { scale: [1, 1.05, 1] }
            : feedback === 'wrong'
              ? { x: [-10, 10, -10, 10, 0] }
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
        <div
          className={`mb-3 min-h-[3.5rem] text-3xl font-semibold text-white md:min-h-[4rem] md:text-4xl ${mathClass}`}
        >
          {problem.display}
        </div>
        <p className={`text-sm text-slate-400 ${mathClass}`}>{problem.hint}</p>
        {feedback === 'correct' && (
          <p className="mt-3 text-xl font-bold text-green-400">✓ Doğru!</p>
        )}
        {feedback === 'wrong' && (
          <p className={`mt-3 text-xl font-bold text-red-400 ${mathClass}`}>
            ✗ <MathVar>x</MathVar> = <MathNum>{problem.answer}</MathNum>
          </p>
        )}
      </motion.div>

      {streak > 3 && (
        <div className="mb-4 rounded-xl border border-orange-500/30 bg-orange-500/20 px-4 py-2 text-center">
          <span className="font-bold text-orange-400">🔥 {streak} kombo!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="x = ?"
          // eslint-disable-next-line jsx-a11y/no-autofocus -- oyun ekranında hızlı giriş
          autoFocus
          className={`flex-1 rounded-2xl border border-slate-700 bg-slate-800 px-6 py-4 text-center text-2xl font-bold text-white transition-colors focus:border-violet-500 focus:outline-none ${mathClass}`}
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-xl font-bold text-white shadow-lg shadow-violet-500/25"
        >
          Gönder
        </motion.button>
      </form>
    </div>
  );
}
