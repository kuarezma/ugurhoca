'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Flame, Play, RotateCcw, Trophy } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';

export function MathPuzzle({ onScore }: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);

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

  const generateProblem = useCallback(() => {
    let a = 0;
    let b = 0;
    let answer = 0;

    const operators = level < 3 ? ['+', '-'] : ['+', '-', '×', '÷'];
    const op = operators[Math.floor(Math.random() * operators.length)];

    if (op === '+') {
      a = Math.floor(Math.random() * (level * 10)) + 1;
      b = Math.floor(Math.random() * (level * 10)) + 1;
      answer = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * (level * 10)) + 10;
      b = Math.floor(Math.random() * a);
      answer = a - b;
    } else if (op === '×') {
      a = Math.floor(Math.random() * (level * 3)) + 1;
      b = Math.floor(Math.random() * (level * 3)) + 1;
      answer = a * b;
    } else {
      b = Math.floor(Math.random() * 10) + 2;
      answer = Math.floor(Math.random() * 10) + 1;
      a = b * answer;
    }

    const wrongAnswers = new Set<number>();
    while (wrongAnswers.size < 3) {
      const wrong = answer + (Math.floor(Math.random() * 10) - 5);

      if (wrong !== answer && wrong > 0) {
        wrongAnswers.add(wrong);
      }
    }

    setProblem({ a, b, op, answer });
    setOptions(
      [answer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5),
    );
    setSelected(null);
    setCorrect(false);
  }, [level]);

  useEffect(() => {
    if (gameState === 'playing') {
      generateProblem();
    }
  }, [gameState, generateProblem, level]);

  const handleSelect = (option: number) => {
    if (selected !== null) {
      return;
    }

    setSelected(option);

    if (option === problem.answer) {
      setCorrect(true);
      setStreak((currentStreak) => currentStreak + 1);

      const bonus = streak > 3 ? 20 : 0;
      setScore((currentScore) => currentScore + 10 * level + bonus);

      setTimeout(() => {
        if (score > level * 100) {
          setLevel((currentLevel) => Math.min(currentLevel + 1, 10));
        }

        generateProblem();
      }, 800);
      return;
    }

    setStreak(0);
    setTimeout(() => {
      setSelected(null);
    }, 1000);
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
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center"
          >
            <Brain className="w-16 h-16 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Matematik Zihin Jimnastiği
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Zor matematik problemlerini çöz! Doğru cevap verdikçe seviye artar.
            60 saniyede en yüksek skoru yap!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl text-xl shadow-lg shadow-purple-500/30"
        >
          <Play className="w-6 h-6 inline mr-2" />
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
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
        >
          <Trophy className="w-16 h-16 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Süre Doldu!</h2>
        <p className="text-5xl font-bold text-green-400 mb-2">{score} Puan</p>
        <p className="text-slate-400 mb-2">Seviye {level}'e ulaştın!</p>
        <p className="text-slate-500 mb-8">Harika bir performans!</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl text-xl"
        >
          <RotateCcw className="w-6 h-6 inline mr-2" />
          Tekrar Oyna
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          Puan: <span className="text-green-400">{score}</span>
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          Seviye: <span className="text-purple-400">{level}</span>
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          {timeLeft}s
        </div>
      </div>

      <motion.div
        key={problem.answer}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-8 text-center"
      >
        <div className="text-6xl font-bold text-white mb-4">
          {problem.a} <span className="text-purple-400">{problem.op}</span>{' '}
          {problem.b}
        </div>
        <div className="text-slate-400 text-lg">= ?</div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: selected === null ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(option)}
            disabled={selected !== null}
            animate={
              selected === option
                ? correct
                  ? { backgroundColor: ['#22c55e'] }
                  : { backgroundColor: ['#ef4444'] }
                : {}
            }
            className={`py-6 rounded-2xl text-3xl font-bold transition-all ${
              selected === option
                ? correct
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700'
            }`}
          >
            {option}
          </motion.button>
        ))}
      </div>

      {streak > 3 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-bold text-center flex items-center justify-center gap-2"
        >
          <Flame className="w-6 h-6" />
          {streak} Doğru! Kombo Bonusu +{streak * 5}
        </motion.div>
      )}
    </div>
  );
}
