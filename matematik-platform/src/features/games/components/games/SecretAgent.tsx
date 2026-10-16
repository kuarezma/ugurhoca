'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Flame,
  Gem,
  Heart,
  KeyRound,
  Lock,
  Play,
  RotateCcw,
  Timer,
  Unlock,
  Zap,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type AgentCategory =
  | 'İşlem Zinciri'
  | 'Çarpan & Bölünebilme'
  | 'Dedektif Bilmecesi'
  | 'Kripto Kasa Kodu';

type AgentQuestion = {
  category: AgentCategory;
  correctAnswer: number;
  options: number[];
  prompt: string;
  subHint: string;
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateAgentQuestion(streak: number): AgentQuestion {
  const rand = Math.random();
  let category: AgentCategory = 'İşlem Zinciri';
  let prompt = '';
  let subHint = '';
  let correctAnswer = 0;
  let customDistractors: number[] | null = null;

  if (streak > 5 && rand > 0.6) {
    // Kripto Kasa Kodu (Kareköklü & Üslü)
    category = 'Kripto Kasa Kodu';
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const cube = 27;
      prompt = `√144 + 3³ = ?`;
      subHint = 'Kareköklü ifade ile üslü sayıyı topla';
      correctAnswer = 12 + cube; // 39
    } else if (type === 1) {
      prompt = `2⁵ - √49 = ?`;
      subHint = '2 üssü 5 değerinden 49 sayısının karekökünü çıkar';
      correctAnswer = 32 - 7; // 25
    } else if (type === 2) {
      prompt = `√81 × 2³ = ?`;
      subHint = '81 sayısının karekökü ile 2 üssü 3 değerini çarp';
      correctAnswer = 9 * 8; // 72
    } else {
      prompt = `4³ - √100 = ?`;
      subHint = '4 üssü 3 değerinden 100 sayısının karekökünü çıkar';
      correctAnswer = 64 - 10; // 54
    }
  } else if (streak > 2 && rand > 0.45) {
    // Dedektif Bilmecesi
    category = 'Dedektif Bilmecesi';
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const mid = (Math.floor(Math.random() * 8) + 5) * 2; // 10, 12, ... 24
      const sum = mid * 3;
      prompt = `Ardışık 3 tam sayının toplamı ${sum} ise ortanca sayı kaçtır?`;
      subHint = 'Üç sayının toplamını 3’e böl';
      correctAnswer = mid;
    } else if (type === 1) {
      const x = Math.floor(Math.random() * 8) + 3;
      const mult = Math.floor(Math.random() * 3) + 3; // 3, 4, 5
      const sub = Math.floor(Math.random() * 6) + 3;
      const res = x * mult - sub;
      prompt = `Bir sayının ${mult} katının ${sub} eksiği ${res} ise bu sayı kaçtır?`;
      subHint = 'Ters işlem yap: Önce ekle, sonra böl';
      correctAnswer = x;
    } else if (type === 2) {
      const half = Math.floor(Math.random() * 15) + 8;
      const add = Math.floor(Math.random() * 10) + 5;
      const res = half + add;
      prompt = `Yarısının ${add} fazlası ${res} olan sayı kaçtır?`;
      subHint = 'Önce fazlalığı çıkar, ardından 2 ile çarp';
      correctAnswer = half * 2;
    } else {
      const x = Math.floor(Math.random() * 6) + 4;
      prompt = `5 katı, kendisinin 2 katının ${3 * x} fazlasına eşit olan sayı kaçtır?`;
      subHint = '5x = 2x + fark denkleminde x değerini bul';
      correctAnswer = x;
    }
  } else if (rand > 0.6) {
    // Çarpan & Bölünebilme
    category = 'Çarpan & Bölünebilme';
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const mults = [45, 60, 75, 90, 105];
      const ans = mults[Math.floor(Math.random() * mults.length)];
      prompt = `Aşağıdakilerden hangisi hem 3'e hem 5'e kalansız bölünür?`;
      subHint = 'Son basamağı 0 veya 5 ve rakamları toplamı 3’ün katı olmalı';
      correctAnswer = ans;
      customDistractors = [ans - 5, ans + 4, ans + 10].map((v) => (v % 15 === 0 ? v + 7 : v));
    } else if (type === 1) {
      const primes = [
        { num: 60, maxPrime: 5, dist: [2, 3, 7] },
        { num: 42, maxPrime: 7, dist: [2, 3, 5] },
        { num: 84, maxPrime: 7, dist: [2, 3, 11] },
        { num: 70, maxPrime: 7, dist: [2, 5, 13] },
        { num: 55, maxPrime: 11, dist: [3, 5, 7] },
      ];
      const selected = primes[Math.floor(Math.random() * primes.length)];
      prompt = `${selected.num} sayısının en büyük asal çarpanı kaçtır?`;
      subHint = 'Asal çarpan ağacını veya bölen listesini hatırla';
      correctAnswer = selected.maxPrime;
      customDistractors = selected.dist;
    } else if (type === 2) {
      const ebobs = [
        { a: 24, b: 36, ans: 12, dist: [6, 8, 18] },
        { a: 30, b: 45, ans: 15, dist: [5, 10, 20] },
        { a: 18, b: 24, ans: 6, dist: [3, 8, 12] },
        { a: 40, b: 60, ans: 20, dist: [10, 15, 30] },
      ];
      const item = ebobs[Math.floor(Math.random() * ebobs.length)];
      prompt = `EBOB(${item.a}, ${item.b}) değeri kaçtır?`;
      subHint = 'Her iki sayıyı da bölen en büyük ortak böleni bul';
      correctAnswer = item.ans;
      customDistractors = item.dist;
    } else {
      const ekoks = [
        { a: 6, b: 8, ans: 24, dist: [16, 18, 48] },
        { a: 4, b: 6, ans: 12, dist: [8, 18, 24] },
        { a: 8, b: 12, ans: 24, dist: [16, 32, 48] },
        { a: 10, b: 15, ans: 30, dist: [20, 25, 60] },
      ];
      const item = ekoks[Math.floor(Math.random() * ekoks.length)];
      prompt = `EKOK(${item.a}, ${item.b}) değeri kaçtır?`;
      subHint = 'İki sayının en küçük ortak katını hesapla';
      correctAnswer = item.ans;
      customDistractors = item.dist;
    }
  } else {
    // İşlem Zinciri
    category = 'İşlem Zinciri';
    const chainType = Math.floor(Math.random() * 3);
    if (chainType === 0) {
      const a = 12;
      const b = 3;
      const c = 6;
      const d = 5;
      prompt = `${a}  →  (×${b})  →  (-${c})  →  (÷${d})  =  ?`;
      subHint = 'Ok yönünü sırayla takip et';
      correctAnswer = (a * b - c) / d; // (36 - 6) / 5 = 6
    } else if (chainType === 1) {
      const a = 8;
      const b = 16;
      const c = 4;
      const d = 7;
      prompt = `${a}  →  (+${b})  →  (÷${c})  →  (×${d})  =  ?`;
      subHint = 'Sırayla topla, dörde böl ve yediyle çarp';
      correctAnswer = ((a + b) / c) * d; // (24 / 4) * 7 = 42
    } else {
      const a = 15;
      const b = 4;
      const c = 20;
      const d = 8;
      prompt = `${a}  →  (×${b})  →  (+${c})  →  (÷${d})  =  ?`;
      subHint = 'Sırayla çarp, yirmi ekle ve sekize böl';
      correctAnswer = (a * b + c) / d; // (60 + 20) / 8 = 10
    }
  }

  // Generate 3 unique distractors
  const distractors = new Set<number>();
  if (customDistractors) {
    customDistractors.forEach((d) => {
      if (d !== correctAnswer && Number.isFinite(d)) {
        distractors.add(d);
      }
    });
  }

  const offsets = [1, -1, 2, -2, 3, -3, 5, -5, 10, -10];
  for (const off of offsets) {
    const candidate = correctAnswer + off;
    if (candidate !== correctAnswer && candidate >= 0) {
      distractors.add(candidate);
      if (distractors.size === 3) break;
    }
  }

  while (distractors.size < 3) {
    const candidate = Math.max(1, correctAnswer + Math.floor(Math.random() * 11) - 5);
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
    subHint,
  };
}

