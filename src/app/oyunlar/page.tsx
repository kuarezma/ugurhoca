'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Calculator, ArrowLeft, Play, RotateCcw, Trophy,
  Star, Zap, Target, Brain, Sparkles, Flame
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FloatingParticles = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: ['#f97316', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981'][i % 5],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -100, 0],
          opacity: [0.2, 0.8, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

const GameCard = ({ game, onClick }: { game: any; onClick: () => void }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="glass rounded-3xl overflow-hidden cursor-pointer transition-all"
  >
    <div className={`h-40 bg-gradient-to-br ${game.color} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-black/20" />
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${game.color.split(' ')[1]}, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <game.icon className="w-20 h-20 text-white/80" />
      </div>
      <div className="absolute top-3 right-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
        {game.grade}. Sınıf
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
      <p className="text-slate-400 text-sm mb-4">{game.description}</p>
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          {game.rating}
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-orange-400" />
          {game.difficulty}
        </span>
      </div>
    </div>
  </motion.div>
);

const MultiplicationRace = ({ onScore }: { onScore: (score: number) => void }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('ended');
          onScore(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, score, onScore]);

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
    setOptions([answer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5));
    setSelected(null);
    setProgress(p => p + 10);
  }, [table]);

  useEffect(() => {
    if (gameState === 'playing') generateProblem();
  }, [gameState, generateProblem]);

  const handleSelect = (opt: number) => {
    if (selected !== null) return;
    setSelected(opt);
    
    if (opt === problem.answer) {
      setStreak(s => s + 1);
      const bonus = streak > 4 ? 15 : streak > 2 ? 5 : 0;
      setScore(s => s + 10 * level + bonus);
      
      if (progress >= 90) {
        setTablesCompleted(tc => [...tc, table]);
        if (table < 9 + level) {
          setTable(t => t + 1);
        } else if (level < 5) {
          setLevel(lv => lv + 1);
          setTable(level + 2);
        }
        setProgress(0);
      }
      
      setTimeout(() => {
        generateProblem();
        inputRef.current?.focus();
      }, 500);
    } else {
      setStreak(0);
      setTimeout(() => {
        setSelected(null);
      }, 800);
    }
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

  const getTableColor = (t: number) => {
    const colors = ['#f97316', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#a855f7'];
    return colors[t - 1] || '#8b5cf6';
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
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg"
            style={{
              boxShadow: '0 0 60px rgba(236, 72, 153, 0.4)',
            }}
          >
            <span className="text-5xl font-bold text-white">×</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Çarpım Tablosu Yarışı</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Çarpım tablosunu hızlıca öğren! Her seviyede yeni bir tablo açılıyor. 60 saniyede kaç tablo bitirebileceksin?
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[2, 3, 4, 5, 6, 7, 8, 9].map(t => (
              <span key={t} className="px-3 py-1 rounded-full text-white font-bold" style={{ backgroundColor: getTableColor(t) }}>
                {t}×
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
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
          style={{ boxShadow: '0 0 60px rgba(16, 185, 129, 0.4)' }}
        >
          <Trophy className="w-16 h-16 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Süre Doldu!</h2>
        <p className="text-5xl font-bold text-green-400 mb-2">{score} Puan</p>
        <p className="text-slate-400 mb-2">{tablesCompleted.length} tablo tamamladın!</p>
        <p className="text-slate-500 mb-8">
          {tablesCompleted.length > 0 && `Tamamlanan tablolar: ${tablesCompleted.join(', ')}`}
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
        {[2, 3, 4, 5, 6, 7, 8, 9].map(t => (
          <motion.div
            key={t}
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{
              backgroundColor: tablesCompleted.includes(t) ? '#22c55e' : getTableColor(t),
              opacity: table === t ? 1 : tablesCompleted.includes(t) ? 0.5 : 0.3,
              boxShadow: table === t ? `0 0 20px ${getTableColor(t)}` : 'none',
            }}
          >
            {t}
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
          {problem.a} <span style={{ color: getTableColor(table) }}>×</span> {problem.b}
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
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: selected === null ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(opt)}
            disabled={selected !== null}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`py-6 rounded-2xl text-3xl font-bold transition-all ${
              selected === opt
                ? opt === problem.answer
                  ? 'bg-green-500 text-white scale-110'
                  : 'bg-red-500 text-white'
                : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700'
            }`}
          >
            {opt}
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
          <p className="text-white text-xl font-bold">{tablesCompleted.join(', ')}</p>
        </motion.div>
      )}
    </div>
  );
};

const MathPuzzle = ({ onScore }: { onScore: (score: number) => void }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('ended');
          onScore(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, score, onScore]);

  const generateProblem = useCallback(() => {
    let a, b, op, answer;
    const ops = level < 3 ? ['+', '-'] : ['+', '-', '×', '÷'];
    op = ops[Math.floor(Math.random() * ops.length)];
    
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
      const wrong: number = answer + (Math.floor(Math.random() * 10) - 5);
      if (wrong !== answer && wrong > 0) wrongAnswers.add(wrong);
    }

    setProblem({ a, b, op, answer });
    setOptions([answer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5));
    setSelected(null);
    setCorrect(false);
  }, [level]);

  useEffect(() => {
    if (gameState === 'playing') generateProblem();
  }, [gameState, level, generateProblem]);

  const handleSelect = (opt: number) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === problem.answer) {
      setCorrect(true);
      setStreak(s => s + 1);
      const bonus = streak > 3 ? 20 : 0;
      setScore(s => s + 10 * level + bonus);
      setTimeout(() => {
        if (score > level * 100) setLevel(l => Math.min(l + 1, 10));
        generateProblem();
      }, 800);
    } else {
      setStreak(0);
      setTimeout(() => {
        setSelected(null);
      }, 1000);
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
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center"
          >
            <Brain className="w-16 h-16 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Matematik Zihin Jimnastiği</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Zor matematik problemlerini çöz! Doğru cevap verdikçe seviye artar. 60 saniyede en yüksek skoru yap!
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
          {problem.a} <span className="text-purple-400">{problem.op}</span> {problem.b}
        </div>
        <div className="text-slate-400 text-lg">= ?</div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: selected === null ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(opt)}
            disabled={selected !== null}
            animate={
              selected === opt
                ? correct
                  ? { backgroundColor: ['#22c55e'] }
                  : { backgroundColor: ['#ef4444'] }
                : {}
            }
            className={`py-6 rounded-2xl text-3xl font-bold transition-all ${
              selected === opt
                ? correct
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700'
            }`}
          >
            {opt}
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
};

const ColorMath = ({ onScore }: { onScore: (score: number) => void }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState({ word: '', fontColor: '', askedColor: '', answer: true });
  const [timeLeft, setTimeLeft] = useState(8);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getRoundTime = useCallback((roundNumber: number) => {
    return Math.max(4, 8 - Math.floor((roundNumber - 1) / 3));
  }, []);

  const generateQuestion = useCallback(() => {
    const colors = ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Mor', 'Turuncu'];
    const word = colors[Math.floor(Math.random() * colors.length)];
    const fontColor = colors[Math.floor(Math.random() * colors.length)];

    const isTrueQuestion = Math.random() > 0.5;
    const askedColor = isTrueQuestion
      ? fontColor
      : colors.filter((c) => c !== fontColor)[Math.floor(Math.random() * (colors.length - 1))];

    setQuestion({
      word,
      fontColor,
      askedColor,
      answer: askedColor === fontColor,
    });
  }, []);

  const advanceRound = useCallback(() => {
    setRound((r) => {
      const nextRound = r + 1;
      setTimeLeft(getRoundTime(nextRound));
      return nextRound;
    });
    generateQuestion();
  }, [generateQuestion, getRoundTime]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            let gameOver = false;
            setLives((l) => {
              if (l <= 1) {
                gameOver = true;
                setGameState('ended');
                onScore(score);
                return 0;
              }
              return l - 1;
            });
            if (!gameOver) advanceRound();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current!);
    }
  }, [advanceRound, gameState, onScore, score]);

  const handleAnswer = (answer: boolean) => {
    if (answer === question.answer) {
      setScore(s => s + Math.floor(timeLeft * 10));
    } else {
      setLives(l => {
        if (l <= 1) {
          setGameState('ended');
          onScore(score);
        }
        return l - 1;
      });
    }
    advanceRound();
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setRound(0);
    setTimeLeft(getRoundTime(1));
    advanceRound();
  };

  const colorMap: Record<string, string> = {
    'Kırmızı': 'text-red-500',
    'Mavi': 'text-blue-500',
    'Yeşil': 'text-green-500',
    'Sarı': 'text-yellow-400',
    'Mor': 'text-purple-500',
    'Turuncu': 'text-orange-500',
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
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center"
          >
            <Sparkles className="w-16 h-16 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Renkli Matematik</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Bu zorlu oyunda, renkli yazılmış kelimeleri oku! Yazı rengi mi yoksa yazılan renk mi doğru? 3 can hakkın var!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-2xl text-xl shadow-lg shadow-cyan-500/30"
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
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center"
        >
          <Trophy className="w-16 h-16 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Oyun Bitti!</h2>
        <p className="text-5xl font-bold text-cyan-400 mb-2">{score} Puan</p>
        <p className="text-slate-400 mb-2">{round} soru cevapladın</p>
        <p className="text-slate-500 mb-8">Gözlem yeteneğin harika!</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-2xl text-xl"
        >
          <RotateCcw className="w-6 h-6 inline mr-2" />
          Tekrar Oyna
        </motion.button>
      </motion.div>
    );
  }

  const currentRoundTime = getRoundTime(Math.max(round, 1));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          Puan: <span className="text-cyan-400">{score}</span>
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={i < lives ? { scale: [1, 1.2, 1] } : { opacity: 0.3 }}
              className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-sm">♥</span>
            </motion.div>
          ))}
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          {round}. Soru
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-12 mb-8 text-center"
      >
        <p className="text-3xl sm:text-4xl font-bold mb-8 text-slate-200">
          Yazının rengi <span className="text-cyan-300">{question.askedColor}</span> mi?
        </p>
        <motion.p
          key={`${question.word}-${question.fontColor}-${round}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-7xl font-bold ${colorMap[question.fontColor] || 'text-white'}`}
        >
          {question.word}
        </motion.p>
        <p className="text-slate-500 mt-6 text-sm">Kelimeyi değil yazı rengini takip et.</p>
      </motion.div>

      <div className="mb-6">
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / currentRoundTime) * 100}%` }}
            style={{ width: `${(timeLeft / currentRoundTime) * 100}%` }}
          />
        </div>
        <p className="text-center text-slate-400 mt-2">{timeLeft} saniye</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAnswer(true)}
          className="py-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl text-white text-2xl font-bold"
        >
          ✓ Doğru
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAnswer(false)}
          className="py-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl text-white text-2xl font-bold"
        >
          ✗ Yanlış
        </motion.button>
      </div>
    </div>
  );
};

