'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Compass,
  Egg,
  Flame,
  Footprints,
  Heart,
  Play,
  RotateCcw,
  Timer,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type ObstacleType = {
  name: string;
  icon: string;
  colorClass: string;
};

const OBSTACLES: ObstacleType[] = [
  { name: 'Dev Kaktüs', icon: '🌵', colorClass: 'text-emerald-500' },
  { name: 'Kor Meteor', icon: '☄️', colorClass: 'text-amber-500' },
  { name: 'Lav Çukuru', icon: '🌋', colorClass: 'text-rose-500' },
  { name: 'Kaya Bloğu', icon: '🪨', colorClass: 'text-slate-400' },
];

type DinoQuestion = {
  category: string;
  correctAnswer: number;
  obstacle: ObstacleType;
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

function generateDinoQuestion(streak: number): DinoQuestion {
  const obstacle = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
  const rand = Math.random();

  let category = 'Zihinden Hesap';
  let prompt = '';
  let correctAnswer = 0;

  if (streak > 4 && rand > 0.6) {
    // 7-8. Sınıf: Çarpanlar, Asal Çarpanlar ve EBOB/EKOK
    category = 'Çarpanlar & Katlar';
    const sub = Math.floor(Math.random() * 3);
    if (sub === 0) {
      // 60'ın asal çarpanları toplamı: 2 + 3 + 5 = 10
      // 30'un asal çarpanları: 2 + 3 + 5 = 10
      // 42'nin asal çarpanları: 2 + 3 + 7 = 12
      // 70'in asal çarpanları: 2 + 5 + 7 = 14
      const list = [
        { num: 30, sum: 10 },
        { num: 42, sum: 12 },
        { num: 70, sum: 14 },
        { num: 84, sum: 12 }, // 2, 3, 7
      ];
      const pick = list[Math.floor(Math.random() * list.length)];
      prompt = `${pick.num} sayısının farklı asal çarpanları toplamı?`;
      correctAnswer = pick.sum;
    } else if (sub === 1) {
      const a = (Math.floor(Math.random() * 3) + 2) * 6; // 12, 18, 24
      const b = (Math.floor(Math.random() * 3) + 2) * 8; // 16, 24, 32
      const gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
      prompt = `EBOB(${a}, ${b}) = ?`;
      correctAnswer = gcd(a, b);
    } else {
      const x = Math.floor(Math.random() * 7) + 3;
      prompt = `3x - 7 = ${3 * x - 7}  →  x = ?`;
      correctAnswer = x;
    }
  } else if (streak > 2 && rand > 0.45) {
    // 6-7. Sınıf: Tam Sayılar & Üslü Sayılar
    category = 'Tam Sayılar & Üs';
    const sub = Math.floor(Math.random() * 3);
    if (sub === 0) {
      const a = Math.floor(Math.random() * 12) + 4;
      const b = Math.floor(Math.random() * 12) + 4;
      prompt = `(-${a}) + (-${b}) = ?`;
      correctAnswer = -(a + b);
    } else if (sub === 1) {
      const a = Math.floor(Math.random() * 7) + 3;
      const b = Math.floor(Math.random() * 6) + 3;
      prompt = `(-${a}) × (-${b}) = ?`;
      correctAnswer = a * b;
    } else {
      const base = Math.floor(Math.random() * 3) + 2;
      const exp = base === 2 ? 5 : base === 3 ? 3 : 2;
      const subVal = Math.floor(Math.random() * 10) + 2;
      prompt = `${base}${exp === 5 ? '⁵' : exp === 3 ? '³' : '²'} - ${subVal} = ?`;
      correctAnswer = Math.pow(base, exp) - subVal;
    }
  } else if (rand > 0.65) {
    // 5-6. Sınıf: Geometri / Çevre / Alan
    category = 'Geometri & Alan';
    const sub = Math.floor(Math.random() * 2);
    if (sub === 0) {
      const side = Math.floor(Math.random() * 6) + 4; // 4..9
      prompt = `Bir kenarı ${side} cm olan karenin alanı kaç cm²'dir?`;
      correctAnswer = side * side;
    } else {
      const a = Math.floor(Math.random() * 6) + 5;
      const b = Math.floor(Math.random() * 5) + 3;
      prompt = `Kenarları ${a} ve ${b} cm olan dikdörtgenin çevresi?`;
      correctAnswer = 2 * (a + b);
    }
  } else {
    // 5-6. Sınıf: Hızlı Çarpma & Yüzde
    category = 'Hızlı Hesap';
    const sub = Math.floor(Math.random() * 2);
    if (sub === 0) {
      const a = Math.floor(Math.random() * 6) + 6; // 6..11
      const b = Math.floor(Math.random() * 6) + 11; // 11..16
      prompt = `${a} × ${b} = ?`;
      correctAnswer = a * b;
    } else {
      const base = (Math.floor(Math.random() * 6) + 2) * 20; // 40, 60, 80..
      prompt = `${base} sayısının %25'i = ?`;
      correctAnswer = base / 4;
    }
  }

  // 3 çeldirici üret
  const distractors = new Set<number>();
  const offsets = [-3, -2, -1, 1, 2, 3, 5, -5, 10];
  for (const off of offsets) {
    const candidate = correctAnswer + off;
    if (candidate !== correctAnswer) {
      distractors.add(candidate);
      if (distractors.size === 3) break;
    }
  }
  while (distractors.size < 3) {
    const candidate = correctAnswer + Math.floor(Math.random() * 11) - 5;
    if (candidate !== correctAnswer) {
      distractors.add(candidate);
    }
  }

  const options = shuffle([correctAnswer, ...Array.from(distractors)]);

  return {
    category,
    correctAnswer,
    obstacle,
    options,
    prompt,
  };
}

export function DinoRunner({
  onExit,
  onScore,
  scoreMultiplier = 1,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [eggsCollected, setEggsCollected] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [totalJumps, setTotalJumps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const [question, setQuestion] = useState<DinoQuestion>(() =>
    generateDinoQuestion(0),
  );

  // Animasyon state'leri
  const [isJumping, setIsJumping] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [selectedRamp, setSelectedRamp] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'jump' | 'hit';
  } | null>(null);

  const jumpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  const finishGame = useCallback(() => {
    setGameState('ended');
    gameAudio.playFanfare();
  }, []);

  // 60 Saniye Zamanlayıcı
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

  // Skor Gönderimi
  useEffect(() => {
    if (gameState === 'playing') {
      hasSubmittedRef.current = false;
    }
    if (gameState === 'ended' && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      const safeFinalScore = Math.min(
        4500,
        Math.round(score * (scoreMultiplier || 1)),
      );
      onScore(safeFinalScore);
    }
  }, [gameState, score, scoreMultiplier, onScore]);

  // Unmount anında zamanlayıcıları temizle
  useEffect(() => {
    const jumpRef = jumpTimeoutRef;
    const resetRef = resetTimeoutRef;
    return () => {
      if (jumpRef.current) clearTimeout(jumpRef.current);
      if (resetRef.current) clearTimeout(resetRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setDistance(0);
    setEggsCollected(0);
    setLives(3);
    setStreak(0);
    setTotalJumps(0);
    setTimeLeft(60);
    setIsJumping(false);
    setIsHit(false);
    setSelectedRamp(null);
    setFeedback(null);
    setQuestion(generateDinoQuestion(0));
    setGameState('playing');
    gameAudio.playPop();
  }, []);

  const handleJump = useCallback(
    (rampIndex: number) => {
      if (gameState !== 'playing' || isJumping || isHit) return;

      const chosenOption = question.options[rampIndex];
      const isCorrect = chosenOption === question.correctAnswer;

      setSelectedRamp(rampIndex);
      setTotalJumps((j) => j + 1);

      if (isCorrect) {
        setIsJumping(true);
        const newStreak = streak + 1;
        const streakBonus = Math.min(newStreak * 20, 100);
        const pointsEarned = 100 + streakBonus;

        setEggsCollected((e) => e + 1);
        setDistance((d) => d + 50);
        setStreak(newStreak);
        setScore((s) => s + pointsEarned);

        if (newStreak >= 3) {
          gameAudio.playCombo(newStreak);
        } else {
          gameAudio.playLevelUp();
        }

        setFeedback({
          message: `Harika Zıplama! 🦖✨ (+${pointsEarned} Puan, +50m)`,
          type: 'jump',
        });
      } else {
        setIsHit(true);
        setStreak(0);
        setLives((l) => {
          const nextLives = l - 1;
          if (nextLives <= 0) {
            finishGame();
          }
          return Math.max(0, nextLives);
        });

        gameAudio.playWhack();
        setFeedback({
          message: `Engele Çarptın! 💥 (Doğru Rampa: ${question.correctAnswer})`,
          type: 'hit',
        });
      }

      // Sıradaki engele geçiş
      resetTimeoutRef.current = setTimeout(() => {
        setIsJumping(false);
        setIsHit(false);
        setSelectedRamp(null);
        setFeedback(null);
        setQuestion(generateDinoQuestion(streak + (isCorrect ? 1 : 0)));
      }, 850);
    },
    [gameState, isJumping, isHit, question, streak, finishGame],
  );

  // Klavye 1, 2, 3, 4 tuşları
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 4) {
        handleJump(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleJump]);

  const accuracy = useMemo(() => {
    if (totalJumps === 0) return 0;
    return Math.round((eggsCollected / totalJumps) * 100);
  }, [totalJumps, eggsCollected]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xl text-slate-900 dark:text-slate-100 min-h-[580px] flex flex-col justify-between select-none">
      {/* BAŞLIK & BİLGİ ŞERİDİ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white dark:text-white shadow-lg shadow-orange-500/20">
            <Footprints className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Dinozor Macerası
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                Sonsuz Koşu & Zihin Hesabı
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Engelleri matematik gücünle aş, altın dinozor yumurtalarını topla!
            </p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-3">
            {/* Can Göstergesi */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/40">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-all ${
                    i < lives
                      ? 'fill-rose-500 text-rose-500 scale-100'
                      : 'fill-slate-300 dark:fill-slate-700 text-slate-300 dark:text-slate-700 scale-90'
                  }`}
                />
              ))}
            </div>

            {/* Süre */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
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

            {/* Mesafe */}
            <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 font-mono font-bold text-sm flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              {distance}m
            </div>

            {/* Skor */}
            <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-mono font-black text-base">
              {score} Puan
            </div>
          </div>
        )}
      </div>

      {/* BAŞLANGIÇ EKRANI (IDLE) */}
      {gameState === 'idle' && (
        <div className="py-8 sm:py-12 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/20 text-5xl">
              🦖
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-emerald-500 text-slate-950 rounded-full text-xs font-black shadow-lg">
              60 SN
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Tarih Öncesi Koşuya Hazır mısın?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              T-Rex parkurda hızla koşarken önüne lavlar, meteorlar ve kaktüsler
              çıkacak. Doğru matematik rampasını seç, engellerin üstünden uçup altın
              yumurtaları kap!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg text-left">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Süre & Can</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                60 Sn / 3 Can
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Engeller</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Lav, Meteor, Kaktüs
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Altın Yumurta</div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                +100 Puan & 50m
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Klavye Rampaları</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                1 - 2 - 3 - 4
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-lg transition-all transform active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
          >
            <Play className="w-6 h-6 fill-current" />
            Parkura Çık
          </button>
        </div>
      )}

      {/* OYUN ALANI (PLAYING) */}
      {gameState === 'playing' && (
        <div className="py-2 space-y-4">
          {/* SORU VE ENGEL BİLGİ KARTI */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:bg-slate-800/80 rounded-2xl border border-amber-200 dark:border-amber-800/50 text-center shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{question.obstacle.icon}</span>
                <span className="text-sm font-black text-amber-700 dark:text-amber-300">
                  {question.obstacle.name} Yaklaşıyor!
                </span>
              </div>
              {streak >= 2 && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
                  {streak} Zıplama Serisi!
                </div>
              )}
            </div>

            <h3 className="text-xl sm:text-3xl font-black tracking-wide text-slate-900 dark:text-white font-mono my-1 select-none">
              {question.prompt}
            </h3>

            {/* Geri bildirim mesajı */}
            <div className="h-6 mt-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.message}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`text-sm sm:text-base font-black ${
                      feedback.type === 'jump'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* DİNOZOR KOŞU PARKURU (GÖRSEL SİMÜLASYON) */}
          <div className="relative w-full h-[180px] sm:h-[210px] rounded-2xl overflow-hidden bg-gradient-to-b from-sky-200 via-amber-100 to-amber-200 dark:from-slate-900 dark:via-amber-950/40 dark:to-stone-900 border-2 border-amber-400/40 shadow-inner flex flex-col justify-end p-4">
            {/* Arka plan bulutları & tarih öncesi silüetler */}
            <div className="absolute top-2 left-6 text-xl opacity-60">☁️</div>
            <div className="absolute top-5 right-12 text-lg opacity-50">☁️</div>
            <div className="absolute top-8 left-1/3 text-xs opacity-40">🌋</div>

            {/* Zıplama Alanında Asılı Altın Yumurta */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-8 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/80 text-slate-950 font-bold text-xs shadow-md"
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Egg className="w-4 h-4 fill-amber-300" />
              <span>Altın Yumurta</span>
            </motion.div>

            {/* ZEMİN & YOL ÇİZGİSİ */}
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-stone-800 to-amber-900/80 border-t-4 border-amber-600/60" />

            {/* DİNOZOR VE ENGEL ALANI */}
            <div className="relative z-10 w-full flex items-end justify-between px-6 sm:px-12 mb-2">
              {/* KOŞAN T-REX DİNOZOR */}
              <motion.div
                className="text-5xl sm:text-6xl drop-shadow-lg"
                animate={
                  isJumping
                    ? {
                        y: [-0, -65, 0],
                        x: [0, 40, 0],
                        rotate: [0, -15, 0],
                      }
                    : isHit
                    ? {
                        x: [-10, 10, -10, 0],
                        rotate: [0, 20, 0],
                      }
                    : {
                        y: [0, -4, 0],
                      }
                }
                transition={{
                  duration: isJumping ? 0.6 : isHit ? 0.4 : 0.35,
                  repeat: isJumping || isHit ? 0 : Infinity,
                }}
              >
                🦖
              </motion.div>

              {/* YAKLAŞAN ENGEL */}
              <motion.div
                className="text-4xl sm:text-5xl drop-shadow-md flex flex-col items-center"
                animate={
                  isHit
                    ? { scale: [1, 1.3, 1], rotate: [0, 10, 0] }
                    : { x: [10, 0, 10] }
                }
                transition={{ duration: 0.8, repeat: isHit ? 0 : Infinity }}
              >
                <span>{question.obstacle.icon}</span>
                <span className="text-[10px] font-black tracking-tight text-white dark:text-white bg-slate-900/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-white/20">
                  {question.obstacle.name}
                </span>
              </motion.div>
            </div>
          </div>

          {/* 4 ZIPLAMA RAMPASI SEÇENEĞİ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedRamp === idx;

              return (
                <button
                  key={`${option}-${idx}`}
                  type="button"
                  disabled={isJumping || isHit}
                  onClick={() => handleJump(idx)}
                  className={`relative group p-3.5 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-between text-center shadow-md disabled:cursor-not-allowed bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/50 hover:border-amber-500 ${
                    isSelected ? 'ring-4 ring-amber-400 scale-105' : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                      [{idx + 1}]
                    </span>
                    <span>Rampa {idx + 1}</span>
                  </div>

                  <div className="my-2 text-3xl">🪨</div>

                  <div className="w-full py-1.5 px-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-lg sm:text-xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* OYUN BİTİŞ EKRANI (ENDED) */}
      {gameState === 'ended' && (
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6">
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg">
              <Award className="w-10 h-10 text-white dark:text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {eggsCollected >= 12
                ? '👑 Dinozorlar Çağının Kralı!'
                : eggsCollected >= 7
                ? '🦖 Hızlı Koşucu T-Rex!'
                : '🦕 Macera Tamamlandı!'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {distance} metre koştun ve toplam {eggsCollected} altın dinozor
              yumurtası topladın!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Toplam Puan</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {Math.min(4500, Math.round(score * (scoreMultiplier || 1)))}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Zıplama Başarısı</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                %{accuracy}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Koşulan Mesafe</div>
              <div className="text-xl font-black text-sky-600 dark:text-sky-400">
                {distance}m
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Altın Yumurta</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {eggsCollected} / {totalJumps}
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
              Yeniden Koş
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

      {/* ALT BİLGİ */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
        <span>Klavye: [1, 2, 3, 4] tuşlarıyla dinozoru doğru rampadan zıplatabilirsin.</span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}
