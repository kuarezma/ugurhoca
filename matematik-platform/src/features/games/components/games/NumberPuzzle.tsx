'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import type { FormEvent } from 'react';
import type { GameComponentProps } from '@/features/games/types';

type NumberProblem = {
  answer: number;
  hint: string;
  text: string;
};

export function NumberPuzzle({ onScore }: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState<NumberProblem>({
    text: '',
    answer: 0,
    hint: '',
  });
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(90);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

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
    const templates = [
      () => {
        const a = Math.floor(Math.random() * 20) + 5;
        const b = Math.floor(Math.random() * 20) + 5;
        return { text: `${a} + ${b} = ?`, answer: a + b, hint: `${a} + ${b}` };
      },
      () => {
        const a = Math.floor(Math.random() * 30) + 10;
        const b = Math.floor(Math.random() * Math.min(a, 20)) + 1;
        return { text: `${a} - ${b} = ?`, answer: a - b, hint: `${a} - ${b}` };
      },
      () => {
        const a = Math.floor(Math.random() * 12) + 2;
        const b = Math.floor(Math.random() * 12) + 2;
        return { text: `${a} × ${b} = ?`, answer: a * b, hint: `${a} × ${b}` };
      },
      () => {
        const b = Math.floor(Math.random() * 10) + 2;
        const answer = Math.floor(Math.random() * 10) + 1;
        const a = b * answer;
        return { text: `${a} ÷ ${b} = ?`, answer, hint: `${a} ÷ ${b}` };
      },
      () => {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 50) + 10;
        return {
          text: `${a} + ${b} + ? = ${a + b + 10}`,
          answer: 10,
          hint: 'Eksik sayıyı bul',
        };
      },
      () => {
        const n = Math.floor(Math.random() * 5) + 2;
        return { text: `${n}² = ?`, answer: n ** 2, hint: 'Karesini al' };
      },
      () => {
        const n = Math.floor(Math.random() * 5) + 2;
        return { text: `${n}³ = ?`, answer: n ** 3, hint: 'Küpünü al' };
      },
      () => {
        const n = Math.floor(Math.random() * 10) + 2;
        return { text: `√${n * n} = ?`, answer: n, hint: 'Karekök al' };
      },
      () => {
        const a = Math.floor(Math.random() * 10) + 2;
        const b = Math.floor(Math.random() * 10) + 2;
        const c = a + b;
        return { text: `? + ${b} = ${c}`, answer: a, hint: `${c} - ${b}` };
      },
      () => {
        const a = Math.floor(Math.random() * 20) + 10;
        const b = Math.floor(Math.random() * 10) + 5;
        return {
          text: `(${a} + ${b}) × 2 = ?`,
          answer: (a + b) * 2,
          hint: 'Önce parantez, sonra çarp',
        };
      },
    ];

    const nextProblem =
      templates[Math.floor(Math.random() * templates.length)]();
    setProblem(nextProblem);
    setInput('');
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      generateProblem();
    }
  }, [gameState, generateProblem, level]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!input.trim()) {
      return;
    }

    const value = parseInt(input.trim(), 10);
    if (value === problem.answer) {
      const bonus = streak > 4 ? 15 : streak > 2 ? 5 : 0;
      setScore((currentScore) => currentScore + 10 * level + bonus);
      setStreak((currentStreak) => currentStreak + 1);

      if (score >= level * 80) {
        setLevel((currentLevel) => Math.min(currentLevel + 1, 10));
      }

      setFeedback('correct');
      setTimeout(generateProblem, 800);
      return;
    }

    setStreak(0);
    setFeedback('wrong');
    setTimeout(() => setFeedback(null), 1000);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTimeLeft(90);
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
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center"
          >
            <span className="text-5xl">🔢</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Sayı Bulmaca</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Eksik sayıyı bul! Dört işlem, kare, küp, karekök... 90 saniyede en
            yüksek skoru yap!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl text-xl shadow-lg"
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
        <p className="text-slate-400 mb-8">Seviye {level}'e ulaştın!</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl text-xl"
        >
          <RotateCcw className="w-6 h-6 inline mr-2" />
          Tekrar Oyna
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          Puan: <span className="text-green-400">{score}</span>
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          Seviye <span className="text-amber-400">{level}</span>
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
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
        className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-6 text-center border-2 transition-colors ${
          feedback === 'correct'
            ? 'border-green-500'
            : feedback === 'wrong'
              ? 'border-red-500'
              : 'border-slate-700'
        }`}
      >
        <p className="text-5xl font-bold text-white mb-2">{problem.text}</p>
        <p className="text-slate-500 text-sm mt-2">{problem.hint}</p>
        {feedback === 'correct' && (
          <p className="text-green-400 font-bold text-xl mt-3">✓ Doğru!</p>
        )}
        {feedback === 'wrong' && (
          <p className="text-red-400 font-bold text-xl mt-3">
            ✗ Yanlış! Doğru cevap: {problem.answer}
          </p>
        )}
      </motion.div>

      {streak > 3 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-xl text-center"
        >
          <span className="text-orange-400 font-bold">🔥 {streak} Kombo!</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="number"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Cevabını yaz..."
          autoFocus
          className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white text-2xl font-bold text-center focus:outline-none focus:border-amber-500 transition-colors"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl text-xl"
        >
          Gönder
        </motion.button>
      </form>
    </div>
  );
}
