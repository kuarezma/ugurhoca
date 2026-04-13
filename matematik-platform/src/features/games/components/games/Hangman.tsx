'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';

const mathTerms = [
  'ÇARPIM',
  'BÖLÜM',
  'FAKTÖRİYEL',
  'POLİNOM',
  'EŞİTSİZLİK',
  'FONKSİYON',
  'PERMÜTASYON',
  'KOMBİNASYON',
  'ORAN',
  'ORANTI',
  'KESİR',
  'PAYDA',
  'PAY',
  'DOĞRU',
  'DÜZLEM',
  'AÇI',
  'KÖŞEGEN',
  'ÇEMBER',
  'DAİRE',
  'YARIÇAP',
  'ÇAP',
  'TEĞET',
  'ALAN',
  'ÇEVRE',
  'YÜKSEKLİK',
  'TABAN',
  'KENAR',
  'KÖŞE',
  'AÇIORTAY',
  'Kenarortay',
  'ASAL',
  'POZİTİF',
  'NEGATİF',
  'TAMSAYI',
  'DOĞALSayi',
  'RASYONEL',
  'İRRASYONEL',
  'REEL',
  'KÜME',
  'ELEMEN',
  'KESİŞİM',
  'BİRLEŞİM',
  'FARK',
  'TÜMLEME',
  'ALT KÜME',
  'BOŞ KÜME',
  'EVrensel',
  'ARİTMETİK',
  'CEBİR',
  'GEOMETRİ',
  'İSTATİSTİK',
  'ORTAÇEMBER',
  'YÜKSEKLİK',
  'ÖTELEME',
  'DÖNÜŞÜM',
  'SİMETRİ',
  'ÜÇGEN',
  'DÖRTGEN',
  'BEŞGEN',
  'ALTIGEN',
  'PARALEL',
  'DİK',
  'EĞİK',
  'AÇI',
  'TÜM',
  'YAN',
  'TERS',
  'DÜZ AÇI',
  'DAR AÇI',
  'GENİŞ AÇI',
  'ÖKLİT',
  'PİSAGOR',
  'THALES',
  'SİNÜS',
  'KOSİNÜS',
  'TANJANT',
  'KOTANJANT',
  'SEKANT',
  'KOSEKANT',
  'LOGARİTMA',
  'ÜSTEL',
  'POZİTİF',
  'NEGATİF',
  'SIFIR',
  'BİR',
  'İKİ',
  'ÜÇ',
  'ONDALIK',
  'TAMSAYI',
  'DENKLEM',
  'EŞİTSİZLİK',
  'SİSTEM',
  'MATRİS',
  'DETERMİNANT',
  'VEKTÖR',
  'SKALER',
  'DİZİ',
  'SERİ',
  'LİMİT',
];

export function Hangman({ onScore }: GameComponentProps) {
  const [gameState, setGameState] = useState<
    'idle' | 'playing' | 'won' | 'lost'
  >('idle');
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  const maxWrong = 6;

  const startGame = () => {
    const index = Math.floor(Math.random() * mathTerms.length);
    setWord(mathTerms[index]);
    setGuessed(new Set());
    setScore(0);
    setRound(1);
    setGameState('playing');
  };

  const getDisplay = () =>
    word
      .split('')
      .map((character) => (guessed.has(character) ? character : '_'))
      .join(' ');

  const wrongCount = [...guessed].filter(
    (character) => !word.includes(character),
  ).length;

  const handleGuess = (letter: string) => {
    if (guessed.has(letter) || gameState !== 'playing') {
      return;
    }

    const nextGuessed = new Set(guessed);
    nextGuessed.add(letter);
    setGuessed(nextGuessed);

    const nextWon = word
      .split('')
      .every((character) => nextGuessed.has(character));
    const nextWrongCount = [...nextGuessed].filter(
      (character) => !word.includes(character),
    ).length;
    const nextLost = nextWrongCount >= maxWrong;

    if (nextWon) {
      setScore(
        (currentScore) => currentScore + (maxWrong - nextWrongCount) * 10 + 50,
      );
      setGameState('won');

      setTimeout(() => {
        setRound((currentRound) => currentRound + 1);
        const index = Math.floor(Math.random() * mathTerms.length);
        setWord(mathTerms[index]);
        setGuessed(new Set());
        setGameState('playing');
      }, 1500);
    }

    if (nextLost) {
      setGameState('lost');
      onScore(score);
    }
  };

  const parts = [
    <line
      key="base"
      x1="10"
      y1="140"
      x2="60"
      y2="140"
      stroke="currentColor"
      strokeWidth="3"
    />,
    <line
      key="pole"
      x1="35"
      y1="140"
      x2="35"
      y2="10"
      stroke="currentColor"
      strokeWidth="3"
    />,
    <line
      key="top"
      x1="35"
      y1="10"
      x2="80"
      y2="10"
      stroke="currentColor"
      strokeWidth="3"
    />,
    <line
      key="rope"
      x1="80"
      y1="10"
      x2="80"
      y2="30"
      stroke="currentColor"
      strokeWidth="3"
    />,
  ];

  const bodyParts = [
    <circle
      key="head"
      cx="80"
      cy="40"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
    />,
    <line
      key="body"
      x1="80"
      y1="50"
      x2="80"
      y2="85"
      stroke="currentColor"
      strokeWidth="3"
    />,
    <line
      key="larm"
      x1="80"
      y1="60"
      x2="65"
      y2="75"
      stroke="currentColor"
      strokeWidth="3"
    />,
    <line
      key="rarm"
      x1="80"
      y1="60"
      x2="95"
      y2="75"
      stroke="currentColor"
      strokeWidth="3"
    />,
    <line
      key="lleg"
      x1="80"
      y1="85"
      x2="65"
      y2="110"
      stroke="currentColor"
      strokeWidth="3"
    />,
    <line
      key="rleg"
      x1="80"
      y1="85"
      x2="95"
      y2="110"
      stroke="currentColor"
      strokeWidth="3"
    />,
  ];

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
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center"
          >
            <span className="text-5xl">🔤</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Matematik Adam Asmaca
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Matematik terimlerini tahmin et! Her yanlış tahmin bir parça
            kaybettirir. 6 yanlış hakkın var!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl text-xl shadow-lg"
        >
          <Play className="w-6 h-6 inline mr-2" />
          Oyunu Başlat
        </motion.button>
      </motion.div>
    );
  }

  if (gameState === 'lost') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center"
        >
          <span className="text-5xl">💀</span>
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Kaybettin!</h2>
        <p className="text-2xl text-white mb-2">
          Doğru cevap: <span className="text-yellow-400 font-bold">{word}</span>
        </p>
        <p className="text-4xl font-bold text-green-400 mb-6">{score} Puan</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl text-xl"
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
          Tur {round}
        </div>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white font-bold">
          Kalan: {maxWrong - wrongCount} ❌
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <svg width="150" height="150" className="text-slate-300">
          {parts.map((part, index) =>
            index < wrongCount ? part : <g key={index} />,
          )}
          {bodyParts.map((part, index) =>
            index < wrongCount - 1 ? part : <g key={index} />,
          )}
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
        {'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('').map((letter) => (
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
}
