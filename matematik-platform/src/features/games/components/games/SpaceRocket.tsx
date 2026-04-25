'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import { Flame, Play, RotateCcw, Rocket, Star, Trophy } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';

type RocketProblem = {
  answer: string;
  options: string[];
  prompt: ReactNode;
};

const makeRocketProblem = (level: number): RocketProblem => {
  const type = Math.floor(Math.random() * 3);

  if (type === 0) {
    const denominator = [2, 3, 4, 5, 6, 8][
      Math.floor(Math.random() * (level >= 4 ? 6 : 4))
    ];
    const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
    const percent = Math.round((numerator / denominator) * 100);
    const answer = `%${percent}`;
    const distractors = new Set<string>();
    [percent + 10, percent - 10, percent + 20, 100 - percent].forEach(
      (value) => {
        if (value > 0 && value < 100 && value !== percent) {
          distractors.add(`%${value}`);
        }
      },
    );
    while (distractors.size < 3) {
      distractors.add(`%${Math.floor(Math.random() * 8 + 1) * 10}`);
    }
    return {
      answer,
      options: [answer, ...Array.from(distractors).slice(0, 3)].sort(
        () => Math.random() - 0.5,
      ),
      prompt: (
        <>
          <span className="text-cyan-200">
            {numerator}/{denominator}
          </span>{' '}
          kesrinin yüzde karşılığı nedir?
        </>
      ),
    };
  }

  if (type === 1) {
    const x = Math.floor(Math.random() * (level + 7)) + 2;
    const add = Math.floor(Math.random() * 12) + 3;
    const answer = String(x);
    const distractors = new Set<string>();
    [x + 1, x - 1, x + 2, add].forEach((value) => {
      if (value > 0 && value !== x) {
        distractors.add(String(value));
      }
    });
    while (distractors.size < 3) {
      distractors.add(String(Math.floor(Math.random() * 14) + 1));
    }
    return {
      answer,
      options: [answer, ...Array.from(distractors).slice(0, 3)].sort(
        () => Math.random() - 0.5,
      ),
      prompt: (
        <>
          <span className="text-violet-200">x + {add} = {x + add}</span>{' '}
          ise x kaçtır?
        </>
      ),
    };
  }

  const base = (Math.floor(Math.random() * 9) + 6) * 10;
  const pct = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
  const result = Math.round((base * pct) / 100);
  const answer = String(result);
  const distractors = new Set<string>();
  [result + 5, result - 5, result + 10, base - result].forEach((value) => {
    if (value > 0 && value !== result) {
      distractors.add(String(value));
    }
  });
  while (distractors.size < 3) {
    distractors.add(String(Math.floor(Math.random() * 60) + 10));
  }
  return {
    answer,
    options: [answer, ...Array.from(distractors).slice(0, 3)].sort(
      () => Math.random() - 0.5,
    ),
    prompt: (
      <>
        <span className="text-amber-200">{base}</span> sayısının{' '}
        <span className="text-amber-200">%{pct}</span>&apos;i kaçtır?
      </>
    ),
  };
};

