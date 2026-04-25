'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';

type BalloonProblem = {
  answer: number;
  options: number[];
  question: string;
};

const balloonColors = [
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-blue-500',
  'from-amber-300 to-orange-500',
  'from-emerald-400 to-teal-500',
];

const makeProblem = (level: number): BalloonProblem => {
  const operation = Math.floor(Math.random() * 4);
  let answer = 0;
  let question = '';

  if (operation === 0) {
    const a = Math.floor(Math.random() * (level * 12)) + 4;
    const b = Math.floor(Math.random() * (level * 10)) + 3;
    answer = a + b;
    question = `${a} + ${b}`;
  } else if (operation === 1) {
    const a = Math.floor(Math.random() * (level * 15)) + 12;
    const b = Math.floor(Math.random() * Math.min(a - 1, level * 9)) + 2;
    answer = a - b;
    question = `${a} - ${b}`;
  } else if (operation === 2) {
    const a = Math.floor(Math.random() * Math.min(9, level + 5)) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    answer = a * b;
    question = `${a} × ${b}`;
  } else {
    const divisor = Math.floor(Math.random() * 8) + 2;
    answer = Math.floor(Math.random() * Math.min(10, level + 6)) + 2;
    question = `${divisor * answer} ÷ ${divisor}`;
  }

  const wrongAnswers = new Set<number>();
  while (wrongAnswers.size < 3) {
    const offset = Math.floor(Math.random() * 15) - 7;
    const wrong = answer + (offset === 0 ? level + 2 : offset);
    if (wrong > 0 && wrong !== answer) {
      wrongAnswers.add(wrong);
    }
  }

  return {
    answer,
    options: [answer, ...Array.from(wrongAnswers)].sort(
      () => Math.random() - 0.5,
    ),
    question,
  };
};

export function BalloonPop({ onScore, scoreMultiplier }: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(70);
  const [problem, setProblem] = useState<BalloonProblem>(() => makeProblem(1));
  const [burstOption, setBurstOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const floatingDelays = useMemo(() => [0, 0.2, 0.4, 0.6], []);

  const nextProblem = useCallback((nextLevel: number) => {
    setProblem(makeProblem(nextLevel));
    setBurstOption(null);
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          setGameState('ended');
          onScore(score);
          return 0;
        }
        return currentTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, onScore, score]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setStreak(0);
    setRound(1);
    setTimeLeft(70);
    nextProblem(1);
  };

  const finishGame = (finalScore: number) => {
    setGameState('ended');
    onScore(finalScore);
  };

  const chooseOption = (option: number) => {
    if (burstOption !== null || gameState !== 'playing') {
      return;
    }

    setBurstOption(option);

    if (option === problem.answer) {
      const nextStreak = streak + 1;
      const nextLevel = round % 5 === 0 ? Math.min(level + 1, 10) : level;
      const bonus = nextStreak >= 5 ? 20 : nextStreak >= 3 ? 10 : 0;
      const earned = (14 * level + bonus) * scoreMultiplier;
      setScore((currentScore) => currentScore + earned);
      setStreak(nextStreak);
      setRound((currentRound) => currentRound + 1);
      setLevel(nextLevel);
      setFeedback('correct');

      window.setTimeout(() => nextProblem(nextLevel), 650);
      return;
    }

    setStreak(0);
    setFeedback('wrong');
    setLives((currentLives) => {
      const nextLives = currentLives - 1;
      if (nextLives <= 0) {
        window.setTimeout(() => finishGame(score), 550);
      } else {
        window.setTimeout(() => nextProblem(level), 650);
      }
      return Math.max(0, nextLives);
    });
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
            animate={{ y: [0, -12, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-fuchsia-500 to-cyan-400 shadow-lg shadow-pink-500/30"
          >
            <Sparkles className="h-16 w-16 text-white" />
          </motion.div>
          <h2 className="mb-4 text-3xl font-bold text-white">
            Balon Patlatma
          </h2>
          <p className="mx-auto mb-6 max-w-md text-slate-400">
            İşlemi çöz, doğru cevabın balonunu patlat. Seri yapınca puanlar
            parlıyor!
          </p>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 px-8 py-4 text-xl font-bold text-white shadow-lg shadow-cyan-500/30"
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
          animate={{ scale: [1, 1.14, 1], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-pink-500"
        >
          <Trophy className="h-16 w-16 text-white" />
        </motion.div>
        <h2 className="mb-2 text-3xl font-bold text-white">Balonlar Harika!</h2>
        <p className="mb-2 text-5xl font-bold text-pink-300">{score} Puan</p>
        <p className="mb-8 text-slate-400">{round - 1} balon turu oynadın.</p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 px-8 py-4 text-xl font-bold text-white"
        >
          <RotateCcw className="mr-2 inline h-6 w-6" />
          Tekrar Oyna
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl bg-black/50 px-4 py-2 font-bold text-white backdrop-blur-sm">
          Puan: <span className="text-pink-300">{score}</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Heart
              key={index}
              className={`h-7 w-7 ${
                index < lives
                  ? 'fill-red-500 text-red-500'
                  : 'text-slate-600'
              }`}
            />
          ))}
        </div>
        <div className="rounded-xl bg-black/50 px-4 py-2 font-bold text-white backdrop-blur-sm">
          {timeLeft}s
        </div>
      </div>

      <motion.div
        key={problem.question}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-950 p-7 text-center shadow-2xl"
      >
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-300">
          Seviye {level} · Seri {streak}
        </p>
        <p className="text-5xl font-black text-white sm:text-6xl">
          {problem.question}
        </p>
        <p className="mt-3 text-slate-400">Doğru cevabın balonunu patlat.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {problem.options.map((option, index) => {
          const isBurst = burstOption === option;
          const isCorrect = option === problem.answer;
          return (
            <motion.button
              key={`${problem.question}-${option}`}
              type="button"
              initial={{ y: 30, opacity: 0 }}
              animate={{
                y: isBurst ? -18 : [0, -10, 0],
                opacity: isBurst && !isCorrect ? 0.45 : 1,
                scale: isBurst ? (isCorrect ? 1.18 : 0.92) : 1,
              }}
              transition={{
                delay: floatingDelays[index],
                duration: isBurst ? 0.35 : 2.2,
                repeat: isBurst ? 0 : Infinity,
              }}
              onClick={() => chooseOption(option)}
              className={`relative min-h-44 overflow-hidden rounded-[2rem] bg-gradient-to-br ${balloonColors[index]} p-4 text-4xl font-black text-white shadow-xl transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60`}
              aria-label={`${option} cevabını seç`}
            >
              <span className="absolute inset-x-6 top-4 h-10 rounded-full bg-white/30 blur-sm" />
              {isBurst && isCorrect && (
                <motion.span
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  className="absolute inset-0 rounded-full border-8 border-white/70"
                />
              )}
              <span className="relative z-10">{option}</span>
              <span className="absolute bottom-0 left-1/2 h-10 w-0.5 -translate-x-1/2 bg-white/50" />
            </motion.button>
          );
        })}
      </div>

      {feedback && (
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`mt-6 text-center text-2xl font-black ${
            feedback === 'correct' ? 'text-emerald-300' : 'text-rose-300'
          }`}
        >
          {feedback === 'correct' ? 'Patladı! Harika cevap.' : 'Yaklaştın, tekrar dene!'}
        </motion.p>
      )}
    </div>
  );
}