const mathTerms = [
  'ÇARPIM', 'BÖLÜM', 'FAKTÖRİYEL', 'POLİNOM', 'EŞİTSİZLİK', 'FONKSİYON', 'PERMÜTASYON', 'KOMBİNASYON', 'ORAN', 'ORANTI',
  'KESİR', 'PAYDA', 'PAY', 'DOĞRU', 'DÜZLEM', 'AÇI', 'KÖŞEGEN', 'ÇEMBER', 'DAİRE', 'YARIÇAP',
  'ÇAP', 'TEĞET', 'ALAN', 'ÇEVRE', 'YÜKSEKLİK', 'TABAN', 'KENAR', 'KÖŞE', 'AÇIORTAY', 'Kenarortay',
  'ASAL', 'POZİTİF', 'NEGATİF', 'TAMSAYI', 'DOĞALSayi', 'RASYONEL', 'İRRASYONEL', 'REEL', 'KÜME', 'ELEMEN',
  'KESİŞİM', 'BİRLEŞİM', 'FARK', 'TÜMLEME', 'ALT KÜME', 'BOŞ KÜME', 'EVrensel', 'ARİTMETİK', 'CEBİR', 'GEOMETRİ',
  'İSTATİSTİK', 'ORTAÇEMBER', 'YÜKSEKLİK', 'ÖTELEME', 'DÖNÜŞÜM', 'SİMETRİ', 'ÜÇGEN', 'DÖRTGEN', 'BEŞGEN', 'ALTIGEN',
  'PARALEL', 'DİK', 'EĞİK', 'AÇI', 'TÜM', 'YAN', 'TERS', 'DÜZ AÇI', 'DAR AÇI', 'GENİŞ AÇI',
  'ÖKLİT', 'PİSAGOR', 'THALES', 'SİNÜS', 'KOSİNÜS', 'TANJANT', 'KOTANJANT', 'SEKANT', 'KOSEKANT',
  'LOGARİTMA', 'ÜSTEL', 'POZİTİF', 'NEGATİF', 'SIFIR', 'BİR', 'İKİ', 'ÜÇ', 'ONDALIK', 'TAMSAYI',
  'DENKLEM', 'EŞİTSİZLİK', 'SİSTEM', 'MATRİS', 'DETERMİNANT', 'VEKTÖR', 'SKALER', 'DİZİ', 'SERİ', 'LİMİT',
];

