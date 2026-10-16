'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Crosshair,
  Flame,
  Heart,
  Play,
  RotateCcw,
  Shield,
  Timer,
  Zap,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type MeteorCategory =
  | 'Tam Sayılar'
  | 'Üslü İfadeler'
  | 'Kareköklü İfadeler'
  | 'İşlem Önceliği';

type MeteorQuestion = {
  category: MeteorCategory;
  correctAnswer: number;
  options: number[];
  prompt: string;
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateMeteorQuestion(streak: number): MeteorQuestion {
  const rand = Math.random();
  let category: MeteorCategory = 'Tam Sayılar';
  let prompt = '';
  let correctAnswer = 0;

  if (streak > 4 && rand > 0.6) {
    // Kareköklü İfadeler
    category = 'Kareköklü İfadeler';
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const roots = [
        { r: 4, s: 16 },
        { r: 5, s: 25 },
        { r: 6, s: 36 },
        { r: 7, s: 49 },
        { r: 8, s: 64 },
        { r: 9, s: 81 },
        { r: 10, s: 100 },
        { r: 11, s: 121 },
        { r: 12, s: 144 },
      ];
      const a = roots[Math.floor(Math.random() * roots.length)];
      const b = roots[Math.floor(Math.random() * roots.length)];
      prompt = `√${a.s} + √${b.s} = ?`;
      correctAnswer = a.r + b.r;
    } else if (type === 1) {
      const aVal = Math.floor(Math.random() * 5) + 8; // 8 to 12
      const bVal = Math.floor(Math.random() * 4) + 2; // 2 to 5
      prompt = `√${aVal * aVal} - √${bVal * bVal} = ?`;
      correctAnswer = aVal - bVal;
    } else if (type === 2) {
      const k = Math.floor(Math.random() * 3) + 2;
      const root = Math.floor(Math.random() * 6) + 3;
      prompt = `${k} × √${root * root} = ?`;
      correctAnswer = k * root;
    } else {
      const a = [16, 36, 64, 100][Math.floor(Math.random() * 4)];
      prompt = `√${a} + 15 = ?`;
      correctAnswer = Math.round(Math.sqrt(a)) + 15;
    }
  } else if (streak > 2 && rand > 0.35) {
    // Üslü İfadeler
    category = 'Üslü İfadeler';
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const base = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
      const exp = base === 2 ? 5 : base === 3 ? 3 : 2;
      const sub = Math.floor(Math.random() * 12) + 2;
      prompt = `${base}${exp === 2 ? '²' : exp === 3 ? '³' : '⁵'} - ${sub} = ?`;
      correctAnswer = Math.pow(base, exp) - sub;
    } else if (type === 1) {
      prompt = `(-3)³ + 35 = ?`;
      correctAnswer = -27 + 35; // 8
    } else if (type === 2) {
      const base = Math.floor(Math.random() * 4) + 2;
      prompt = `${base}² + 4² = ?`;
      correctAnswer = base * base + 16;
    } else {
      prompt = `10² - 8² = ?`;
      correctAnswer = 100 - 64; // 36
    }
  } else if (rand > 0.65) {
    // İşlem Önceliği
    category = 'İşlem Önceliği';
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      const a = Math.floor(Math.random() * 20) + 10;
      const b = Math.floor(Math.random() * 5) + 2;
      const c = Math.floor(Math.random() * 6) + 2;
      prompt = `${a} - ${b} × ${c} = ?`;
      correctAnswer = a - b * c;
    } else if (type === 1) {
      const sum = Math.floor(Math.random() * 10) * 2 + 10;
      prompt = `(${sum} - 4) ÷ 2 = ?`;
      correctAnswer = (sum - 4) / 2;
    } else {
      const a = Math.floor(Math.random() * 7) + 3;
      const b = Math.floor(Math.random() * 6) + 2;
      const c = Math.floor(Math.random() * 15) + 5;
      prompt = `${c} + ${a} × ${b} = ?`;
      correctAnswer = c + a * b;
    }
  } else {
    // Tam Sayılar (Toplama, çıkarma, çarpma, bölme)
    category = 'Tam Sayılar';
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const a = -(Math.floor(Math.random() * 25) + 5);
      const b = Math.floor(Math.random() * 30) + 5;
      prompt = `(${a}) + (+${b}) = ?`;
      correctAnswer = a + b;
    } else if (type === 1) {
      const a = -(Math.floor(Math.random() * 9) + 2);
      const b = -(Math.floor(Math.random() * 9) + 2);
      prompt = `(${a}) × (${b}) = ?`;
      correctAnswer = a * b;
    } else if (type === 2) {
      const divisor = -(Math.floor(Math.random() * 7) + 2);
      const ans = Math.floor(Math.random() * 8) + 2;
      const dividend = divisor * ans;
      prompt = `(${dividend}) ÷ (${divisor}) = ?`;
      correctAnswer = ans;
    } else {
      const a = Math.floor(Math.random() * 20) + 5;
      const b = -(Math.floor(Math.random() * 15) + 5);
      prompt = `(+${a}) - (${b}) = ?`;
      correctAnswer = a - b;
    }
  }

  // Generate 3 unique distractors
  const distractors = new Set<number>();
  const candidates = [
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
    -correctAnswer,
    correctAnswer + 5,
    correctAnswer - 5,
    correctAnswer + 10,
    correctAnswer - 10,
  ];

  for (const c of candidates) {
    if (c !== correctAnswer && Number.isFinite(c)) {
      distractors.add(c);
      if (distractors.size === 3) break;
    }
  }

  while (distractors.size < 3) {
    const off = (Math.floor(Math.random() * 9) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const candidate = correctAnswer + off;
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
  };
}

