'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Flame,
  Heart,
  Play,
  RotateCcw,
  Target,
  Timer,
  Zap,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type GeometryCategory =
  | 'Üçgende Açı'
  | 'Dörtgen & Çokgen'
  | 'Alan & Çevre'
  | 'Tümler & Bütünler'
  | 'Çember & Yarıçap';

type ArcherQuestion = {
  category: GeometryCategory;
  correctAnswer: number;
  options: number[];
  prompt: string;
  unit: string;
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateArcherQuestion(streak: number): ArcherQuestion {
  const rand = Math.random();
  let category: GeometryCategory = 'Üçgende Açı';
  let prompt = '';
  let correctAnswer = 0;
  let unit = '°';

  if (streak > 5 && rand > 0.6) {
    // Çember & Yarıçap
    category = 'Çember & Yarıçap';
    const type = Math.floor(Math.random() * 2);
    if (type === 0) {
      const r = [4, 5, 6, 7, 8, 10][Math.floor(Math.random() * 6)];
      prompt = `Yarıçapı ${r} cm olan çemberin çevresi kaç cm'dir? (π = 3)`;
      correctAnswer = 2 * 3 * r;
      unit = 'cm';
    } else {
      const d = [14, 16, 20, 24, 28, 36][Math.floor(Math.random() * 6)];
      prompt = `Çapı ${d} cm olan bir çemberin yarıçapı kaç cm'dir?`;
      correctAnswer = d / 2;
      unit = 'cm';
    }
  } else if (streak > 2 && rand > 0.4) {
    // Alan & Çevre
    category = 'Alan & Çevre';
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const a = Math.floor(Math.random() * 6) + 5; // 5..10
      const b = Math.floor(Math.random() * 5) + 3; // 3..7
      prompt = `Kısa kenarı ${b} cm, uzun kenarı ${a} cm olan dikdörtgenin alanı kaç cm²'dir?`;
      correctAnswer = a * b;
      unit = 'cm²';
    } else if (type === 1) {
      const roots = [5, 6, 7, 8, 9, 10, 12];
      const r = roots[Math.floor(Math.random() * roots.length)];
      prompt = `Alanı ${r * r} cm² olan bir karenin çevresi kaç cm'dir?`;
      correctAnswer = 4 * r;
      unit = 'cm';
    } else if (type === 2) {
      const base = (Math.floor(Math.random() * 5) + 4) * 2; // 8, 10, 12, 14, 16
      const h = Math.floor(Math.random() * 6) + 4; // 4..9
      prompt = `Tabanı ${base} cm ve bu tabana ait yüksekliği ${h} cm olan üçgenin alanı kaç cm²'dir?`;
      correctAnswer = (base * h) / 2;
      unit = 'cm²';
    } else {
      const side = Math.floor(Math.random() * 8) + 7;
      prompt = `Çevresi ${side * 3} cm olan eşkenar üçgenin bir kenar uzunluğu kaç cm'dir?`;
      correctAnswer = side;
      unit = 'cm';
    }
  } else if (rand > 0.65) {
    // Dörtgen & Çokgen
    category = 'Dörtgen & Çokgen';
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      const a = [55, 65, 70, 75, 80][Math.floor(Math.random() * 5)];
      prompt = `Bir paralelkenarın bir iç açısı ${a}° ise ardışık komşu açısı kaç derecedir?`;
      correctAnswer = 180 - a;
      unit = '°';
    } else if (type === 1) {
      const polyType = Math.floor(Math.random() * 3);
      if (polyType === 0) {
        prompt = `Düzgün altıgenin bir iç açısı kaç derecedir?`;
        correctAnswer = 120;
      } else if (polyType === 1) {
        prompt = `Düzgün beşgenin bir iç açısı kaç derecedir?`;
        correctAnswer = 108;
      } else {
        prompt = `Düzgün sekizgenin bir iç açısı kaç derecedir?`;
        correctAnswer = 135;
      }
      unit = '°';
    } else {
      const a = 80;
      const b = 110;
      const c = 95;
      prompt = `Bir dörtgenin iç açıları 80°, 110° ve 95° ise dördüncü açısı kaç derecedir?`;
      correctAnswer = 360 - (a + b + c); // 75
      unit = '°';
    }
  } else if (rand > 0.35) {
    // Tümler & Bütünler
    category = 'Tümler & Bütünler';
    const isTumler = Math.random() > 0.5;
    if (isTumler) {
      const a = [25, 35, 40, 50, 55, 65][Math.floor(Math.random() * 6)];
      prompt = `Ölçüsü ${a}° olan açının tümler açısı kaç derecedir?`;
      correctAnswer = 90 - a;
    } else {
      const a = [45, 65, 75, 105, 120, 135][Math.floor(Math.random() * 6)];
      prompt = `Ölçüsü ${a}° olan açının bütünler açısı kaç derecedir?`;
      correctAnswer = 180 - a;
    }
    unit = '°';
  } else {
    // Üçgende Açı
    category = 'Üçgende Açı';
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      const a = Math.floor(Math.random() * 25) + 50; // 50..74
      const b = Math.floor(Math.random() * 25) + 35; // 35..59
      prompt = `Bir üçgenin iki iç açısı ${a}° ve ${b}° ise üçüncü açısı kaç derecedir?`;
      correctAnswer = 180 - (a + b);
    } else if (type === 1) {
      const a = Math.floor(Math.random() * 40) + 25; // 25..64
      prompt = `Bir dik üçgende dar açılardan biri ${a}° ise diğer dar açı kaç derecedir?`;
      correctAnswer = 90 - a;
    } else {
      const top = [30, 40, 50, 60, 70, 80][Math.floor(Math.random() * 6)];
      prompt = `Tepe açısı ${top}° olan ikizkenar bir üçgenin taban açılarından biri kaç derecedir?`;
      correctAnswer = (180 - top) / 2;
    }
    unit = '°';
  }

  // Generate 3 unique distractors
  const distractors = new Set<number>();
  const offsets = [5, -5, 10, -10, 15, -15, 20, -20, 2, -2];
  for (const off of offsets) {
    const candidate = correctAnswer + off;
    if (candidate !== correctAnswer && candidate > 0) {
      distractors.add(candidate);
      if (distractors.size === 3) break;
    }
  }

  while (distractors.size < 3) {
    const candidate = Math.max(1, correctAnswer + Math.floor(Math.random() * 19) - 9);
    if (candidate !== correctAnswer) {
      distractors.add(candidate);
    }
  }

  const options = shuffle([correctAnswer, ...Array.from(distractors).slice(0, 3)]);

  return {
    category,
    correctAnswer,
    options,
    prompt,
    unit,
  };
}

