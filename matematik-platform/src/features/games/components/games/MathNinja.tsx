'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Heart,
  Play,
  RotateCcw,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type MissionType = 'prime' | 'even' | 'odd' | 'mult3' | 'mult5' | 'square';

type Mission = {
  type: MissionType;
  title: string;
  check: (n: number) => boolean;
  desc: string;
};

const isPrime = (n: number): boolean => {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
};

const isSquare = (n: number): boolean => {
  const root = Math.round(Math.sqrt(n));
  return root * root === n;
};

const MISSIONS: Mission[] = [
  {
    type: 'even',
    title: 'Çift Sayıları Dilimle!',
    check: (n) => n % 2 === 0,
    desc: '2, 4, 6, 8, 10, 12...',
  },
  {
    type: 'prime',
    title: 'Asal Sayıları Dilimle!',
    check: (n) => isPrime(n),
    desc: '2, 3, 5, 7, 11, 13, 17, 19, 23...',
  },
  {
    type: 'mult3',
    title: "3'ün Katlarını Dilimle!",
    check: (n) => n % 3 === 0,
    desc: '3, 6, 9, 12, 15, 18, 21...',
  },
  {
    type: 'mult5',
    title: "5'in Katlarını Dilimle!",
    check: (n) => n % 5 === 0,
    desc: '5, 10, 15, 20, 25, 30...',
  },
  {
    type: 'square',
    title: 'Tam Kare Sayıları Dilimle!',
    check: (n) => isSquare(n),
    desc: '4, 9, 16, 25, 36, 49, 64, 81...',
  },
];

type FruitItem = {
  id: number;
  num: number;
  emoji: string;
  isBomb: boolean;
  isSliced: boolean;
  x: number; // percentage (10 to 85)
  y: number; // percentage (15 to 80)
  scale: number;
};

const FRUIT_EMOJIS = ['🍉', '🍊', '🍎', '🍍', '🍓', '🍇', '🍋'];

