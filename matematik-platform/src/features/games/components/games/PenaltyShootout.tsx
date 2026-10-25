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
  Trophy,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type CornerPosition = 0 | 1 | 2 | 3; // 0: Sol Üst (90), 1: Sağ Üst (90), 2: Sol Alt, 3: Sağ Alt

type ShootoutQuestion = {
  category: string;
  correctAnswer: number;
  options: number[];
  prompt: string;
};

const CORNERS: {
  id: CornerPosition;
  label: string;
  subLabel: string;
  targetX: number; // Yüzde (%) bazında top hedefi
  targetY: number;
}[] = [
  { id: 0, label: 'Sol Üst 90', subLabel: 'Çatal', targetX: 20, targetY: 22 },
  { id: 1, label: 'Sağ Üst 90', subLabel: 'Çatal', targetX: 80, targetY: 22 },
  { id: 2, label: 'Sol Alt', subLabel: 'Plase', targetX: 20, targetY: 78 },
  { id: 3, label: 'Sağ Alt', subLabel: 'Plase', targetX: 80, targetY: 78 },
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateShootoutQuestion(streak: number): ShootoutQuestion {
  const rand = Math.random();
  let category = 'Dört İşlem';
  let prompt = '';
  let correctAnswer = 0;

  if (streak > 4 && rand > 0.6) {
    // 7-8. Sınıf: Basit Denklem / Cebir
    category = 'Cebir & Denklem';
    const x = Math.floor(Math.random() * 8) + 2;
    const a = Math.floor(Math.random() * 4) + 2;
    const b = Math.floor(Math.random() * 12) + 1;
    const isMinus = Math.random() > 0.5;
    if (isMinus) {
      const total = a * x - b;
      prompt = `${a}x - ${b} = ${total}  →  x = ?`;
    } else {
      const total = a * x + b;
      prompt = `${a}x + ${b} = ${total}  →  x = ?`;
    }
    correctAnswer = x;
  } else if (streak > 2 && rand > 0.5) {
    // 6-7. Sınıf: Üslü İfade & İşlem Önceliği
    category = 'Üslü & Öncelik';
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      const base = Math.floor(Math.random() * 4) + 2;
      const exp = base === 2 ? 4 : base === 3 ? 3 : 2;
      const add = Math.floor(Math.random() * 15) + 5;
      const powVal = Math.pow(base, exp);
      prompt = `${base}${exp === 2 ? '²' : exp === 3 ? '³' : '⁴'} + ${add} = ?`;
      correctAnswer = powVal + add;
    } else if (type === 1) {
      const a = Math.floor(Math.random() * 6) + 3;
      const b = Math.floor(Math.random() * 5) + 2;
      const c = Math.floor(Math.random() * 12) + 6;
      prompt = `${c} + ${a} × ${b} = ?`;
      correctAnswer = c + a * b;
    } else {
      const a = Math.floor(Math.random() * 6) + 4;
      const b = Math.floor(Math.random() * 3) + 2;
      prompt = `(${a} - ${b})² = ?`;
      correctAnswer = Math.pow(a - b, 2);
    }
  } else if (rand > 0.65) {
    // 5-7. Sınıf: Yüzde & Katlar
    category = 'Yüzdeler & Katlar';
    const percentType = Math.floor(Math.random() * 3);
    if (percentType === 0) {
      const whole = (Math.floor(Math.random() * 8) + 2) * 50; // 100, 150, 200..
      const percent = (Math.floor(Math.random() * 4) + 1) * 10; // 10, 20, 30, 40
      prompt = `${whole} sayısının %${percent}'i = ?`;
      correctAnswer = Math.round((whole * percent) / 100);
    } else if (percentType === 1) {
      const a = (Math.floor(Math.random() * 4) + 2) * 4;
      const b = (Math.floor(Math.random() * 4) + 2) * 6;
      // EKOK veya EBOB
      const gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
      const ebob = gcd(a, b);
      prompt = `EBOB(${a}, ${b}) = ?`;
      correctAnswer = ebob;
    } else {
      const base = (Math.floor(Math.random() * 5) + 1) * 20;
      prompt = `${base}'nin %50'si = ?`;
      correctAnswer = base / 2;
    }
  } else {
    // 5-6. Sınıf: Dört İşlem
    category = 'Hızlı Dört İşlem';
    const op = Math.floor(Math.random() * 4);
    if (op === 0) {
      const a = Math.floor(Math.random() * 45) + 15;
      const b = Math.floor(Math.random() * 45) + 15;
      prompt = `${a} + ${b} = ?`;
      correctAnswer = a + b;
    } else if (op === 1) {
      const a = Math.floor(Math.random() * 60) + 35;
      const b = Math.floor(Math.random() * 30) + 10;
      prompt = `${a} - ${b} = ?`;
      correctAnswer = a - b;
    } else if (op === 2) {
      const a = Math.floor(Math.random() * 9) + 4;
      const b = Math.floor(Math.random() * 8) + 3;
      prompt = `${a} × ${b} = ?`;
      correctAnswer = a * b;
    } else {
      const b = Math.floor(Math.random() * 8) + 3;
      const ans = Math.floor(Math.random() * 10) + 2;
      prompt = `${b * ans} ÷ ${b} = ?`;
      correctAnswer = ans;
    }
  }

  // 3 çeldirici üret
  const distractors = new Set<number>();
  const offsets = [-4, -3, -2, -1, 1, 2, 3, 4, 10, -10];
  for (const off of offsets) {
    const candidate = correctAnswer + off;
    if (candidate !== correctAnswer && candidate >= 0) {
      distractors.add(candidate);
      if (distractors.size === 3) break;
    }
  }
  while (distractors.size < 3) {
    const candidate = Math.max(1, correctAnswer + Math.floor(Math.random() * 13) - 6);
    if (candidate !== correctAnswer) {
      distractors.add(candidate);
    }
  }

  const options = shuffle([correctAnswer, ...Array.from(distractors)]);

  return {
    category,
    correctAnswer,
    options,
    prompt,
  };
}