export function GeometryArcher({
  onExit,
  onScore,
  scoreMultiplier = 1,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [arrowsLeft, setArrowsLeft] = useState(3);
  const [bullseyes, setBullseyes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [shotFiredVisual, setShotFiredVisual] = useState(false);
  const [missedVisual, setMissedVisual] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<ArcherQuestion>(() =>
    generateArcherQuestion(0),
  );
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'correct' | 'wrong';
  } | null>(null);

  const shotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const missTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  const finishGame = useCallback(() => {
    setGameState('ended');
    gameAudio.playFanfare();
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setArrowsLeft(3);
    setBullseyes(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalAnswered(0);
    setTotalCorrect(0);
    setTimeLeft(60);
    setFeedback(null);
    setShotFiredVisual(false);
    setMissedVisual(false);
    setCurrentQuestion(generateArcherQuestion(0));
    setGameState('playing');
    gameAudio.playPop();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, finishGame]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (shotTimeoutRef.current) clearTimeout(shotTimeoutRef.current);
      if (missTimeoutRef.current) clearTimeout(missTimeoutRef.current);
    };
  }, []);

  // Submit score safely once on game end
  useEffect(() => {
    if (gameState === 'playing') {
      hasSubmittedRef.current = false;
    }
    if (gameState === 'ended' && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      const finalScore = Math.min(4500, Math.round(score * (scoreMultiplier || 1)));
      onScore(finalScore);
    }
  }, [gameState, score, scoreMultiplier, onScore]);

  const nextQuestion = useCallback((currentStreak: number) => {
    setCurrentQuestion(generateArcherQuestion(currentStreak));
  }, []);

  const handleSelectAnswer = useCallback(
    (selectedAnswer: number) => {
      if (gameState !== 'playing') return;

      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      setTotalAnswered((t) => t + 1);

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setMaxStreak((prev) => Math.max(prev, newStreak));
        setTotalCorrect((c) => c + 1);
        setBullseyes((b) => b + 1);

        const streakBonus = Math.min(newStreak * 25, 125);
        const points = 100 + streakBonus;
        setScore((s) => s + points);

        // Arrow hit animation
        setShotFiredVisual(true);
        if (shotTimeoutRef.current) clearTimeout(shotTimeoutRef.current);
        shotTimeoutRef.current = setTimeout(() => setShotFiredVisual(false), 450);

        if (newStreak >= 3) {
          gameAudio.playSlice();
          gameAudio.playCombo(newStreak);
          setFeedback({
            message: `TAM İSABET! 12'den Vurdun! 🎯🏹 Kombo x${newStreak} (+${points})`,
            type: 'correct',
          });
        } else {
          gameAudio.playSlice();
          setFeedback({
            message: `TAM İSABET! 12'den Vurdun! 🎯🏹 (+${points})`,
            type: 'correct',
          });
        }
        nextQuestion(newStreak);
      } else {
        setStreak(0);
        gameAudio.playWrong();

        // Arrow miss visual trigger
        setMissedVisual(true);
        if (missTimeoutRef.current) clearTimeout(missTimeoutRef.current);
        missTimeoutRef.current = setTimeout(() => setMissedVisual(false), 450);

        const nextArrows = arrowsLeft - 1;
        setArrowsLeft(nextArrows);

        if (nextArrows <= 0) {
          setFeedback({
            message: `Oklar Tükendi! Doğru Cevap: ${currentQuestion.correctAnswer}${currentQuestion.unit} 🎯`,
            type: 'wrong',
          });
          finishGame();
        } else {
          setFeedback({
            message: `Hedef Iskaladı! Doğru Cevap: ${currentQuestion.correctAnswer}${currentQuestion.unit} 🏹💨`,
            type: 'wrong',
          });
          nextQuestion(0);
        }
      }
    },
    [gameState, currentQuestion, streak, arrowsLeft, nextQuestion, finishGame],
  );

  // Keyboard shortcut support: 1, 2, 3, 4
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 4) {
        const index = num - 1;
        if (currentQuestion.options[index] !== undefined) {
          handleSelectAnswer(currentQuestion.options[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentQuestion, handleSelectAnswer]);

  const accuracy = useMemo(() => {
    if (totalAnswered === 0) return 0;
    return Math.round((totalCorrect / totalAnswered) * 100);
  }, [totalAnswered, totalCorrect]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xl text-slate-900 dark:text-slate-100 min-h-[560px] flex flex-col justify-between relative overflow-hidden">
      {/* MISSED FLASH */}
      {missedVisual && (
        <div className="absolute inset-0 bg-rose-500/15 pointer-events-none z-20 animate-pulse" />
      )}

      {/* HEADER: Title, Stats, Arrows, Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 text-white dark:text-white shadow-lg shadow-emerald-500/20">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Okçu Şampiyonu
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold">
                Hedef Avı & Geometri
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Açı, alan ve çokgen sorularını çözerek oku tam 12'den fırlat!
            </p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-3">
            {/* Arrows Left */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Oklar:</span>
              <div className="flex gap-1 ml-1">
                {[1, 2, 3].map((a) => (
                  <Heart
                    key={a}
                    className={`w-4 h-4 transition-all ${
                      a <= arrowsLeft
                        ? 'fill-rose-500 text-rose-500 scale-100'
                        : 'fill-slate-300 dark:fill-slate-700 text-slate-300 dark:text-slate-700 scale-90'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <Timer
                className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-spin"
                style={{ animationDuration: '4s' }}
              />
              <span
                className={`font-mono text-base font-black ${
                  timeLeft <= 10
                    ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                    : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* IDLE SCREEN */}
      {gameState === 'idle' && (
        <div className="py-8 sm:py-12 flex flex-col items-center text-center space-y-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <span className="text-5xl sm:text-6xl select-none">🏹</span>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-emerald-400 text-slate-950 rounded-full text-xs font-black shadow-lg">
              3 OK
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Geometri Arenasında Şampiyonluk Mücadelesi!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Üçgen açıları, çokgenler, alan ve çevre hesaplarıyla doğru hedef tahtasını
              seç. Yayın gergin, nefesini tut ve doğru hedefe oku fırlat!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg text-left">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Atış Süresi</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">60 Saniye</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Ok Toleransı</div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">3 Ok</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">İsabet Bonusu</div>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400">+25 Kombo</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Klavye Kısayolu</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">[1] [2] [3] [4]</div>
            </div>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-lg transition-all transform active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
          >
            <Play className="w-6 h-6 fill-current" />
            Turnuvayı Başlat
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'playing' && (
        <div className="py-2 sm:py-4 space-y-4 sm:space-y-6 relative z-10">
          {/* STATS BAR: Score, Bullseyes, Streak, Category */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Puan</span>
              </div>
              <span className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white">
                {score}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🎯</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tam İsabet</span>
              </div>
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {bullseyes}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Kombo</span>
              </div>
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                x{streak}
              </span>
            </div>
          </div>

          {/* TARGET QUESTION ARENA */}
          <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
                {currentQuestion.category}
              </span>
            </div>

            {/* TARGET GRAPHIC & PROMPT */}
            <div className="my-2 flex flex-col items-center justify-center">
              <div className="mb-2">
                {shotFiredVisual ? (
                  <motion.div
                    initial={{ scale: 0.7, rotate: -20 }}
                    animate={{ scale: 1.25, rotate: 0 }}
                    className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 inline-block shadow-md"
                  >
                    <span className="text-4xl">🎯</span>
                  </motion.div>
                ) : (
                  <div className="p-3 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 inline-block shadow-xs">
                    <span className="text-4xl">🏹</span>
                  </div>
                )}
              </div>

              <motion.h3
                key={currentQuestion.prompt}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide select-none max-w-2xl px-2 leading-relaxed"
              >
                {currentQuestion.prompt}
              </motion.h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Doğru hedef tahtasını seç ve oku fırlat!
              </p>
            </div>

            {/* FEEDBACK TOAST */}
            <div className="h-6 mt-3">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.message}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`text-xs sm:text-sm font-bold ${
                      feedback.type === 'correct'
                        ? 'text-accent-success-ink dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 4 TARGET BOARD BUTTONS */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={`${opt}-${idx}`}
                type="button"
                onClick={() => handleSelectAnswer(opt)}
                className="relative py-4 px-6 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 active:bg-emerald-100 dark:active:bg-emerald-900/50 border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white transition-all transform active:scale-95 shadow-md group flex items-center justify-center gap-2"
              >
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-normal group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                  [{idx + 1}]
                </span>
                <span>{opt}</span>
                <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400">
                  {currentQuestion.unit}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* END SCREEN */}
      {gameState === 'ended' && (
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6 relative z-10">
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-xl max-w-md w-full">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center mb-3 shadow-lg">
              <Award className="w-10 h-10 text-white dark:text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {arrowsLeft > 0
                ? '🏹 Turnuva Şampiyonu!'
                : '🎯 Oklar Tükendi!'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {arrowsLeft > 0
                ? `60 saniye boyunca tam ${bullseyes} kez 12'den vurdun!`
                : `İyi bir atış performansı sergiledin! Toplam ${bullseyes} tam isabet kaydettin.`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Kazanılan Skor</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {Math.min(4500, Math.round(score * (scoreMultiplier || 1)))}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Tam İsabet</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {bullseyes} 🎯
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">En Uzun Seri</div>
              <div className="text-xl font-black text-teal-600 dark:text-teal-400">
                {maxStreak}x
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">İsabet Oranı</div>
              <div className="text-xl font-black text-accent-success-ink dark:text-emerald-400">
                %{accuracy}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black active:scale-95 transition-all bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
            >
              <RotateCcw className="w-5 h-5" />
              Tekrar Fırlat
            </button>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white font-bold transition-all border border-slate-200 dark:border-transparent"
              >
                Çıkış
              </button>
            )}
          </div>
        </div>
      )}

      {/* FOOTER TIPS */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 relative z-10">
        <span>Klavye tuşları [1, 2, 3, 4] ile hedefi hızlıca vurabilirsin.</span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}