export function MathNinja({
  onScore,
  scoreMultiplier,
  onExit,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [fruits, setFruits] = useState<FruitItem[]>([]);
  const [floatingText, setFloatingText] = useState<
    { id: number; text: string; x: number; y: number; color: string }[]
  >([]);
  const fruitCounterRef = useRef(0);

  const mission = MISSIONS[currentMissionIdx];

  const finishGame = useCallback(
    (finalScore: number) => {
      setGameState('ended');
      gameAudio.playFanfare();
      onScore(finalScore);
    },
    [onScore],
  );

  const startNewGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setCombo(0);
    setTimeLeft(60);
    setCurrentMissionIdx(Math.floor(Math.random() * MISSIONS.length));
    setFruits([]);
    setFloatingText([]);
    fruitCounterRef.current = 0;
  }, []);

  // Main game timer
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

  // Mission rotator every 15 seconds
  useEffect(() => {
    if (gameState !== 'playing') return;

    const rotator = setInterval(() => {
      setCurrentMissionIdx((prev) => (prev + 1) % MISSIONS.length);
    }, 15000);

    return () => clearInterval(rotator);
  }, [gameState]);

  // Spawner for fruits and bombs
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawner = setInterval(() => {
      setFruits((prev) => {
        // Keep at most 5 active fruits
        const activeFruits = prev.filter((f) => !f.isSliced).slice(-4);

        fruitCounterRef.current += 1;
        const isBomb = Math.random() < 0.15; // 15% bomb chance

        // Generate number suited to mission or distractor
        let num = Math.floor(Math.random() * 50) + 2;
        if (!isBomb && Math.random() < 0.55) {
          // guarantee 55% chance of valid match to make game fast-paced
          if (mission.type === 'even')
            num = (Math.floor(Math.random() * 25) + 1) * 2;
          else if (mission.type === 'prime') {
            const primes = [
              2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
            ];
            num = primes[Math.floor(Math.random() * primes.length)];
          } else if (mission.type === 'mult3')
            num = (Math.floor(Math.random() * 16) + 1) * 3;
          else if (mission.type === 'mult5')
            num = (Math.floor(Math.random() * 12) + 1) * 5;
          else if (mission.type === 'square') {
            const sqs = [4, 9, 16, 25, 36, 49, 64, 81, 100];
            num = sqs[Math.floor(Math.random() * sqs.length)];
          }
        }

        const newFruit: FruitItem = {
          id: fruitCounterRef.current,
          num,
          emoji: isBomb
            ? '💣'
            : FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)],
          isBomb,
          isSliced: false,
          x: Math.floor(Math.random() * 70) + 12,
          y: Math.floor(Math.random() * 60) + 18,
          scale: 1,
        };

        return [...activeFruits, newFruit];
      });
    }, 1100);

    return () => clearInterval(spawner);
  }, [gameState, mission]);

  // Clean old sliced fruits
  useEffect(() => {
    if (gameState !== 'playing') return;
    const cleaner = setInterval(() => {
      setFruits((prev) => prev.filter((f) => !f.isSliced));
    }, 1200);
    return () => clearInterval(cleaner);
  }, [gameState]);

  const addFloatingFeedback = (
    text: string,
    x: number,
    y: number,
    color: string,
  ) => {
    const id = Date.now() + Math.random();
    setFloatingText((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingText((prev) => prev.filter((item) => item.id !== id));
    }, 1000);
  };

  const sliceItem = (item: FruitItem) => {
    if (item.isSliced) return;

    // Mark as sliced
    setFruits((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, isSliced: true } : f)),
    );

    gameAudio.playSlice();

    if (item.isBomb) {
      // Sliced a bomb!
      gameAudio.playWrong();
      const nextLives = lives - 1;
      setLives(nextLives);
      setCombo(0);
      addFloatingFeedback('BOMBA! -1 Can 💥', item.x, item.y, 'text-rose-400');

      if (nextLives <= 0) {
        finishGame(score);
      }
      return;
    }

    const isValid = mission.check(item.num);

    if (isValid) {
      gameAudio.playCorrect();
      const nextCombo = combo + 1;
      setCombo(nextCombo);

      const bonus = nextCombo >= 3 ? nextCombo * 10 : 0;
      const points = (30 + bonus) * scoreMultiplier;
      setScore((prev) => prev + points);

      if (nextCombo >= 2) {
        setTimeout(() => gameAudio.playCombo(nextCombo), 150);
        addFloatingFeedback(
          nextCombo >= 4
            ? `KOMBO x${nextCombo}! EFSANEVİ! 🔥`
            : `KOMBO x${nextCombo}! ⚡`,
          item.x,
          item.y,
          'text-amber-300',
        );
      } else {
        addFloatingFeedback(`+${points}`, item.x, item.y, 'text-emerald-400');
      }
    } else {
      gameAudio.playWrong();
      setCombo(0);
      const nextLives = lives - 1;
      setLives(nextLives);
      addFloatingFeedback(
        'Hatalı Meyve! -1 Can',
        item.x,
        item.y,
        'text-rose-400',
      );

      if (nextLives <= 0) {
        finishGame(score);
      }
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-2xl select-none overflow-hidden rounded-3xl border border-rose-500/30 bg-slate-950 p-6 text-white shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 shadow-lg shadow-rose-500/30">
            <Swords className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-rose-300">
              Matematik Ninja
            </h2>
            <p className="text-xs text-slate-400">
              Doğru sayıları dilimle, kılıcını konuştur!
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
                    i < lives ? 'fill-red-500 text-red-500' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <div className="rounded-xl bg-rose-500/20 px-3 py-1 text-rose-300">
              Süre: {timeLeft}s
            </div>
            <div className="rounded-xl bg-amber-500/20 px-3 py-1 font-display text-amber-300">
              {score} Puan
            </div>
          </div>
        )}
      </div>

      {gameState === 'idle' && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 shadow-xl shadow-rose-500/40">
            <Swords className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Hazır mısın Genç Ninja?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
            Ekranda beliren meyvelerden görev kuralına uyanları kes! Bombalardan
            ve yanlış sayılardan kaçın. Kombo yaptıkça ekstra puan kazan!
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              <Play className="h-5 w-5" /> Kılıcını Çek & Başla
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          {/* Mission Bar */}
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500/20 to-orange-500/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-amber-400" />
              <div>
                <span className="text-xs uppercase tracking-wider text-rose-400 font-bold">
                  NİNJA GÖREVİ
                </span>
                <div className="text-lg font-bold text-white">
                  {mission.title}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">İpucu</span>
              <div className="text-xs font-semibold text-amber-300">
                {mission.desc}
              </div>
            </div>
          </div>

          {/* Interactive Dojo Arena */}
          <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950">
            {/* Combo indicator */}
            {combo >= 2 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-400 border border-amber-500/30"
              >
                <Flame className="h-4 w-4 fill-amber-400" /> {combo}x KOMBO!
              </motion.div>
            )}

            {/* Flying fruits / bombs */}
            {fruits.map((item) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  item.isSliced
                    ? { scale: [1, 1.3, 0], opacity: 0, rotate: 45 }
                    : { scale: [0.8, 1.05, 0.95], opacity: 1 }
                }
                transition={{
                  duration: item.isSliced ? 0.4 : 1.2,
                  repeat: item.isSliced ? 0 : Infinity,
                }}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                onMouseEnter={() => sliceItem(item)}
                onClick={() => sliceItem(item)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none p-2 ${
                  item.isSliced ? 'pointer-events-none' : ''
                }`}
              >
                <div className="group relative flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95">
                  <div className="text-4xl drop-shadow-md sm:text-5xl">
                    {item.emoji}
                  </div>
                  {!item.isBomb && (
                    <div className="absolute -bottom-2 rounded-lg bg-slate-950/90 px-2 py-0.5 font-display text-sm font-black text-amber-300 shadow border border-white/20">
                      {item.num}
                    </div>
                  )}
                  {item.isBomb && (
                    <div className="absolute -bottom-2 rounded-lg bg-red-600/90 px-1.5 py-0.5 text-[10px] font-black text-white">
                      DOKUNMA!
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Floating text effects */}
            {floatingText.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -35 }}
                transition={{ duration: 0.9 }}
                style={{ left: `${f.x}%`, top: `${f.y}%` }}
                className={`pointer-events-none absolute -translate-x-1/2 font-display text-lg font-black ${f.color}`}
              >
                {f.text}
              </motion.div>
            ))}

            {fruits.length === 0 && (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                Meyveler fırlatılıyor...
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-xl">
            <Trophy className="h-10 w-10" />
          </div>
          <h3 className="font-display text-3xl font-black text-white">
            Oyun Bitti!
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Kılıcını harika kullandın, işte ninja skoru:
          </p>

          <div className="mx-auto my-6 grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-white/5 p-4 border border-white/10">
            <div>
              <div className="text-xs text-slate-400">Toplam Puan</div>
              <div className="font-display text-2xl font-black text-amber-400">
                {score}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Süre</div>
              <div className="font-display text-2xl font-black text-rose-400">
                60s
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={startNewGame}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-6 py-3 font-bold text-white transition hover:bg-rose-600"
            >
              <RotateCcw className="h-5 w-5" /> Yeniden Başla
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