export function SecretAgent({
  onExit,
  onScore,
  scoreMultiplier = 1,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [alarmsLeft, setAlarmsLeft] = useState(3);
  const [crackedSafes, setCrackedSafes] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [safeUnlockedVisual, setSafeUnlockedVisual] = useState(false);
  const [alarmTriggeredVisual, setAlarmTriggeredVisual] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<AgentQuestion>(() =>
    generateAgentQuestion(0),
  );
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'correct' | 'wrong';
  } | null>(null);

  const visualTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  const finishGame = useCallback(() => {
    setGameState('ended');
    gameAudio.playFanfare();
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setAlarmsLeft(3);
    setCrackedSafes(0);
    setDiamonds(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalAnswered(0);
    setTotalCorrect(0);
    setTimeLeft(60);
    setFeedback(null);
    setSafeUnlockedVisual(false);
    setAlarmTriggeredVisual(false);
    setCurrentQuestion(generateAgentQuestion(0));
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
      if (visualTimeoutRef.current) clearTimeout(visualTimeoutRef.current);
      if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
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
    setCurrentQuestion(generateAgentQuestion(currentStreak));
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
        setCrackedSafes((s) => s + 1);
        setDiamonds((d) => d + (newStreak >= 3 ? 2 : 1));

        const streakBonus = Math.min(newStreak * 25, 125);
        const points = 120 + streakBonus;
        setScore((s) => s + points);

        // Safe unlocked visual trigger
        setSafeUnlockedVisual(true);
        if (visualTimeoutRef.current) clearTimeout(visualTimeoutRef.current);
        visualTimeoutRef.current = setTimeout(() => setSafeUnlockedVisual(false), 450);

        if (newStreak >= 3) {
          gameAudio.playLevelUp();
          gameAudio.playCombo(newStreak);
          setFeedback({
            message: `Kasa Açıldı! 💎🔓 Kombo x${newStreak} (+${points})`,
            type: 'correct',
          });
        } else {
          gameAudio.playCorrect();
          setFeedback({
            message: `Kasa Açıldı! 💎🔓 (+${points})`,
            type: 'correct',
          });
        }
        nextQuestion(newStreak);
      } else {
        setStreak(0);
        gameAudio.playWrong();

        // Alarm flash visual trigger
        setAlarmTriggeredVisual(true);
        if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
        alarmTimeoutRef.current = setTimeout(() => setAlarmTriggeredVisual(false), 450);

        const nextAlarms = alarmsLeft - 1;
        setAlarmsLeft(nextAlarms);

        if (nextAlarms <= 0) {
          setFeedback({
            message: `Alarm Çaldı! Doğru Şifre: ${currentQuestion.correctAnswer} 🚨`,
            type: 'wrong',
          });
          finishGame();
        } else {
          setFeedback({
            message: `Alarm Çaldı! Yanlış Şifre: ${selectedAnswer} (Doğru: ${currentQuestion.correctAnswer}) 🚨`,
            type: 'wrong',
          });
          nextQuestion(0);
        }
      }
    },
    [gameState, currentQuestion, streak, alarmsLeft, nextQuestion, finishGame],
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

  const vaultTier = useMemo(() => {
    if (crackedSafes >= 10) return { name: 'Elmas Kasa 💎', color: 'text-cyan-600 dark:text-cyan-400' };
    if (crackedSafes >= 7) return { name: 'Altın Kasa 🥇', color: 'text-amber-600 dark:text-amber-400' };
    if (crackedSafes >= 4) return { name: 'Gümüş Kasa 🥈', color: 'text-slate-600 dark:text-slate-300' };
    return { name: 'Bronz Kasa 🥉', color: 'text-orange-600 dark:text-orange-400' };
  }, [crackedSafes]);

  const accuracy = useMemo(() => {
    if (totalAnswered === 0) return 0;
    return Math.round((totalCorrect / totalAnswered) * 100);
  }, [totalAnswered, totalCorrect]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xl text-slate-900 dark:text-slate-100 min-h-[560px] flex flex-col justify-between relative overflow-hidden">
      {/* ALARM TRIGGERED RED FLASH */}
      {alarmTriggeredVisual && (
        <div className="absolute inset-0 bg-rose-500/20 pointer-events-none z-20 animate-pulse" />
      )}

      {/* HEADER: Title, Stats, Alarms, Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 text-white dark:text-white shadow-lg shadow-purple-500/20">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Gizli Ajan: Kasa Şifresi
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-semibold">
                Dedektif & Şifre Kırma
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Yüksek güvenlikli elmas kasalarının matematiksel şifrelerini çöz!
            </p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-3">
            {/* Alarm Lives */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Alarmlar:</span>
              <div className="flex gap-1 ml-1">
                {[1, 2, 3].map((a) => (
                  <Heart
                    key={a}
                    className={`w-4 h-4 transition-all ${
                      a <= alarmsLeft
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
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <span className="text-5xl sm:text-6xl select-none">🕵️‍♂️</span>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black shadow-lg">
              3 ALARM
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Operasyon: Elmas Kasası Kilitleri!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Her kasada gizli bir matematik bilmecesi, işlem zinciri veya bölünebilme
              ipucu bulunuyor. 3 alarm hakkını tüketmeden şifreleri çöz ve en çok elması
              toplayan ajan ol!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg text-left">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Görev Süresi</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">60 Saniye</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Alarm Toleransı</div>
              <div className="text-base font-bold text-rose-600 dark:text-rose-400">3 Hak</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Kasa Seviyesi</div>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400">Bronz → Elmas</div>
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
            Operasyonu Başlat
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'playing' && (
        <div className="py-2 sm:py-4 space-y-4 sm:space-y-6 relative z-10">
          {/* STATS BAR: Score, Diamonds, Cracked Safes, Vault Tier */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Puan</span>
              </div>
              <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                {score}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Elmas</span>
              </div>
              <span className="text-lg font-black font-mono text-cyan-600 dark:text-cyan-400">
                {diamonds} 💎
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Açılan Kasa</span>
              </div>
              <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                {crackedSafes}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Kasa Seviyesi</span>
              </div>
              <span className={`text-xs font-black ${vaultTier.color}`}>
                {vaultTier.name}
              </span>
            </div>
          </div>

          {/* VAULT QUESTION BOX */}
          <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
                {currentQuestion.category}
              </span>
            </div>

            {/* VAULT ICON & PROMPT */}
            <div className="my-2 flex flex-col items-center justify-center">
              <div className="mb-2">
                {safeUnlockedVisual ? (
                  <motion.div
                    initial={{ scale: 0.8, rotate: -15 }}
                    animate={{ scale: 1.2, rotate: 0 }}
                    className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 inline-block shadow-md"
                  >
                    <Unlock className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <div className="p-3 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 inline-block shadow-xs">
                    <Lock className="w-8 h-8" />
                  </div>
                )}
              </div>

              <motion.h3
                key={currentQuestion.prompt}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-2xl sm:text-4xl font-black font-mono text-indigo-700 dark:text-indigo-300 tracking-wide select-none max-w-2xl px-2"
              >
                {currentQuestion.prompt}
              </motion.h3>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                İpucu: {currentQuestion.subHint}
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

          {/* 4 CODE KEYPAD BUTTONS */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={`${opt}-${idx}`}
                type="button"
                onClick={() => handleSelectAnswer(opt)}
                className="relative py-4 px-6 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 active:bg-indigo-100 dark:active:bg-indigo-900/50 border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white transition-all transform active:scale-95 shadow-md group flex items-center justify-center gap-3"
              >
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-normal group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 flex items-center justify-center mb-3 shadow-lg">
              <Award className="w-10 h-10 text-white dark:text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {alarmsLeft > 0
                ? '🕵️‍♂️ Görev Başarıyla Tamamlandı!'
                : '🚨 Güvenlik Sistemi Kilitlendi!'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {alarmsLeft > 0
                ? `Operasyon sona erdi! Toplam ${crackedSafes} kasa açtın ve ${diamonds} elmas ele geçirdin.`
                : `3 alarm çaldı ve kasalar kilitlendi. Toplam ${crackedSafes} kasa açıldı.`}
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
              <div className="text-xs text-slate-500 dark:text-slate-400">Kasa & Elmas</div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {crackedSafes} 🔓 / {diamonds} 💎
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">En Uzun Seri</div>
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
              Yeni Operasyon
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
        <span>Klavye tuşları [1, 2, 3, 4] ile şifreyi hızlıca girebilirsin.</span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}
