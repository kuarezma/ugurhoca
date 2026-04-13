'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';

const colorMap: Record<string, string> = {
  Kırmızı: 'text-red-500',
  Mavi: 'text-blue-500',
  Yeşil: 'text-green-500',
  Sarı: 'text-yellow-400',
  Mor: 'text-purple-500',
  Turuncu: 'text-orange-500',
};

export function ColorMath({ onScore }: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState({
    word: '',
    fontColor: '',
    askedColor: '',
    answer: true,
  });
  const [timeLeft, setTimeLeft] = useState(8);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      : colors.filter((currentColor) => currentColor !== fontColor)[
          Math.floor(Math.random() * (colors.length - 1))
        ];

    setQuestion({
      word,
      fontColor,
      askedColor,
      answer: askedColor === fontColor,
    });
  }, []);

  const advanceRound = useCallback(() => {
    setRound((currentRound) => {
      const nextRound = currentRound + 1;
      setTimeLeft(getRoundTime(nextRound));
      return nextRound;
    });
    generateQuestion();
  }, [generateQuestion, getRoundTime]);

  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          let gameOver = false;

          setLives((currentLives) => {
            if (currentLives <= 1) {
              gameOver = true;
              setGameState('ended');
              onScore(score);
              return 0;
            }

            return currentLives - 1;
          });

          if (!gameOver) {
            advanceRound();
          }

          return 0;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [advanceRound, gameState, onScore, score]);

  const handleAnswer = (answer: boolean) => {
    if (answer === question.answer) {
      setScore((currentScore) => currentScore + Math.floor(timeLeft * 10));
    } else {
      setLives((currentLives) => {
        if (currentLives <= 1) {
          setGameState('ended');
          onScore(score);
        }

        return currentLives - 1;
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
          <h2 className="text-3xl font-bold text-white mb-4">
            Renkli Matematik
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Bu zorlu oyunda, renkli yazılmış kelimeleri oku! Yazı rengi mi yoksa
            yazılan renk mi doğru? 3 can hakkın var!
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
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              animate={
                index < lives ? { scale: [1, 1.2, 1] } : { opacity: 0.3 }
              }
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
          Yazının rengi{' '}
          <span className="text-cyan-300">{question.askedColor}</span> mi?
        </p>
        <motion.p
          key={`${question.word}-${question.fontColor}-${round}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-7xl font-bold ${
            colorMap[question.fontColor] || 'text-white'
          }`}
        >
          {question.word}
        </motion.p>
        <p className="text-slate-500 mt-6 text-sm">
          Kelimeyi değil yazı rengini takip et.
        </p>
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
}
