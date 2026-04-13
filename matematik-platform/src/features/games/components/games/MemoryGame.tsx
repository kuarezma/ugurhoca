'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';

type MemoryCard = {
  flipped: boolean;
  id: number;
  matched: boolean;
  symbol: string;
};

const symbols = [
  '+',
  '−',
  '×',
  '÷',
  '=',
  '%',
  '²',
  '³',
  '√',
  'π',
  'Δ',
  '∑',
  '∫',
  '∞',
  '≠',
  '≈',
];

export function MemoryGame({ onScore }: GameComponentProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>(
    'idle',
  );
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          setGameState('idle');
          onScore(score);
          return 0;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, onScore, score]);

  const initGame = () => {
    const pairs = [...symbols.slice(0, 8)].flatMap((symbol, index) => [
      { id: index * 2, symbol, flipped: false, matched: false },
      { id: index * 2 + 1, symbol, flipped: false, matched: false },
    ]);

    setCards(pairs.sort(() => Math.random() - 0.5));
    setSelected([]);
    setMoves(0);
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
  };

  const startGame = () => {
    initGame();
  };

  useEffect(() => {
    if (selected.length !== 2) {
      return;
    }

    const [firstIndex, secondIndex] = selected;
    if (cards[firstIndex].symbol === cards[secondIndex].symbol) {
      const nextCards = cards.map((card, index) =>
        index === firstIndex || index === secondIndex
          ? { ...card, matched: true }
          : card,
      );

      setCards(nextCards);
      setScore((currentScore) => currentScore + 20);
      setSelected([]);

      if (nextCards.every((card) => card.matched)) {
        const bonus = Math.max(0, (timeLeft - moves) * 2);
        setScore((currentScore) => currentScore + bonus);
        setTimeout(() => setGameState('won'), 500);
      }
    } else {
      setTimeout(() => {
        setCards(
          cards.map((card, index) =>
            index === firstIndex || index === secondIndex
              ? { ...card, flipped: false }
              : card,
          ),
        );
        setSelected([]);
      }, 800);
    }

    setMoves((currentMoves) => currentMoves + 1);
  }, [cards, moves, selected, timeLeft]);

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
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center"
          >
            <span className="text-5xl">🧠</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Matematik Memory
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Eşleşen sembolleri bul! Tüm çiftleri bulunca süre bonusu kazan. 60
            saniyen var!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl text-xl shadow-lg"
        >
          <Play className="w-6 h-6 inline mr-2" />
          Oyunu Başlat
        </motion.button>
      </motion.div>
    );
  }

  if (gameState === 'won') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center"
        >
          <Trophy className="w-16 h-16 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Tebrikler!</h2>
        <p className="text-slate-400 mb-2">{moves} hamlede tamamladın!</p>
        <p className="text-5xl font-bold text-yellow-400 mb-6">{score} Puan</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl text-xl"
        >
          <RotateCcw className="w-6 h-6 inline mr-2" />
          Tekrar Oyna
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
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            whileHover={{ scale: card.matched || card.flipped ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (card.flipped || card.matched || selected.length >= 2) {
                return;
              }

              setCards(
                cards.map((currentCard, currentIndex) =>
                  currentIndex === index
                    ? { ...currentCard, flipped: true }
                    : currentCard,
                ),
              );
              setSelected([...selected, index]);
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
}
