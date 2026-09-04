'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Heart,
  Play,
  RotateCcw,
  Trophy,
  Utensils,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type PizzaOrder = {
  totalSlices: number;
  targetFractionText: string;
  requiredCount: number;
  toppingName: string;
  toppingEmoji: string;
  explanation: string;
};

const TOPPINGS = [
  { name: 'Mantarlı', emoji: '🍄' },
  { name: 'Zeytinli', emoji: '🫒' },
  { name: 'Domatesli', emoji: '🍅' },
  { name: 'Mısırlı', emoji: '🌽' },
  { name: 'Biberli', emoji: '🫑' },
];

const generateOrder = (round: number): PizzaOrder => {
  const topping = TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)];

  if (round <= 2) {
    // 4 or 6 slices simple fractions
    const totalSlices = Math.random() > 0.5 ? 4 : 6;
    const num = Math.floor(Math.random() * (totalSlices - 1)) + 1;
    return {
      totalSlices,
      targetFractionText: `${num}/${totalSlices}`,
      requiredCount: num,
      toppingName: topping.name,
      toppingEmoji: topping.emoji,
      explanation: `${totalSlices} dilimden tam ${num} tanesini seçmelisin.`,
    };
  } else if (round <= 5) {
    // 8 or 12 slices, with simplification
    const totalSlices = Math.random() > 0.5 ? 8 : 12;
    if (totalSlices === 8) {
      const presets = [
        { text: '1/2', count: 4, exp: "1/2 yarımdır, 8 dilimin yarısı 4'tür." },
        {
          text: '1/4',
          count: 2,
          exp: "1/4 çeyrektir, 8 dilimin çeyreği 2'dir.",
        },
        { text: '3/4', count: 6, exp: '3/4 için 8 dilimden 6 tanesi gerekir.' },
        { text: '3/8', count: 3, exp: '8 dilimden 3 tanesi gerekir.' },
        { text: '5/8', count: 5, exp: '8 dilimden 5 tanesi gerekir.' },
      ];
      const pick = presets[Math.floor(Math.random() * presets.length)];
      return {
        totalSlices: 8,
        targetFractionText: pick.text,
        requiredCount: pick.count,
        toppingName: topping.name,
        toppingEmoji: topping.emoji,
        explanation: pick.exp,
      };
    } else {
      const presets = [
        { text: '1/3', count: 4, exp: "12 dilimin 1/3'ü 4 dilimdir." },
        { text: '2/3', count: 8, exp: "12 dilimin 2/3'ü 8 dilimdir." },
        { text: '1/4', count: 3, exp: "12 dilimin 1/4'ü 3 dilimdir." },
        { text: '3/4', count: 9, exp: "12 dilimin 3/4'ü 9 dilimdir." },
        { text: '5/12', count: 5, exp: "12 dilimden 5'i gerekir." },
      ];
      const pick = presets[Math.floor(Math.random() * presets.length)];
      return {
        totalSlices: 12,
        targetFractionText: pick.text,
        requiredCount: pick.count,
        toppingName: topping.name,
        toppingEmoji: topping.emoji,
        explanation: pick.exp,
      };
    }
  } else {
    // Percentages or advanced fractions (10 or 12 slices)
    const isPercent = Math.random() > 0.4;
    if (isPercent) {
      const percentPresets = [
        {
          text: '%50',
          total: 10,
          count: 5,
          exp: '10 dilimin %50’si 5 dilimdir.',
        },
        {
          text: '%20',
          total: 10,
          count: 2,
          exp: '10 dilimin %20’si 2 dilimdir.',
        },
        {
          text: '%70',
          total: 10,
          count: 7,
          exp: '10 dilimin %70’i 7 dilimdir.',
        },
        {
          text: '%25',
          total: 8,
          count: 2,
          exp: '8 dilimin %25’i (çeyreği) 2 dilimdir.',
        },
        { text: '%75', total: 8, count: 6, exp: '8 dilimin %75’i 6 dilimdir.' },
      ];
      const pick =
        percentPresets[Math.floor(Math.random() * percentPresets.length)];
      return {
        totalSlices: pick.total,
        targetFractionText: pick.text,
        requiredCount: pick.count,
        toppingName: topping.name,
        toppingEmoji: topping.emoji,
        explanation: pick.exp,
      };
    } else {
      const totalSlices = 12;
      const count = Math.floor(Math.random() * 9) + 2;
      return {
        totalSlices,
        targetFractionText: `${count}/${totalSlices}`,
        requiredCount: count,
        toppingName: topping.name,
        toppingEmoji: topping.emoji,
        explanation: `12 dilimden ${count} tanesini seçmelisin.`,
      };
    }
  }
};

