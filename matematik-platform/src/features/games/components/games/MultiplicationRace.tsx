'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';

export function MultiplicationRace({ onScore }: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [table, setTable] = useState(2);
  const [problem, setProblem] = useState({ a: 0, b: 0, answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tablesCompleted, setTablesCompleted] = useState<number[]>([]);

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
    const b = table;
    const a = Math.floor(Math.random() * 10) + 1;
    const answer = a * b;

    const wrongAnswers = new Set<number>();
    while (wrongAnswers.size < 3) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = answer + (offset === 0 ? 1 : offset);

      if (wrong !== answer && wrong > 0 && wrong <= 100) {
        wrongAnswers.add(wrong);
      }
    }

    setProblem({ a, b, answer });
    setOptions(
      [answer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5),
    );
    setSelected(null);
    setProgress((currentProgress) => currentProgress + 10);
  }, [table]);

  useEffect(() => {
    if (gameState === 'playing') {
      generateProblem();
    }
  }, [gameState, generateProblem]);

  const handleSelect = (option: number) => {
    if (selected !== null) {
      return;
    }

    setSelected(option);

    if (option === problem.answer) {
      setStreak((currentStreak) => currentStreak + 1);

      const bonus = streak > 4 ? 15 : streak > 2 ? 5 : 0;
      setScore((currentScore) => currentScore + 10 * level + bonus);

      if (progress >= 90) {
        setTablesCompleted((completedTables) => [...completedTables, table]);

        if (table < 9 + level) {
          setTable((currentTable) => currentTable + 1);
        } else if (level < 5) {
          setLevel((currentLevel) => currentLevel + 1);
          setTable(level + 2);
        }

        setProgress(0);
      }

      setTimeout(() => {
        generateProblem();
      }, 500);
      return;
    }

    setStreak(0);
    setTimeout(() => {
      setSelected(null);
    }, 800);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTable(2);
    setTimeLeft(60);
    setStreak(0);
    setProgress(0);
    setTablesCompleted([]);
  };

  const getTableColor = (currentTable: number) => {
    const colors = [
      '#f97316',
      '#ec4899',
      '#06b6d4',
      '#8b5cf6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#6366f1',
      '#14b8a6',
      '#a855f7',
    ];

    return colors[currentTable - 1] || '#8b5cf6';
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
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg"
            style={{
              boxShadow: '0 0 60px rgba(236, 72, 153, 0.4)',
            }}
          >
            <span className="text-5xl font-bold text-white">×</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Çarpım Tablosu Yarışı
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Çarpım tablosunu hızlıca öğren! Her seviyede yeni bir tablo
            açılıyor. 60 saniyede kaç tablo bitirebileceksin?
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[2, 3, 4, 5, 6, 7, 8, 9].map((currentTable) => (
              <span
                key={currentTable}
                className="px-3 py-1 rounded-full text-white font-bold"
                style={{ backgroundColor: getTableColor(currentTable) }}
              >
                {currentTable}×
              </span>
            ))}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl text-xl shadow-lg"
          style={{ boxShadow: '0 0 40px rgba(236, 72, 153, 0.4)' }}
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
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
          style={{ boxShadow: '0 0 60px rgba(16, 185, 129, 0.4)' }}
        >
          <Trophy className="w-16 h-16 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Süre Doldu!</h2>
        <p className="text-5xl font-bold text-green-400 mb-2">{score} Puan</p>
        <p className="text-slate-400 mb-2">
          {tablesCompleted.length} tablo tamamladın!
        </p>
        <p className="text-slate-500 mb-8">
          {tablesCompleted.length > 0 &&
            `Tamamlanan tablolar: ${tablesCompleted.join(', ')}`}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl text-xl"
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
          Seviye {level}
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          {timeLeft}s
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {[2, 3, 4, 5, 6, 7, 8, 9].map((currentTable) => (
          <motion.div
            key={currentTable}
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{
              backgroundColor: tablesCompleted.includes(currentTable)
                ? '#22c55e'
                : getTableColor(currentTable),
              opacity:
                table === currentTable
                  ? 1
                  : tablesCompleted.includes(currentTable)
                    ? 0.5
                    : 0.3,
              boxShadow:
                table === currentTable
                  ? `0 0 20px ${getTableColor(currentTable)}`
                  : 'none',
            }}
          >
            {currentTable}
          </motion.div>
        ))}
      </div>

      <div className="mb-4">
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            style={{ backgroundColor: getTableColor(table) }}
          />
        </div>
        <p className="text-center text-slate-400 text-sm mt-2">
          {table} çarpım tablosu: %{Math.round(progress)}
        </p>
      </div>

      <motion.div
        key={`${problem.answer}-${table}`}
        initial={{ scale: 0.8, opacity: 0, rotateX: 90 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-8 text-center"
        style={{
          boxShadow: `0 0 40px ${getTableColor(table)}33`,
        }}
      >
        <motion.div
          animate={selected === problem.answer ? { scale: [1, 1.1, 1] } : {}}
          className="text-7xl font-bold text-white mb-4"
        >
          {problem.a} <span style={{ color: getTableColor(table) }}>×</span>{' '}
          {problem.b}
        </motion.div>
        <div className="text-slate-400 text-2xl">= ?</div>

        {streak > 4 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 text-orange-400 font-bold text-lg"
          >
            🔥 {streak} Doğru! Harika gidiyorsun!
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: selected === null ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(option)}
            disabled={selected !== null}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`py-6 rounded-2xl text-3xl font-bold transition-all ${
              selected === option
                ? option === problem.answer
                  ? 'bg-green-500 text-white scale-110'
                  : 'bg-red-500 text-white'
                : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700'
            }`}
          >
            {option}
          </motion.button>
        ))}
      </div>

      {tablesCompleted.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center"
        >
          <p className="text-green-400 font-bold">🎉 Tamamlanan Tablolar!</p>
          <p className="text-white text-xl font-bold">
            {tablesCompleted.join(', ')}
          </p>
        </motion.div>
      )}
    </div>
  );
}