const Hangman = ({ onScore }: { onScore: (score: number) => void }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [hint, setHint] = useState('');

  const maxWrong = 6;

  const startGame = () => {
    const idx = Math.floor(Math.random() * mathTerms.length);
    setWord(mathTerms[idx]);
    setGuessed(new Set());
    setScore(0);
    setRound(1);
    setHint('');
    setGameState('playing');
  };

  const getDisplay = () =>
    word.split('').map(c => guessed.has(c) ? c : '_').join(' ');

  const wrongCount = [...guessed].filter(c => !word.includes(c)).length;

  const handleGuess = (letter: string) => {
    if (guessed.has(letter) || gameState !== 'playing') return;
    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    const newWon = word.split('').every(c => newGuessed.has(c));
    const newWrongCount = [...newGuessed].filter(c => !word.includes(c)).length;
    const newLost = newWrongCount >= maxWrong;

    if (newWon) {
      setScore(s => s + (maxWrong - newWrongCount) * 10 + 50);
      setGameState('won');
      setTimeout(() => {
        setRound(r => r + 1);
        const idx = Math.floor(Math.random() * mathTerms.length);
        setWord(mathTerms[idx]);
        setGuessed(new Set());
        setGameState('playing');
      }, 1500);
    }
    if (newLost) {
      setGameState('lost');
      onScore(score);
    }
  };

  // Win/loss detection is now handled directly in handleGuess

  // wrongCount is defined above near handleGuess

  const parts = [
    <line key="base" x1="10" y1="140" x2="60" y2="140" stroke="currentColor" strokeWidth="3" />,
    <line key="pole" x1="35" y1="140" x2="35" y2="10" stroke="currentColor" strokeWidth="3" />,
    <line key="top" x1="35" y1="10" x2="80" y2="10" stroke="currentColor" strokeWidth="3" />,
    <line key="rope" x1="80" y1="10" x2="80" y2="30" stroke="currentColor" strokeWidth="3" />,
  ];
  const bodyParts = [
    <circle key="head" cx="80" cy="40" r="10" stroke="currentColor" strokeWidth="3" fill="none" />,
    <line key="body" x1="80" y1="50" x2="80" y2="85" stroke="currentColor" strokeWidth="3" />,
    <line key="larm" x1="80" y1="60" x2="65" y2="75" stroke="currentColor" strokeWidth="3" />,
    <line key="rarm" x1="80" y1="60" x2="95" y2="75" stroke="currentColor" strokeWidth="3" />,
    <line key="lleg" x1="80" y1="85" x2="65" y2="110" stroke="currentColor" strokeWidth="3" />,
    <line key="rleg" x1="80" y1="85" x2="95" y2="110" stroke="currentColor" strokeWidth="3" />,
  ];

  if (gameState === 'idle') {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <div className="mb-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center"
          >
            <span className="text-5xl">🔤</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Matematik Adam Asmaca</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Matematik terimlerini tahmin et! Her yanlış tahmin bir parça kaybettirir. 6 yanlış hakkın var!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl text-xl shadow-lg"
        >
          <Play className="w-6 h-6 inline mr-2" />Oyunu Başlat
        </motion.button>
      </motion.div>
    );
  }

  if (gameState === 'lost') {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
          <span className="text-5xl">💀</span>
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Kaybettin!</h2>
        <p className="text-2xl text-white mb-2">Doğru cevap: <span className="text-yellow-400 font-bold">{word}</span></p>
        <p className="text-4xl font-bold text-green-400 mb-6">{score} Puan</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl text-xl">
          <RotateCcw className="w-6 h-6 inline mr-2" />Tekrar Oyna
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
          Tur {round}
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          Kalan: {maxWrong - wrongCount} ❌
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <svg width="150" height="150" className="text-slate-300">
          {parts.map((p, i) => i < wrongCount ? p : <g key={i} />)}
          {bodyParts.map((p, i) => i < wrongCount - 1 ? p : <g key={i} />)}
        </svg>
      </div>

      <motion.div
        animate={gameState === 'won' ? { scale: [1, 1.05, 1] } : {}}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-8 text-center"
      >
        <div className="text-5xl font-bold text-white tracking-widest mb-4">
          {getDisplay()}
        </div>
        {gameState === 'won' && (
          <p className="text-green-400 font-bold text-xl">🎉 Doğru bildin!</p>
        )}
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('').map(letter => (
          <motion.button
            key={letter}
            whileHover={{ scale: guessed.has(letter) ? 1 : 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleGuess(letter)}
            disabled={guessed.has(letter) || gameState !== 'playing'}
            className={`w-10 h-10 rounded-xl font-bold text-lg transition-all ${
              guessed.has(letter)
                ? word.includes(letter)
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500/40 text-red-300'
                : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700'
            }`}
          >
            {letter}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const NumberPuzzle = ({ onScore }: { onScore: (score: number) => void }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState<{ text: string; blanks: number[]; answer: number; hint: string }>({ text: '', blanks: [], answer: 0, hint: '' });
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(90);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setGameState('ended'); onScore(score); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, score, onScore]);

  const generateProblem = useCallback(() => {
    const templates = [
      () => { const a = Math.floor(Math.random() * 20) + 5; const b = Math.floor(Math.random() * 20) + 5; return { text: `${a} + ${b} = ?`, blanks: [a + b], answer: a + b, hint: `${a} + ${b}` }; },
      () => { const a = Math.floor(Math.random() * 30) + 10; const b = Math.floor(Math.random() * Math.min(a, 20)) + 1; return { text: `${a} - ${b} = ?`, blanks: [a - b], answer: a - b, hint: `${a} - ${b}` }; },
      () => { const a = Math.floor(Math.random() * 12) + 2; const b = Math.floor(Math.random() * 12) + 2; return { text: `${a} × ${b} = ?`, blanks: [a * b], answer: a * b, hint: `${a} × ${b}` }; },
      () => { const b = Math.floor(Math.random() * 10) + 2; const ans = Math.floor(Math.random() * 10) + 1; const a = b * ans; return { text: `${a} ÷ ${b} = ?`, blanks: [ans], answer: ans, hint: `${a} ÷ ${b}` }; },
      () => { const a = Math.floor(Math.random() * 50) + 10; const b = Math.floor(Math.random() * 50) + 10; return { text: `${a} + ${b} + ? = ${a + b + 10}`, blanks: [10], answer: 10, hint: `Eksik sayıyı bul` }; },
      () => { const n = Math.floor(Math.random() * 5) + 2; const ans = Math.pow(n, 2); return { text: `${n}² = ?`, blanks: [ans], answer: ans, hint: `Karesini al` }; },
      () => { const n = Math.floor(Math.random() * 5) + 2; const ans = Math.pow(n, 3); return { text: `${n}³ = ?`, blanks: [ans], answer: ans, hint: `Küpünü al` }; },
      () => { const n = Math.floor(Math.random() * 10) + 2; return { text: `√${n * n} = ?`, blanks: [n], answer: n, hint: `Karekök al` }; },
      () => { const a = Math.floor(Math.random() * 10) + 2; const b = Math.floor(Math.random() * 10) + 2; const c = a + b; return { text: `? + ${b} = ${c}`, blanks: [a], answer: a, hint: `${c} - ${b}` }; },
      () => { const a = Math.floor(Math.random() * 20) + 10; const b = Math.floor(Math.random() * 10) + 5; return { text: `(${a} + ${b}) × 2 = ?`, blanks: [(a + b) * 2], answer: (a + b) * 2, hint: `Önce parantez, sonra çarp` }; },
    ];
    const template = templates[Math.floor(Math.random() * templates.length)]();
    setProblem(template);
    setInput('');
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') generateProblem();
  }, [gameState, level, generateProblem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const val = parseInt(input.trim());
    if (val === problem.answer) {
      const bonus = streak > 4 ? 15 : streak > 2 ? 5 : 0;
      setScore(s => s + 10 * level + bonus);
      setStreak(s => s + 1);
      if (score >= level * 80) setLevel(l => Math.min(l + 1, 10));
      setFeedback('correct');
      setTimeout(generateProblem, 800);
    } else {
      setStreak(0);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const startGame = () => { setGameState('playing'); setScore(0); setLevel(1); setTimeLeft(90); setStreak(0); };

  if (gameState === 'idle') {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <div className="mb-8">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center">
            <span className="text-5xl">🔢</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Sayı Bulmaca</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Eksik sayıyı bul! Dört işlem, kare, küp, karekök... 90 saniyede en yüksek skoru yap!
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl text-xl shadow-lg">
          <Play className="w-6 h-6 inline mr-2" />Oyunu Başlat
        </motion.button>
      </motion.div>
    );
  }

  if (gameState === 'ended') {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
          <Trophy className="w-16 h-16 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Süre Doldu!</h2>
        <p className="text-5xl font-bold text-green-400 mb-2">{score} Puan</p>
        <p className="text-slate-400 mb-8">Seviye {level}'e ulaştın!</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl text-xl">
          <RotateCcw className="w-6 h-6 inline mr-2" />Tekrar Oyna
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
        animate={feedback === 'correct' ? { scale: [1, 1.05, 1] } : feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
        className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-6 text-center border-2 transition-colors ${
          feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-slate-700'
        }`}
      >
        <p className="text-5xl font-bold text-white mb-2">{problem.text}</p>
        <p className="text-slate-500 text-sm mt-2">{problem.hint}</p>
        {feedback === 'correct' && <p className="text-green-400 font-bold text-xl mt-3">✓ Doğru!</p>}
        {feedback === 'wrong' && <p className="text-red-400 font-bold text-xl mt-3">✗ Yanlış! Doğru cevap: {problem.answer}</p>}
      </motion.div>

      {streak > 3 && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="mb-4 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-xl text-center">
          <span className="text-orange-400 font-bold">🔥 {streak} Kombo!</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Cevabını yaz..."
          autoFocus
          className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white text-2xl font-bold text-center focus:outline-none focus:border-amber-500 transition-colors"
        />
        <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl text-xl">
          Gönder
        </motion.button>
      </form>
    </div>
  );
};

const MemoryGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const symbols = ['+', '−', '×', '÷', '=', '%', '²', '³', '√', 'π', 'Δ', '∑', '∫', '∞', '≠', '≈'];
  const [cards, setCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { setGameState('idle'); onScore(score); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, score, onScore]);

  const initGame = () => {
    const pairs = [...symbols.slice(0, 8)].flatMap((s, i) => [
      { id: i * 2, symbol: s, flipped: false, matched: false },
      { id: i * 2 + 1, symbol: s, flipped: false, matched: false },
    ]);
    setCards(pairs.sort(() => Math.random() - 0.5));
    setSelected([]);
    setMoves(0);
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
  };

  const startGame = () => { initGame(); };

  useEffect(() => {
    if (selected.length === 2) {
      const [a, b] = selected;
      if (cards[a].symbol === cards[b].symbol) {
        const newCards = cards.map((c, i) =>
          i === a || i === b ? { ...c, matched: true } : c
        );
        setCards(newCards);
        setScore(s => s + 20);
        setSelected([]);
        if (newCards.every(c => c.matched)) {
          const bonus = Math.max(0, (timeLeft - moves) * 2);
          setScore(s => s + bonus);
          setTimeout(() => setGameState('won'), 500);
        }
      } else {
        setTimeout(() => {
          setCards(cards.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 800);
      }
      setMoves(m => m + 1);
    }
  }, [selected, cards]);

  // Duplicate win detection removed — already handled in the selected useEffect above

  if (gameState === 'idle') {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <div className="mb-8">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center">
            <span className="text-5xl">🧠</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Matematik Memory</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Eşleşen sembolleri bul! Tüm çiftleri bulunca süre bonusu kazan. 60 saniyen var!
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl text-xl shadow-lg">
          <Play className="w-6 h-6 inline mr-2" />Oyunu Başlat
        </motion.button>
      </motion.div>
    );
  }

  if (gameState === 'won') {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
          <Trophy className="w-16 h-16 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Tebrikler!</h2>
        <p className="text-slate-400 mb-2">{moves} hamlede tamamladın!</p>
        <p className="text-5xl font-bold text-yellow-400 mb-6">{score} Puan</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl text-xl">
          <RotateCcw className="w-6 h-6 inline mr-2" />Tekrar Oyna
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          Puan: <span className="text-green-400">{score}</span>
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          Hamle: {moves}
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          {timeLeft}s
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            whileHover={{ scale: card.matched || card.flipped ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (card.flipped || card.matched || selected.length >= 2) return;
              setCards(cards.map((c, idx) => idx === i ? { ...c, flipped: true } : c));
              setSelected([...selected, i]);
            }}
            disabled={card.matched}
            className={`aspect-square rounded-2xl text-3xl font-bold flex items-center justify-center transition-all ${
              card.matched
                ? 'bg-green-500/40 text-green-300'
                : card.flipped
                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-400 hover:from-slate-600 hover:to-slate-700'
            }`}
          >
            {card.flipped || card.matched ? card.symbol : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const games = [
  {
    id: 1,
    title: 'Çarpım Tablosu',
    description: 'Çarpım tablosunu hızlıca öğren!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Kolay',
    color: 'from-pink-500 to-purple-500',
    icon: Brain,
    component: MultiplicationRace,
  },
  {
    id: 2,
    title: 'Matematik Zihin Jimnastiği',
    description: 'Zor problemleri çöz, seviye atlę!',
    grade: '5-8',
    rating: 4.8,
    difficulty: 'Orta',
    color: 'from-purple-500 to-pink-500',
    icon: Brain,
    component: MathPuzzle,
  },
  {
    id: 3,
    title: 'Renkli Matematik',
    description: 'Renkleri oku, doğruyu bul!',
    grade: '5-8',
    rating: 4.7,
    difficulty: 'Zor',
    color: 'from-cyan-500 to-blue-500',
    icon: Sparkles,
    component: ColorMath,
  },
  {
    id: 4,
    title: 'Matematik Adam Asmaca',
    description: 'Matematik terimlerini tahmin et!',
    grade: '5-8',
    rating: 4.8,
    difficulty: 'Orta',
    color: 'from-indigo-500 to-purple-500',
    icon: Target,
    component: Hangman,
  },
  {
    id: 5,
    title: 'Sayı Bulmaca',
    description: 'Eksik sayıyı bul, puan topla!',
    grade: '5-8',
    rating: 4.6,
    difficulty: 'Orta',
    color: 'from-amber-500 to-orange-500',
    icon: Zap,
    component: NumberPuzzle,
  },
  {
    id: 6,
    title: 'Matematik Memory',
    description: 'Eşleşen sembolleri bul!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Kolay',
    color: 'from-emerald-500 to-teal-500',
    icon: Brain,
    component: MemoryGame,
  },
];

export default function GamesPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const router = useRouter();
  const profileHref = user?.isAdmin ? '/admin' : '/profil';

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/giris');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        setUser({ ...profile, email: session.user.email });
      } else {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Öğrenci',
          email: session.user.email,
          grade: session.user.user_metadata?.grade ?? 5
        });
      }
    };
    checkSession();
  }, [router]);

  if (!user) return null;

  const handleScore = (score: number) => {
    setTotalScore(s => s + score);
  };

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <main className="oyunlar-page min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <FloatingParticles />
        
        <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
          <div className="container mx-auto flex justify-between items-center">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center gap-3 text-white hover:text-purple-400 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-bold">Oyunlara Dön</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold">
                Toplam: {totalScore} Puan
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-24 px-6">
          <div className="container mx-auto max-w-4xl">
            <GameComponent onScore={handleScore} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="oyunlar-page min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pb-20">
      <FloatingParticles />
      
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Uğur Hoca Matematik
            </span>
          </Link>

          <Link href={profileHref} className="text-slate-300 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            {user.isAdmin ? 'Admin Panel' : 'Profil'}
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Eğlenceli Oyunlar</h1>
            <p className="text-slate-400">
              Oyna, eğlen ve matematik öğren!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {games.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GameCard
                  game={game}
                  onClick={() => setSelectedGame(game)}
                />
              </motion.div>
            ))}
          </div>

          {totalScore > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-12 glass rounded-3xl p-8 text-center max-w-md mx-auto"
            >
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white mb-2">Bu Oturumdaki Toplam Puanın</h3>
              <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {totalScore}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