export function MeteorDefense({
  onExit,
  onScore,
  scoreMultiplier = 1,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [shields, setShields] = useState(3);
  const [destroyedMeteors, setDestroyedMeteors] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [laserFiring, setLaserFiring] = useState(false);
  const [impactEffect, setImpactEffect] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<MeteorQuestion>(() =>
    generateMeteorQuestion(0),
  );
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'correct' | 'wrong';
  } | null>(null);

  const laserTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const impactTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  const finishGame = useCallback(() => {
    setGameState('ended');
    gameAudio.playFanfare();
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setShields(3);
    setDestroyedMeteors(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalAnswered(0);
    setTotalCorrect(0);
    setTimeLeft(60);
    setFeedback(null);
    setLaserFiring(false);
    setImpactEffect(false);
    setCurrentQuestion(generateMeteorQuestion(0));
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
      if (laserTimeoutRef.current) clearTimeout(laserTimeoutRef.current);
      if (impactTimeoutRef.current) clearTimeout(impactTimeoutRef.current);
    };
  }, []);

  // Submit score safely once upon game over
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
    setCurrentQuestion(generateMeteorQuestion(currentStreak));
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
        setDestroyedMeteors((d) => d + 1);

        const streakBonus = Math.min(newStreak * 25, 125);
        const points = 100 + streakBonus;
        setScore((s) => s + points);

        // Visual laser firing
        setLaserFiring(true);
        if (laserTimeoutRef.current) clearTimeout(laserTimeoutRef.current);
        laserTimeoutRef.current = setTimeout(() => setLaserFiring(false), 380);

        if (newStreak >= 3) {
          gameAudio.playNitro();
          gameAudio.playCombo(newStreak);
          setFeedback({
            message: `Meteor İmha Edildi! 💥🛸 Kombo x${newStreak} (+${points})`,
            type: 'correct',
          });
        } else {
          gameAudio.playNitro();
          setFeedback({
            message: `Meteor İmha Edildi! 💥🛸 (+${points})`,
            type: 'correct',
          });
        }
        nextQuestion(newStreak);
      } else {
        setStreak(0);
        gameAudio.playWhack();

        // Visual impact flash
        setImpactEffect(true);
        if (impactTimeoutRef.current) clearTimeout(impactTimeoutRef.current);
        impactTimeoutRef.current = setTimeout(() => setImpactEffect(false), 450);

        const nextShields = shields - 1;
        setShields(nextShields);

        if (nextShields <= 0) {
          setFeedback({
            message: `Kalkan Çöktü! Doğru Frekans: ${currentQuestion.correctAnswer} 💥`,
            type: 'wrong',
          });
          finishGame();
        } else {
          setFeedback({
            message: `Kalkan Darbe Aldı! Doğru Frekans: ${currentQuestion.correctAnswer} ⚠️`,
            type: 'wrong',
          });
          nextQuestion(0);
        }
      }
    },
    [gameState, currentQuestion, streak, shields, nextQuestion, finishGame],
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
      {/* SHIELD IMPACT RED FLASH OVERLAY */}
      {impactEffect && (
        <div className="absolute inset-0 bg-rose-500/20 pointer-events-none z-20 animate-pulse" />
      )}

      {/* HEADER: Title, Stats, Shields, Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white dark:text-white shadow-lg shadow-rose-500/20">
            <Crosshair className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Meteor Savunması
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-semibold">
                Uzay Kalkanı & Tam Sayılar
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Üsse yaklaşan meteorların matematiksel frekansını çöz ve lazerle imha et!
            </p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-3">
            {/* Shields / Energy */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <div className="flex gap-1 ml-1">
                {[1, 2, 3].map((s) => (
                  <Heart
                    key={s}
                    className={`w-4 h-4 transition-all ${
                      s <= shields
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
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-rose-500/20">
              <span className="text-5xl sm:text-6xl animate-bounce select-none">☄️</span>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-cyan-500 text-slate-950 rounded-full text-xs font-black shadow-lg">
              3 KALKAN
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Gezegen Üssü Tehdit Altında!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Uzaydan hızla yaklaşan devasa meteorları engellemek için doğru frekans
              kodunu gir ve lazer savunma topunu ateşle. Tam sayılar, üslü ifadeler ve
              kareköklü işlemlerle gezegeni koru!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg text-left">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Görev Süresi</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">60 Saniye</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Kalkan Enerjisi</div>
              <div className="text-base font-bold text-cyan-600 dark:text-cyan-400">3 Hak</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Lazer Kombo</div>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400">+25 Bonus</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Hızlı Ateşleme</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">[1] [2] [3] [4]</div>
            </div>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-lg transition-all transform active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
          >
            <Play className="w-6 h-6 fill-current" />
            Savunmayı Başlat
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'playing' && (
        <div className="py-2 sm:py-4 space-y-4 sm:space-y-6 relative z-10">
          {/* STATS BAR: Score, Meteors, Streak */}
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
                <span className="text-sm">💥</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">İmha</span>
              </div>
              <span className="text-lg sm:text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                {destroyedMeteors}
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

          {/* SPACE BATTLE ARENA & QUESTION */}
          <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-inner relative overflow-hidden">
            {/* LASER BEAM ANIMATION */}
            {laserFiring && (
              <motion.div
                initial={{ scaleX: 0, opacity: 1 }}
                animate={{ scaleX: 1, opacity: 0.9 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 sm:h-3 bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400 shadow-lg shadow-cyan-400/80 pointer-events-none z-10"
              />
            )}

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
                {currentQuestion.category}
              </span>
            </div>

            {/* METEOR VISUAL WITH PROCESS */}
            <div className="my-2 flex flex-col items-center justify-center">
              <motion.div
                key={currentQuestion.prompt}
                initial={{ scale: 0.85, y: -8 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 text-3xl sm:text-5xl font-black font-mono text-amber-600 dark:text-amber-300 tracking-wider select-none"
              >
                <span className="text-4xl sm:text-5xl">☄️</span>
                <span>{currentQuestion.prompt}</span>
              </motion.div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lazer frekansını seçerek meteoru vur!
              </div>
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

          {/* 4 LASER FREQUENCY BUTTONS */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={`${opt}-${idx}`}
                type="button"
                onClick={() => handleSelectAnswer(opt)}
                className="relative py-4 px-6 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 active:bg-cyan-100 dark:active:bg-cyan-900/50 border-2 border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white transition-all transform active:scale-95 shadow-md group flex items-center justify-center gap-3"
              >
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-normal group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
                  [{idx + 1}]
                </span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* END SCREEN */}
      {gameState === 'ended' && (
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6 relative z-10">
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-xl max-w-md w-full">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center mb-3 shadow-lg">
              <Award className="w-10 h-10 text-white dark:text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {shields > 0
                ? '🏆 Gezegen Savunuldu!'
                : '🛡️ Kalkan Enerjisi Tükendi!'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {shields > 0
                ? `60 saniyede toplam ${destroyedMeteors} meteor imha ettin ve üssü kurtardın!`
                : `Üs zorlu bir saldırı atlattı. Toplam ${destroyedMeteors} meteor imha edildi.`}
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
              <div className="text-xs text-slate-500 dark:text-slate-400">İmha Edilen</div>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                {destroyedMeteors} ☄️
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">En Uzun Kombo</div>
              <div className="text-xl font-black text-cyan-600 dark:text-cyan-400">
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
              Yeniden Savun
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
        <span>Klavye tuşları [1, 2, 3, 4] ile lazeri anında ateşleyebilirsin.</span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}
