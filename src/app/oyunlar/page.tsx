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

const NumberHunter = ({ onScore }: { onScore: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [target, setTarget] = useState({ x: 0, y: 0, value: 0 });
  const [particles, setParticles] = useState<any[]>([]);
  const [numbers, setNumbers] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const requestRef = useRef<number | null>(null);
  
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

  useEffect(() => {
    if (gameState === 'playing') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const spawnNumber = () => {
        const value = Math.floor(Math.random() * 20) + 1;
        setNumbers(nums => [
          ...nums.slice(-8),
          {
            id: Date.now(),
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50,
            value,
            scale: 0,
            color: ['#f97316', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 5)],
          }
        ]);
        setTarget({ x: canvas.width / 2, y: 50, value: Math.floor(Math.random() * 50) + 10 });
      };

      spawnNumber();
      const spawnInterval = setInterval(spawnNumber, 2000);
      return () => clearInterval(spawnInterval);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const animate = () => {
      setNumbers(nums => nums.map(n => ({
        ...n,
        scale: Math.min(n.scale + 0.05, 1),
        y: n.y - 0.5,
      })).filter(n => n.y > -50));
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  const handleClick = (num: any) => {
    if (num.value === target.value) {
      setStreak(s => s + 1);
      const bonus = streak > 2 ? 50 : 0;
      setScore(s => s + 10 + bonus);
      setParticles(p => [...p, { x: num.x, y: num.y, color: num.color, id: Date.now() }]);
      setTimeout(() => setParticles(p => p.filter(particle => particle.id !== Date.now())), 1000);
      setTarget({ x: Math.random() * 200 + 100, y: 50, value: Math.floor(Math.random() * 50) + 10 });
    } else {
      setStreak(0);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setStreak(0);
    setNumbers([]);
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
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center"
          >
            <Target className="w-16 h-16 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Sayı Avcısı</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Ekran üzerinde sayılar belirecek! Hedef sayıyı bul ve tıkla. 30 saniyede en yüksek skoru yap!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl text-xl shadow-lg shadow-orange-500/30"
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
          animate={{ rotate: 360 }}
          transition={{ duration: 1 }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
        >
          <Trophy className="w-16 h-16 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Süre Doldu!</h2>
        <p className="text-5xl font-bold text-yellow-400 mb-4">{score} Puan</p>
        <p className="text-slate-400 mb-8">Tebrikler! Devamke.</p>
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
    <div className="relative">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          Puan: <span className="text-yellow-400">{score}</span>
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-400" />
          {timeLeft}s
        </div>
        {streak > 2 && (
          <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-bold flex items-center gap-2 animate-pulse">
            <Flame className="w-5 h-5" />
            {streak}x Kombo!
          </div>
        )}
      </div>
      
      <div className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-2xl shadow-lg shadow-purple-500/30 z-10">
        Hedef: {target.value}
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) * (800 / rect.width);
          const y = (e.clientY - rect.top) * (500 / rect.height);
          numbers.forEach(num => {
            const dist = Math.sqrt((x - num.x) ** 2 + (y - num.y) ** 2);
            if (dist < 40) handleClick(num);
          });
        }}
      />

      {numbers.map(num => (
        <motion.div
          key={num.id}
          initial={{ scale: 0 }}
          animate={{ scale: num.scale, y: num.y }}
          className="absolute w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg cursor-pointer"
          style={{
            left: num.x,
            top: num.y,
            background: `linear-gradient(135deg, ${num.color}, ${num.color}88)`,
            boxShadow: `0 0 30px ${num.color}66`,
          }}
        >
          {num.value}
        </motion.div>
      ))}

      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          className="absolute w-4 h-4 rounded-full"
          style={{ left: p.x, top: p.y, background: p.color }}
        />
      ))}
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
  const [question, setQuestion] = useState({ text: '', answer: true });
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateQuestion = useCallback(() => {
    const colors = ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Mor', 'Turuncu'];
    const numColors = colors.length;
    const num1 = Math.floor(Math.random() * numColors);
    let num2 = Math.floor(Math.random() * numColors);
    while (num2 === num1) num2 = Math.floor(Math.random() * numColors);
    
    const textColor = colors[num1];
    const bgColor = colors[num2];
    const isCorrect = textColor === bgColor;
    const isTrue = Math.random() > 0.5;
    
    setQuestion({
      text: `Yazı ${isTrue ? textColor : bgColor}`,
      answer: isTrue ? isCorrect : !isCorrect
    });
    setTimeLeft(10);
    setRound(r => r + 1);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setLives(l => {
              if (l <= 1) {
                setGameState('ended');
                onScore(score);
              }
              return l - 1;
            });
            generateQuestion();
            return 10;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current!);
    }
  }, [gameState, generateQuestion, onScore, score]);

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
    generateQuestion();
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setRound(0);
    generateQuestion();
  };

  const colorMap: Record<string, string> = {
    'Kırmızı': 'text-red-500',
    'Mavi': 'text-blue-500',
    'Yeşil': 'text-green-500',
    'Sarı': 'text-yellow-400',
    'Mor': 'text-purple-500',
    'Turuncu': 'text-orange-500',
  };

  const bgColorMap: Record<string, string> = {
    'Kırmızı': 'bg-red-500',
    'Mavi': 'bg-blue-500',
    'Yeşil': 'bg-green-500',
    'Sarı': 'bg-yellow-400',
    'Mor': 'bg-purple-500',
    'Turuncu': 'bg-orange-500',
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

  const words = question.text.split(' ');
  const targetWord = words[words.length - 1];

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
        <p className="text-5xl font-bold mb-8">
          {words.slice(0, -1).join(' ')}
        </p>
        <motion.p
          key={targetWord}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-7xl font-bold ${colorMap[targetWord] || 'text-white'}`}
        >
          {targetWord}
        </motion.p>
      </motion.div>

      <div className="mb-6">
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 10) * 100}%` }}
            style={{ width: `${(timeLeft / 10) * 100}%` }}
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

const games = [
  {
    id: 1,
    title: 'Sayı Avcısı',
    description: 'Hedef sayıyı bul ve tıkla!',
    grade: '5-8',
    rating: 4.9,
    difficulty: 'Kolay',
    color: 'from-orange-500 to-red-500',
    icon: Target,
    component: NumberHunter,
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
];

export default function GamesPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const router = useRouter();

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
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pb-20">
      <FloatingParticles />
      
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/profil" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Uğur Hoca Matematik
            </span>
          </Link>

          <Link href="/profil" className="text-slate-300 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Profil
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
