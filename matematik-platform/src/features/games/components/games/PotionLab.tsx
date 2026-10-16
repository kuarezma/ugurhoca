'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Flame,
  FlaskConical,
  Heart,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Wand2,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type PotionQuestion = {
  category: string;
  correctAnswer: string;
  options: string[];
  prompt: string;
  recipeName: string;
  recipeIcon: string;
};

const RECIPES = [
  { name: 'Ejderha Nefesi İksiri', icon: '🧪' },
  { name: 'Yıldırım Hızı İksiri', icon: '⚡' },
  { name: 'Zümrüt Kalkan İksiri', icon: '🛡️' },
  { name: 'Bilgelik İksiri', icon: '🌟' },
  { name: 'Alev Fırtınası İksiri', icon: '🔥' },
  { name: 'Buz Kristali İksiri', icon: '❄️' },
  { name: 'Simyacı Gücü İksiri', icon: '🔮' },
  { name: 'Altın Şifa İksiri', icon: '✨' },
];

const BOTTLE_STYLES = [
  {
    id: 0,
    name: 'Yakut Özü',
    colorName: 'Kırmızı',
    borderClass: 'border-rose-400/50 hover:border-rose-500',
    bgClass: 'bg-rose-500/10 hover:bg-rose-500/20',
    badgeClass: 'bg-rose-500 text-white dark:text-white',
    liquidGradient: 'from-rose-500 to-red-600',
    glowColor: 'rgba(244, 63, 94, 0.4)',
  },
  {
    id: 1,
    name: 'Zümrüt Özü',
    colorName: 'Yeşil',
    borderClass: 'border-emerald-400/50 hover:border-emerald-500',
    bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    badgeClass: 'bg-emerald-500 text-white dark:text-white',
    liquidGradient: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 2,
    name: 'Safir Özü',
    colorName: 'Mavi',
    borderClass: 'border-blue-400/50 hover:border-blue-500',
    bgClass: 'bg-blue-500/10 hover:bg-blue-500/20',
    badgeClass: 'bg-blue-500 text-white dark:text-white',
    liquidGradient: 'from-blue-500 to-indigo-600',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  {
    id: 3,
    name: 'Ametist Özü',
    colorName: 'Mor',
    borderClass: 'border-purple-400/50 hover:border-purple-500',
    bgClass: 'bg-purple-500/10 hover:bg-purple-500/20',
    badgeClass: 'bg-purple-500 text-white dark:text-white',
    liquidGradient: 'from-purple-500 to-fuchsia-600',
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generatePotionQuestion(streak: number): PotionQuestion {
  const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  const rand = Math.random();

  let category = 'Kesirler';
  let prompt = '';
  let correctAnswer = '';
  let distractors: string[] = [];

  if (streak > 4 && rand > 0.6) {
    // 7-8. Sınıf: Oran-Orantı & Denklem
    category = 'Oran & Denklem';
    const subType = Math.floor(Math.random() * 2);
    if (subType === 0) {
      const elma = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
      const birim = (Math.floor(Math.random() * 5) + 3) * 5; // 15, 20, 25..
      const fiyat = elma * birim;
      const hedef = elma + Math.floor(Math.random() * 3) + 2;
      const hedefFiyat = hedef * birim;
      prompt = `${elma} iksir tüpü ${fiyat} altın ise, ${hedef} iksir tüpü kaç altındır?`;
      correctAnswer = `${hedefFiyat}`;
      distractors = [
        `${hedefFiyat + birim}`,
        `${hedefFiyat - birim}`,
        `${hedefFiyat + 10}`,
      ];
    } else {
      const x = Math.floor(Math.random() * 7) + 2;
      const a = Math.floor(Math.random() * 3) + 2;
      const b = Math.floor(Math.random() * 8) + 3;
      const toplam = a * x + b;
      prompt = `Gizli İksir Formülü: ${a}x + ${b} = ${toplam}  →  x = ?`;
      correctAnswer = `${x}`;
      distractors = [`${x + 1}`, `${Math.max(1, x - 1)}`, `${x + 2}`];
    }
  } else if (streak > 2 && rand > 0.4) {
    // 6-7. Sınıf: Kesir Toplama & İşlem Önceliği
    category = 'İşlem Önceliği & Kesir';
    const subType = Math.floor(Math.random() * 2);
    if (subType === 0) {
      const a = Math.floor(Math.random() * 6) + 3;
      const b = Math.floor(Math.random() * 5) + 2;
      const c = Math.floor(Math.random() * 10) + 4;
      prompt = `Simyacı Formülü: ${c} + ${a} × ${b} = ?`;
      correctAnswer = `${c + a * b}`;
      distractors = [
        `${(c + a) * b}`,
        `${c + a * b - 5}`,
        `${c + a * b + 4}`,
      ];
    } else {
      const fractions = [
        { q: '1/2 + 1/4', ans: '3/4', dist: ['2/6', '2/4', '1/3'] },
        { q: '3/4 - 1/2', ans: '1/4', dist: ['2/2', '1/2', '2/4'] },
        { q: '2/3 + 1/6', ans: '5/6', dist: ['3/9', '3/6', '1/2'] },
        { q: '5/8 - 1/4', ans: '3/8', dist: ['4/4', '2/8', '1/2'] },
      ];
      const chosen = fractions[Math.floor(Math.random() * fractions.length)];
      prompt = `Büyülü Karışım: ${chosen.q} = ?`;
      correctAnswer = chosen.ans;
      distractors = chosen.dist;
    }
  } else if (rand > 0.5) {
    // 5-6. Sınıf: Kesir-Yüzde-Ondalık Dönüşümü
    category = 'Yüzde & Ondalık';
    const conversions = [
      { q: "3/4'ün ondalık gösterimi nedir?", ans: '0,75', dist: ['0,34', '0,50', '0,70'] },
      { q: "2/5 kesri yüzde kaça eşittir?", ans: '%40', dist: ['%25', '%20', '%50'] },
      { q: "%25'in en sade kesir karşılığı nedir?", ans: '1/4', dist: ['1/25', '2/5', '1/5'] },
      { q: "1/5'in ondalık gösterimi nedir?", ans: '0,2', dist: ['0,15', '0,5', '0,02'] },
      { q: "7/10 kesrinin ondalık gösterimi nedir?", ans: '0,7', dist: ['0,07', '0,70', '7,0'] },
      { q: "%60'ın en sade kesir hali nedir?", ans: '3/5', dist: ['6/10', '2/3', '4/5'] },
      { q: "1/2'nin yüzde karşılığı nedir?", ans: '%50', dist: ['%20', '%25', '%100'] },
    ];
    const item = conversions[Math.floor(Math.random() * conversions.length)];
    prompt = item.q;
    correctAnswer = item.ans;
    distractors = item.dist;
  } else {
    // 5-6. Sınıf: Sadeleştirme & Denk Kesirler
    category = 'Denk Kesirler';
    const simp = [
      { q: "6/8 kesrinin en sade hali nedir?", ans: '3/4', dist: ['2/3', '3/8', '6/4'] },
      { q: "4/12 kesrinin en sade hali nedir?", ans: '1/3', dist: ['1/4', '2/6', '1/2'] },
      { q: "10/15 kesrinin en sade hali nedir?", ans: '2/3', dist: ['1/3', '2/5', '5/3'] },
      { q: "12/16 kesrinin en sade hali nedir?", ans: '3/4', dist: ['6/8', '2/4', '4/5'] },
      { q: "8/20 kesrinin en sade hali nedir?", ans: '2/5', dist: ['4/10', '1/5', '2/10'] },
    ];
    const item = simp[Math.floor(Math.random() * simp.length)];
    prompt = item.q;
    correctAnswer = item.ans;
    distractors = item.dist;
  }

  // Benzersiz 3 çeldirici garantisi
  const uniqueDistractors = Array.from(new Set(distractors.filter((d) => d !== correctAnswer))).slice(0, 3);
  while (uniqueDistractors.length < 3) {
    uniqueDistractors.push(`Cevap ${uniqueDistractors.length + 1}`);
  }

  const options = shuffle([correctAnswer, ...uniqueDistractors]);

  return {
    category,
    correctAnswer,
    options,
    prompt,
    recipeName: recipe.name,
    recipeIcon: recipe.icon,
  };
}

export function PotionLab({
  onExit,
  onScore,
  scoreMultiplier = 1,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [potionsBrewed, setPotionsBrewed] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const [question, setQuestion] = useState<PotionQuestion>(() =>
    generatePotionQuestion(0),
  );

  // Animasyon state'leri
  const [isBrewing, setIsBrewing] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
  const [cauldronState, setCauldronState] = useState<'normal' | 'success' | 'fizz'>('normal');
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'fizz';
  } | null>(null);

  const brewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  const finishGame = useCallback(() => {
    setGameState('ended');
    gameAudio.playFanfare();
  }, []);

  // Geri sayım sayacı
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

  // Skor gönderimi
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

  // Unmount temizliği
  useEffect(() => {
    return () => {
      if (brewTimeoutRef.current) clearTimeout(brewTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setPotionsBrewed(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setTotalAttempts(0);
    setTimeLeft(60);
    setIsBrewing(false);
    setSelectedBottle(null);
    setCauldronState('normal');
    setFeedback(null);
    setQuestion(generatePotionQuestion(0));
    setGameState('playing');
    gameAudio.playPop();
  }, []);

  const handleSelectBottle = useCallback(
    (bottleIndex: number) => {
      if (gameState !== 'playing' || isBrewing) return;

      const chosenOption = question.options[bottleIndex];
      const isCorrect = chosenOption === question.correctAnswer;

      setIsBrewing(true);
      setSelectedBottle(bottleIndex);
      setTotalAttempts((t) => t + 1);

      // Şişe dökülürken kazanda köpürme veya parıldama başlar
      brewTimeoutRef.current = setTimeout(() => {
        if (isCorrect) {
          const newStreak = streak + 1;
          const streakBonus = Math.min(newStreak * 20, 100);
          const pointsEarned = 110 + streakBonus;

          setPotionsBrewed((p) => p + 1);
          setStreak(newStreak);
          setMaxStreak((prev) => Math.max(prev, newStreak));
          setScore((s) => s + pointsEarned);
          setCauldronState('success');

          if (newStreak >= 3) {
            gameAudio.playCombo(newStreak);
          } else {
            gameAudio.playCorrect();
          }

          setFeedback({
            message: `İksir Tamamlandı! ✨ (+${pointsEarned})`,
            type: 'success',
          });
        } else {
          setStreak(0);
          setCauldronState('fizz');
          setLives((l) => {
            const nextLives = l - 1;
            if (nextLives <= 0) {
              finishGame();
            }
            return Math.max(0, nextLives);
          });

          gameAudio.playWrong();
          setFeedback({
            message: `Kazan Köpürdü! 💥 (Doğru Öz: ${question.correctAnswer})`,
            type: 'fizz',
          });
        }

        // Sıradaki iksir tarifine geç
        resetTimeoutRef.current = setTimeout(() => {
          setIsBrewing(false);
          setSelectedBottle(null);
          setCauldronState('normal');
          setFeedback(null);
          setQuestion(generatePotionQuestion(streak + (isCorrect ? 1 : 0)));
        }, 850);
      }, 450);
    },
    [gameState, isBrewing, question, streak, finishGame],
  );

  // Klavye 1, 2, 3, 4 tuşları
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 4) {
        handleSelectBottle(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleSelectBottle]);

  const accuracy = useMemo(() => {
    if (totalAttempts === 0) return 0;
    return Math.round((potionsBrewed / totalAttempts) * 100);
  }, [totalAttempts, potionsBrewed]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xl text-slate-900 dark:text-slate-100 min-h-[580px] flex flex-col justify-between select-none">
      {/* BAŞLIK & BİLGİ ŞERİDİ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white dark:text-white shadow-lg shadow-purple-500/20">
            <FlaskConical className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              İksir Laboratuvarı
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold">
                Büyülü Karışım & Kesirler
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Doğru iksir özünü seç, kazana dök ve sihirli karışımı tamamla!
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

            {/* Skor */}
            <div className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 font-mono font-black text-base">
              {score} Puan
            </div>
          </div>
        )}
      </div>

      {/* BAŞLANGIÇ EKRANI (IDLE) */}
      {gameState === 'idle' && (
        <div className="py-8 sm:py-12 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/20 text-5xl">
              🧪
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black shadow-lg">
              60 SN
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Büyülü İksir Ustasının Çırağı Ol!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Kesir-ondalık-yüzde dönüşümlerini, sadeleştirmeleri ve formülleri
              çöz! Doğru iksir şişesini seçip kazana dökerek efsanevi iksirler üret.
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
              <div className="text-xs text-slate-500 dark:text-slate-400">İksir Şişeleri</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                4 Renkli Şişe
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Simyacı Kombo</div>
              <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                +20 Bonus Puan
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Klavye Tuşları</div>
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
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
            İksir Üretimine Başla
          </button>
        </div>
      )}

      {/* OYUN ALANI (PLAYING) */}
      {gameState === 'playing' && (
        <div className="py-2 space-y-4">
          {/* TARİF KARTI & SORU */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-purple-500/5 dark:bg-slate-800/80 rounded-2xl border border-purple-200 dark:border-purple-800/50 text-center shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{question.recipeIcon}</span>
                <span className="text-sm font-black text-purple-700 dark:text-purple-300">
                  {question.recipeName}
                </span>
              </div>
              {streak >= 2 && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
                  {streak} İksir Serisi!
                </div>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              Gerekli Matematiksel Büyü:
            </div>
            <h3 className="text-xl sm:text-3xl font-black tracking-wide text-slate-900 dark:text-white font-mono my-1 select-none">
              {question.prompt}
            </h3>

            {/* Geri Bildirim Toast */}
            <div className="h-6 mt-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.message}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`text-sm sm:text-base font-black ${
                      feedback.type === 'success'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SİMYACI KAZANI GÖRSEL ALANI */}
          <div className="relative w-full h-[150px] sm:h-[170px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-purple-500/30 shadow-inner flex items-center justify-center">
            {/* Arka plan büyü parıltıları */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-around">
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              <Wand2 className="w-6 h-6 text-indigo-400 animate-bounce" />
              <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>

            {/* Kazan Görseli */}
            <div className="relative flex flex-col items-center">
              {/* Kazandan yükselen buhar/baloncuklar */}
              <motion.div
                className="text-2xl absolute -top-8 select-none"
                animate={{
                  y: [-2, -16, -2],
                  opacity: [0.3, 0.9, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {cauldronState === 'success'
                  ? '✨ 🌟 ✨'
                  : cauldronState === 'fizz'
                  ? '💥 💨 💥'
                  : '🫧 💨 🫧'}
              </motion.div>

              {/* Kazan Gövdesi */}
              <div
                className={`relative w-28 h-24 sm:w-32 sm:h-28 rounded-b-full border-4 shadow-2xl transition-all duration-300 flex items-center justify-center ${
                  cauldronState === 'success'
                    ? 'border-purple-400 bg-gradient-to-t from-purple-700 via-indigo-600 to-fuchsia-500 shadow-purple-500/60'
                    : cauldronState === 'fizz'
                    ? 'border-rose-500 bg-gradient-to-t from-rose-900 via-red-700 to-amber-600 shadow-rose-500/60'
                    : 'border-slate-600 bg-gradient-to-t from-slate-800 via-indigo-900 to-purple-900 shadow-indigo-500/40'
                }`}
              >
                {/* Kazan Sıvısı Yüzeyi */}
                <div className="absolute top-2 inset-x-3 h-5 rounded-full bg-white/20 blur-[1px] animate-pulse" />
                <span className="text-3xl sm:text-4xl drop-shadow-md">
                  {cauldronState === 'success'
                    ? '🔮'
                    : cauldronState === 'fizz'
                    ? '⚡'
                    : '🏺'}
                </span>
              </div>

              {/* Alt Ateş */}
              <div className="flex items-center gap-1 -mt-2">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                <Flame className="w-6 h-6 text-rose-500 animate-bounce" />
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* 4 İKSİR ŞİŞESİ SEÇENEĞİ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {question.options.map((option, idx) => {
              const bottle = BOTTLE_STYLES[idx];
              const isSelected = selectedBottle === idx;

              return (
                <button
                  key={`${option}-${idx}`}
                  type="button"
                  disabled={isBrewing}
                  onClick={() => handleSelectBottle(idx)}
                  className={`relative group p-3.5 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-between text-center shadow-md disabled:cursor-not-allowed ${
                    bottle.borderClass
                  } ${bottle.bgClass} ${
                    isSelected ? 'ring-4 ring-purple-400 scale-105' : ''
                  }`}
                >
                  {/* Kısayol Tuşu & Şişe Başlığı */}
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                      [{idx + 1}]
                    </span>
                    <span>{bottle.name}</span>
                  </div>

                  {/* Şişe İkonu & Sıvı Animasyonu */}
                  <motion.div
                    className="my-2 text-4xl"
                    animate={
                      isSelected
                        ? {
                            rotate: [-15, 30, 0],
                            y: [-5, -12, 0],
                          }
                        : {}
                    }
                    transition={{ duration: 0.4 }}
                  >
                    🧪
                  </motion.div>

                  {/* Değer / Şık */}
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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center mb-3 shadow-lg">
              <Award className="w-10 h-10 text-white dark:text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {potionsBrewed >= 12
                ? '🧙‍♂️ Baş Simyacı Unvanı!'
                : potionsBrewed >= 7
                ? '✨ Usta İksir Yapıcı!'
                : '🧪 Simyacı Çırağı!'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {totalAttempts} denemede tam {potionsBrewed} adet büyülü iksir
              üretmeyi başardın!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Kazanılan Puan</div>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400">
                {Math.min(4500, Math.round(score * (scoreMultiplier || 1)))}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Başarı Oranı</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                %{accuracy}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">En Uzun Seri</div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {maxStreak} İksir
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Üretilen / Denenen</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {potionsBrewed} / {totalAttempts}
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
              Tekrar Üret
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
        <span>Klavye: [1, 2, 3, 4] tuşlarıyla 4 iksir şişesinden birini hızlıca dökebilirsin.</span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}