export function PenaltyShootout({
  onExit,
  onScore,
  scoreMultiplier = 1,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [goals, setGoals] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalShots, setTotalShots] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const [question, setQuestion] = useState<ShootoutQuestion>(() =>
    generateShootoutQuestion(0),
  );

  // Animasyon state'leri
  const [isShooting, setIsShooting] = useState(false);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({
    x: 50,
    y: 86,
  }); // Yüzde (%)
  const [goalkeeperPos, setGoalkeeperPos] = useState<CornerPosition | 'center'>('center');
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'goal' | 'saved';
  } | null>(null);

  const shotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  const finishGame = useCallback(() => {
    setGameState('ended');
    gameAudio.playFanfare();
  }, []);

  // Zamanlayıcı (60 saniye)
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

  // Tek seferlik skor gönderimi
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

  // Temizlik: Unmount anında asılı timerları sıfırla
  useEffect(() => {
    return () => {
      if (shotTimeoutRef.current) clearTimeout(shotTimeoutRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setGoals(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setTotalShots(0);
    setTimeLeft(60);
    setIsShooting(false);
    setBallPosition({ x: 50, y: 86 });
    setGoalkeeperPos('center');
    setFeedback(null);
    setQuestion(generateShootoutQuestion(0));
    setGameState('playing');
    gameAudio.playPop();
  }, []);

  const handleShoot = useCallback(
    (cornerIndex: CornerPosition) => {
      if (gameState !== 'playing' || isShooting) return;

      const chosenOption = question.options[cornerIndex];
      const isCorrect = chosenOption === question.correctAnswer;
      const corner = CORNERS[cornerIndex];

      setIsShooting(true);
      setTotalShots((s) => s + 1);

      // Topu seçilen köşeye fırlat
      setBallPosition({ x: corner.targetX, y: corner.targetY });

      // Kaleci yapay zekası:
      // Eğer doğru cevapsa kaleci ters veya farklı bir köşeye uçar (gol olur!)
      // Eğer yanlış cevapsa kaleci tam topun gittiği köşeye uçar ve şutu kurtarır!
      if (isCorrect) {
        // Doğru köşeden farklı bir köşe seç
        const wrongCorners = ([0, 1, 2, 3] as CornerPosition[]).filter(
          (c) => c !== cornerIndex,
        );
        const randomKeeperCorner =
          wrongCorners[Math.floor(Math.random() * wrongCorners.length)];
        setGoalkeeperPos(randomKeeperCorner);
      } else {
        // Kaleci topun gittiği köşeye atlar ve kurtarır
        setGoalkeeperPos(cornerIndex);
      }

      // Şut sonucu değerlendirmesi
      shotTimeoutRef.current = setTimeout(() => {
        if (isCorrect) {
          const newStreak = streak + 1;
          const streakBonus = Math.min(newStreak * 25, 125);
          const pointsEarned = 120 + streakBonus;

          setGoals((g) => g + 1);
          setStreak(newStreak);
          setMaxStreak((prev) => Math.max(prev, newStreak));
          setScore((s) => s + pointsEarned);

          if (newStreak >= 3) {
            gameAudio.playCombo(newStreak);
          } else {
            gameAudio.playNitro();
          }

          setFeedback({
            message: `GOOOOL! ⚽🔥 (+${pointsEarned})`,
            type: 'goal',
          });
        } else {
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
            message: `Kaleci Kurtardı! 🧤 (Cevap: ${question.correctAnswer})`,
            type: 'saved',
          });
        }

        // Yeni soruya geç ve topu penaltı noktasına sıfırla
        feedbackTimeoutRef.current = setTimeout(() => {
          setBallPosition({ x: 50, y: 86 });
          setGoalkeeperPos('center');
          setIsShooting(false);
          setFeedback(null);
          setQuestion(generateShootoutQuestion(streak + (isCorrect ? 1 : 0)));
        }, 900);
      }, 550);
    },
    [gameState, isShooting, question, streak, finishGame],
  );

  // Klavye tuşları (1, 2, 3, 4)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 4) {
        handleShoot((num - 1) as CornerPosition);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleShoot]);

  const accuracy = useMemo(() => {
    if (totalShots === 0) return 0;
    return Math.round((goals / totalShots) * 100);
  }, [totalShots, goals]);

  // Kaleci konum koordinatları
  const keeperTransform = useMemo(() => {
    switch (goalkeeperPos) {
      case 0:
        return 'translate(-90px, -45px) rotate(-35deg)';
      case 1:
        return 'translate(90px, -45px) rotate(35deg)';
      case 2:
        return 'translate(-80px, 30px) rotate(-20deg)';
      case 3:
        return 'translate(80px, 30px) rotate(20deg)';
      case 'center':
      default:
        return 'translate(0px, 0px) rotate(0deg)';
    }
  }, [goalkeeperPos]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xl text-slate-900 dark:text-slate-100 min-h-[580px] flex flex-col justify-between select-none">
      {/* ÜST BAŞLIK & BİLGİ ŞERİDİ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white dark:text-white shadow-lg shadow-emerald-500/20">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Penaltı Şampiyonu
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                Futbol & Hızlı İşlem
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Soruyu çöz, köşeyi seç ve kaleciyi avla!
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
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 text-5xl">
              ⚽
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black shadow-lg">
              60 SN
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Kalecinin karşısına geçmeye hazır mısın?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Dört işlem, üslü ifadeler ve yüzdeleri zihinden hesapla! Doğru cevabın
              olduğu köşeye şutunu çek, kaleciyi ters köşeye yatırarak seriyi yakala!
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
              <div className="text-xs text-slate-500 dark:text-slate-400">Şut Hedefi</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                4 Kale Köşesi
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Ateşli Seri</div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                +25 Puan Kombo
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Klavye Tuşları</div>
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
            Penaltılara Başla
          </button>
        </div>
      )}

      {/* OYUN ALANI (PLAYING) */}
      {gameState === 'playing' && (
        <div className="py-2 space-y-4">
          {/* SORU VE GERİ BİLDİRİM PANELİ */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                {question.category}
              </span>
              {streak >= 2 && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
                  {streak} Gol Serisi!
                </div>
              )}
            </div>

            <h3 className="text-2xl sm:text-4xl font-black tracking-wider text-slate-900 dark:text-white font-mono my-1 select-none">
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
                      feedback.type === 'goal'
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

          {/* FUTBOL STADYUMU & KALE ALANI */}
          <div className="relative w-full h-[260px] sm:h-[300px] rounded-2xl overflow-hidden border-2 border-emerald-600/30 dark:border-emerald-500/30 bg-gradient-to-b from-emerald-800 to-emerald-950 shadow-inner flex flex-col justify-between p-3 sm:p-4">
            {/* Çim Saha Çizgileri ve Kale Ağı Deseni */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.15) 20px, rgba(255,255,255,0.15) 40px)',
              }}
            />

            {/* Kale Arka Ağı Çerçevesi */}
            <div className="absolute inset-x-8 sm:inset-x-12 top-3 bottom-12 border-4 border-white/80 dark:border-slate-100/70 rounded-t-lg bg-emerald-900/40 backdrop-blur-[1px] shadow-2xl">
              {/* Ağ Deseni */}
              <div
                className="w-full h-full opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
                  backgroundSize: '16px 16px',
                }}
              />
            </div>

            {/* ORTADAKİ KALECİ */}
            <div
              className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out z-10 pointer-events-none flex flex-col items-center"
              style={{ transform: keeperTransform }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-2 border-white/80 dark:border-white/90">
                🧤
              </div>
              <span className="text-[10px] font-black tracking-tight text-white dark:text-white bg-slate-950/70 dark:bg-slate-950/70 px-2 py-0.5 rounded-full mt-1 border border-white/20">
                Kaleci
              </span>
            </div>

            {/* 4 ŞUT KÖŞESİ (KALE İÇİ HEDEFLER & BUTONLAR) */}
            <div className="relative z-20 w-full h-full grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 p-2 sm:p-4">
              {CORNERS.map((corner) => {
                const optionValue = question.options[corner.id];
                return (
                  <button
                    key={corner.id}
                    type="button"
                    disabled={isShooting}
                    onClick={() => handleShoot(corner.id)}
                    className="relative group p-2.5 sm:p-3 rounded-xl bg-slate-900/60 hover:bg-emerald-600/60 active:bg-emerald-700/80 border-2 border-white/40 hover:border-amber-400 text-white dark:text-white transition-all transform active:scale-95 flex flex-col justify-between shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        {corner.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-mono font-bold">
                        [{corner.id + 1}]
                      </span>
                    </div>

                    <div className="text-xl sm:text-3xl font-black font-mono tracking-wider text-white text-center my-auto drop-shadow-md">
                      {optionValue}
                    </div>

                    <div className="text-[10px] text-slate-300 font-medium text-left">
                      {corner.subLabel}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* FUTBOL TOPU (HAREKETLİ ANİMASYON) */}
            <motion.div
              className="absolute z-30 pointer-events-none text-2xl sm:text-3xl filter drop-shadow-2xl"
              animate={{
                left: `${ballPosition.x}%`,
                top: `${ballPosition.y}%`,
                scale: isShooting ? 0.75 : 1.05,
                rotate: isShooting ? 720 : 0,
              }}
              transition={{
                duration: isShooting ? 0.45 : 0.25,
                ease: 'easeOut',
              }}
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              ⚽
            </motion.div>

            {/* Penaltı Noktası */}
            <div className="absolute left-1/2 bottom-2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/70 shadow-sm pointer-events-none" />
          </div>
        </div>
      )}

      {/* OYUN BİTİŞ EKRANI (ENDED) */}
      {gameState === 'ended' && (
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6">
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center mb-3 shadow-lg">
              <Award className="w-10 h-10 text-white dark:text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {goals >= 12
                ? '🏆 Efsane Gol Kralı!'
                : goals >= 7
                ? '⚽ Harika Penaltı Ustası!'
                : '🧤 Mücadele Tamamlandı!'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {totalShots} şutta toplam {goals} gol attın ve kaleciyi terlettin!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Toplam Puan</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {Math.min(4500, Math.round(score * (scoreMultiplier || 1)))}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">İsabet Oranı</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                %{accuracy}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">En Uzun Seri</div>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                {maxStreak} Gol
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">Gol / Şut</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {goals} / {totalShots}
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
              Tekrar Oyna
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

      {/* ALT BİLGİ & KISAYOLLAR */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
        <span>Klavye: [1, 2, 3, 4] tuşları ile 4 köşeye doğrudan şut çekebilirsin.</span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}