export function PizzaChef({
  onScore,
  scoreMultiplier,
  onExit,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [order, setOrder] = useState<PizzaOrder>(() => generateOrder(1));
  const [selectedSlices, setSelectedSlices] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [isBaking, setIsBaking] = useState(false);

  const startNewGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setRound(1);
    setLives(3);
    setStreak(0);
    setTimeLeft(60);
    setSelectedSlices(new Set());
    setFeedback(null);
    setIsBaking(false);
    setOrder(generateOrder(1));
  }, []);

  const finishGame = useCallback(
    (finalScore: number) => {
      setGameState('ended');
      gameAudio.playFanfare();
      onScore(finalScore);
    },
    [onScore],
  );

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, finishGame, score]);

  const toggleSlice = (sliceIndex: number) => {
    if (isBaking || feedback) return;
    gameAudio.playPop();
    setSelectedSlices((prev) => {
      const next = new Set(prev);
      if (next.has(sliceIndex)) {
        next.delete(sliceIndex);
      } else {
        next.add(sliceIndex);
      }
      return next;
    });
  };

  const submitPizza = () => {
    if (isBaking || feedback) return;

    const isCorrect = selectedSlices.size === order.requiredCount;
    setIsBaking(true);

    if (isCorrect) {
      gameAudio.playCorrect();
      const currentStreak = streak + 1;
      setStreak(currentStreak);
      const points = (100 + currentStreak * 15) * scoreMultiplier;
      setScore((prev) => prev + points);

      if (currentStreak > 1) {
        setTimeout(() => gameAudio.playCombo(currentStreak), 200);
      }

      setFeedback({
        isCorrect: true,
        message: `Harika! ${order.explanation} (+${points} Puan)`,
      });

      setTimeout(() => {
        setIsBaking(false);
        setFeedback(null);
        setSelectedSlices(new Set());
        const nextRound = round + 1;
        setRound(nextRound);
        setTimeLeft((prev) => Math.min(prev + 8, 75)); // time bonus
        setOrder(generateOrder(nextRound));
      }, 1500);
    } else {
      gameAudio.playWrong();
      const nextLives = lives - 1;
      setLives(nextLives);
      setStreak(0);

      setFeedback({
        isCorrect: false,
        message: `Yanlış dilim sayısı! (${selectedSlices.size} dilim seçildi). İpucu: ${order.explanation}`,
      });

      setTimeout(() => {
        setIsBaking(false);
        if (nextLives <= 0) {
          finishGame(score);
        } else {
          setFeedback(null);
          setSelectedSlices(new Set());
        }
      }, 2000);
    }
  };

  // Pre-calculate SVG slice geometry
  const slicePaths = useMemo(() => {
    const total = order.totalSlices;
    const radius = 120;
    const center = 140;
    const sliceAngle = (2 * Math.PI) / total;

    return Array.from({ length: total }, (_, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = (i + 1) * sliceAngle - Math.PI / 2;

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      // Arc flag
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      // Center point for topping icon
      const midAngle = startAngle + sliceAngle / 2;
      const toppingX = center + radius * 0.65 * Math.cos(midAngle);
      const toppingY = center + radius * 0.65 * Math.sin(midAngle);

      return { index: i, pathData, toppingX, toppingY };
    });
  }, [order.totalSlices]);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-amber-500/20 bg-slate-900/90 p-6 text-white shadow-2xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 shadow-lg shadow-amber-500/30">
            <ChefHat className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-amber-300">
              Pizza Ustası
            </h2>
            <p className="text-xs text-slate-300">
              Kesirleri lezzetli pizzalara dönüştür!
            </p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-4 text-sm font-semibold">
            <div className="flex items-center gap-1 text-red-400">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`h-5 w-5 ${
                    i < lives ? 'fill-red-500 text-red-500' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <div className="rounded-xl bg-amber-500/20 px-3 py-1 text-amber-300">
              Süre: {timeLeft}s
            </div>
            <div className="rounded-xl bg-purple-500/20 px-3 py-1 text-purple-300">
              {score} Puan
            </div>
          </div>
        )}
      </div>

      {gameState === 'idle' && (
        <div className="py-10 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 shadow-xl shadow-amber-500/40">
            <Utensils className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Siparişler Geliyor, Şef!
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
            Müşterilerin sipariş ettiği kesir kadar dilime tıkla, malzemeyi koy
            ve pizzayı fırına ver. Doğru dilimlerle kombo yap, puan rekoru kır!
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              <Play className="h-5 w-5" /> Oyuna Başla
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          {/* Order Board */}
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                  Sipariş #{round}
                </span>
                <div className="mt-1 text-lg font-bold text-white">
                  Pizzanın{' '}
                  <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-slate-950">
                    {order.targetFractionText}
                  </span>{' '}
                  kadarını{' '}
                  <span className="text-amber-300 font-bold">
                    {order.toppingName}
                  </span>{' '}
                  yap!
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Seçilen Dilim</div>
                  <div className="font-display text-xl font-black text-amber-400">
                    {selectedSlices.size} / {order.totalSlices}
                  </div>
                </div>
                <div className="text-3xl">{order.toppingEmoji}</div>
              </div>
            </div>
          </div>

          {/* Pizza SVG Board */}
          <div className="relative flex flex-col items-center justify-center py-4">
            <div className="relative h-72 w-72 sm:h-80 sm:w-80">
              {/* Outer Pizza Crust & Board */}
              <div className="absolute inset-0 rounded-full border-8 border-amber-800/80 bg-amber-600/30 shadow-2xl" />

              <svg
                viewBox="0 0 280 280"
                className="absolute inset-0 h-full w-full select-none"
              >
                <circle cx="140" cy="140" r="126" fill="#c27827" />
                <circle cx="140" cy="140" r="120" fill="#fcd34d" />
                <circle cx="140" cy="140" r="114" fill="#f59e0b" />

                {slicePaths.map((slice) => {
                  const isSelected = selectedSlices.has(slice.index);
                  return (
                    <g
                      key={slice.index}
                      onClick={() => toggleSlice(slice.index)}
                    >
                      <path
                        d={slice.pathData}
                        fill={isSelected ? '#ef4444' : '#fbbf24'}
                        stroke="#92400e"
                        strokeWidth="2.5"
                        className="cursor-pointer transition-all duration-150 hover:brightness-110 active:opacity-80"
                      />
                      {isSelected && (
                        <text
                          x={slice.toppingX}
                          y={slice.toppingY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="22"
                          className="pointer-events-none select-none"
                        >
                          {order.toppingEmoji}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Dilimlere dokunarak malzeme ekle veya çıkar.
            </p>
          </div>

          {/* Feedback & Action */}
          <div className="mt-4 flex flex-col items-center justify-center gap-3">
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    feedback.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={submitPizza}
              disabled={isBaking || selectedSlices.size === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-8 py-3 text-base font-bold text-white shadow-xl shadow-orange-500/30 transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChefHat className="h-5 w-5" /> Fırına Ver! 🍕
            </button>
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 shadow-xl">
            <Trophy className="h-10 w-10" />
          </div>
          <h3 className="font-display text-3xl font-black text-white">
            Tebrikler Şef!
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Pizzacıdaki mesain bitti, harika siparişler çıkardın!
          </p>

          <div className="mx-auto my-6 grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-white/5 p-4 border border-white/10">
            <div>
              <div className="text-xs text-slate-400">Toplam Puan</div>
              <div className="font-display text-2xl font-black text-amber-400">
                {score}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Tamamlanan Sipariş</div>
              <div className="font-display text-2xl font-black text-emerald-400">
                {round - 1}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-amber-400"
            >
              <RotateCcw className="h-5 w-5" /> Tekrar Oyna
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Oyunlara Dön
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