export function SpaceRocket({ onScore, scoreMultiplier }: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [fuel, setFuel] = useState(100);
  const [stars, setStars] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [problem, setProblem] = useState<RocketProblem>(() =>
    makeRocketProblem(1),
  );
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const scoreRecordedRef = useRef(false);

  const nextProblem = useCallback((nextLevel: number) => {
    setProblem(makeRocketProblem(nextLevel));
    setSelectedGate(null);
    setFeedback(null);
  }, []);

  const finishGame = useCallback(
    (finalScore: number) => {
      setGameState('ended');
      if (!scoreRecordedRef.current) {
        scoreRecordedRef.current = true;
        onScore(finalScore);
      }
    },
    [onScore],
  );

  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          finishGame(score);
          return 0;
        }
        return currentTime - 1;
      });
      setFuel((currentFuel) => {
        if (currentFuel <= 1) {
          finishGame(score);
          return 0;
        }
        return currentFuel - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finishGame, gameState, score]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setFuel(100);
    setStars(0);
    setTimeLeft(75);
    scoreRecordedRef.current = false;
    nextProblem(1);
  };

  const chooseGate = (option: string) => {
    if (selectedGate !== null || gameState !== 'playing') {
      return;
    }

    setSelectedGate(option);

    if (option === problem.answer) {
      const nextStars = stars + 1;
      const nextLevel = nextStars % 4 === 0 ? Math.min(level + 1, 10) : level;
      const earned =
        (18 * level + (nextStars % 4 === 0 ? 25 : 0)) * scoreMultiplier;
      setScore((currentScore) => currentScore + earned);
      setStars(nextStars);
      setLevel(nextLevel);
      setFuel((currentFuel) => Math.min(100, currentFuel + 8));
      setFeedback('correct');
      window.setTimeout(() => nextProblem(nextLevel), 700);
      return;
    }

    setFuel((currentFuel) => {
      const nextFuel = Math.max(0, currentFuel - 18);
      if (nextFuel <= 0) {
        window.setTimeout(() => finishGame(score), 400);
      }
      return nextFuel;
    });
    setFeedback('wrong');
    window.setTimeout(() => nextProblem(level), 750);
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
            animate={{ y: [0, -16, 0], rotate: [-8, 8, -8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-sky-500 to-amber-400 shadow-lg shadow-sky-500/30"
          >
            <Rocket className="h-16 w-16 text-white" />
          </motion.div>
          <h2 className="mb-4 text-3xl font-bold text-white">Uzay Roketi</h2>
          <p className="mx-auto mb-6 max-w-md text-slate-400">
            Roketi doğru cevap kapısına uçur. Yıldızları topla, yakıtı bitirme!
          </p>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-amber-400 px-8 py-4 text-xl font-bold text-white shadow-lg shadow-indigo-500/30"
        >
          <Play className="mr-2 inline h-6 w-6" />
          Roketi Fırlat
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
          animate={{ y: [0, -10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-indigo-500"
        >
          <Trophy className="h-16 w-16 text-white" />
        </motion.div>
        <h2 className="mb-2 text-3xl font-bold text-white">Görev Tamamlandı!</h2>
        <p className="mb-2 text-5xl font-bold text-amber-300">{score} Puan</p>
        <p className="mb-8 text-slate-400">{stars} yıldız topladın.</p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-amber-400 px-8 py-4 text-xl font-bold text-white"
        >
          <RotateCcw className="mr-2 inline h-6 w-6" />
          Tekrar Uç
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl bg-black/50 px-4 py-2 font-bold text-white backdrop-blur-sm">
          Puan: <span className="text-amber-300">{score}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-black/50 px-4 py-2 font-bold text-white backdrop-blur-sm">
          <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
          {stars}
        </div>
        <div className="rounded-xl bg-black/50 px-4 py-2 font-bold text-white backdrop-blur-sm">
          Seviye {level}
        </div>
        <div className="rounded-xl bg-black/50 px-4 py-2 font-bold text-white backdrop-blur-sm">
          {timeLeft}s
        </div>
      </div>

      <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-700">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
          animate={{ width: `${fuel}%` }}
          style={{ width: `${fuel}%` }}
        />
      </div>

      <div className="relative mb-8 min-h-72 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900 p-6 shadow-2xl">
        {Array.from({ length: 22 }).map((_, index) => (
          <motion.span
            key={index}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
            transition={{
              delay: index * 0.12,
              duration: 2.4,
              repeat: Infinity,
            }}
            className="absolute h-1.5 w-1.5 rounded-full bg-white"
            style={{
              left: `${(index * 37) % 96}%`,
              top: `${(index * 53) % 82}%`,
            }}
          />
        ))}

        <motion.div
          animate={{
            x: feedback === 'correct' ? [0, 120, 0] : [0, -8, 8, 0],
            y: [0, -8, 0],
          }}
          transition={{
            duration: feedback === 'correct' ? 0.65 : 2,
            repeat: feedback ? 0 : Infinity,
          }}
          className="absolute bottom-8 left-8 flex items-center gap-2"
        >
          <Rocket className="h-20 w-20 rotate-45 text-cyan-200 drop-shadow-[0_0_24px_rgba(125,211,252,0.8)]" />
          <motion.span
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.45, repeat: Infinity }}
          >
            <Flame className="h-10 w-10 -rotate-90 text-orange-400" />
          </motion.span>
        </motion.div>

        <div className="relative z-10 ml-auto max-w-xl rounded-3xl bg-white/10 p-5 text-center backdrop-blur-md">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-200">
            Doğru kapıyı seç
          </p>
          <p className="mt-2 text-2xl font-bold leading-relaxed text-white md:text-3xl">
            {problem.prompt}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {problem.options.map((option, index) => {
          const selected = selectedGate === option;
          const correct = option === problem.answer;
          return (
            <motion.button
              key={`${problem.answer}-${option}`}
              type="button"
              whileHover={{ y: -4, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              animate={
                selected
                  ? {
                      boxShadow: correct
                        ? '0 0 36px rgba(52, 211, 153, 0.75)'
                        : '0 0 28px rgba(251, 113, 133, 0.65)',
                      scale: correct ? 1.08 : 0.96,
                    }
                  : {}
              }
              onClick={() => chooseGate(option)}
              className={`min-h-24 rounded-3xl border px-4 py-5 text-3xl font-black text-white transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60 ${
                selected
                  ? correct
                    ? 'border-emerald-300 bg-emerald-500/70'
                    : 'border-rose-300 bg-rose-500/70'
                  : index % 2 === 0
                    ? 'border-cyan-300/30 bg-cyan-500/20 hover:bg-cyan-500/30'
                    : 'border-amber-300/30 bg-amber-500/20 hover:bg-amber-500/30'
              }`}
              aria-label={`${option} kapısını seç`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {feedback && (
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`mt-6 text-center text-2xl font-black ${
            feedback === 'correct' ? 'text-emerald-300' : 'text-rose-300'
          }`}
        >
          {feedback === 'correct'
            ? 'Roket hızlandı, yıldız topladın!'
            : 'Yanlış kapı, yakıt azaldı!'}
        </motion.p>
      )}
    </div>
  );
}
