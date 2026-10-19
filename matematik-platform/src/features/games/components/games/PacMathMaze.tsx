'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Flame,
  Gamepad2,
  Heart,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

// ==========================================
// 1. TİPLER VE SABİTLER
// ==========================================

export type MazeDirection = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';

export interface MazeCharacter {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  color: string;
}

export const CHARACTERS: MazeCharacter[] = [
  {
    id: 'classic',
    name: '🟡 Klasik Pac-Man',
    emoji: '🟡',
    desc: 'Hızlı Altın Avcısı',
    color: 'text-amber-500',
  },
  {
    id: 'princess',
    name: '🌸 Prenses Pembe',
    emoji: '🌸',
    desc: 'Kristal Taçlı Labirent Yıldızı',
    color: 'text-pink-500',
  },
  {
    id: 'unicorn',
    name: '🦄 Gökkuşağı Unicorn',
    emoji: '🦄',
    desc: 'Sihirli Yıldız Toplayıcı',
    color: 'text-purple-500',
  },
  {
    id: 'cat',
    name: '🐱 Neon Pati',
    emoji: '🐱',
    desc: 'Gece Görüşlü Hızlı Kaşif',
    color: 'text-cyan-500',
  },
];

export interface GhostState {
  id: string;
  name: string;
  emoji: string;
  pos: [number, number];
  spawn: [number, number];
}

export type GridItemType =
  | 'dot'
  | 'cherry'
  | 'strawberry'
  | 'diamond'
  | 'power'
  | null;

export const DIRECTIONS: MazeDirection[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];

export const DIRECTION_META: Record<
  MazeDirection,
  { arrow: string; label: string; keyHint: string; delta: [number, number] }
> = {
  UP: { arrow: '⬆️', label: 'Yukarı', keyHint: 'W / ↑', delta: [-1, 0] },
  LEFT: { arrow: '⬅️', label: 'Sol', keyHint: 'A / ←', delta: [0, -1] },
  DOWN: { arrow: '⬇️', label: 'Aşağı', keyHint: 'S / ↓', delta: [1, 0] },
  RIGHT: { arrow: '➡️', label: 'Sağ', keyHint: 'D / →', delta: [0, 1] },
};

// 7x7 Labirent Duvarları (8 adet simetrik sütun duvarı)
export const WALL_SET = new Set<string>([
  '1-1',
  '1-3',
  '1-5',
  '3-1',
  '3-5',
  '5-1',
  '5-3',
  '5-5',
]);

export const INITIAL_POWER_PELLETS = ['0-0', '0-6', '6-0', '6-6'];

export const INITIAL_FRUITS: Record<string, GridItemType> = {
  '1-2': 'cherry',
  '1-4': 'strawberry',
  '5-2': 'diamond',
  '5-4': 'cherry',
};

export const INITIAL_GHOSTS: GhostState[] = [
  { id: 'pinky', name: 'Pembe', emoji: '👻', pos: [0, 1], spawn: [0, 1] },
  { id: 'inky', name: 'Mavi', emoji: '👻', pos: [0, 5], spawn: [0, 5] },
  { id: 'clyde', name: 'Turuncu', emoji: '👻', pos: [6, 3], spawn: [6, 3] },
];

export function createInitialGrid(): Record<string, GridItemType> {
  const grid: Record<string, GridItemType> = {};
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const key = `${r}-${c}`;
      if (WALL_SET.has(key)) {
        grid[key] = null;
      } else if (r === 3 && c === 3) {
        grid[key] = null; // Pac-Man başlangıç hücresi
      } else if (INITIAL_POWER_PELLETS.includes(key)) {
        grid[key] = 'power';
      } else if (INITIAL_FRUITS[key]) {
        grid[key] = INITIAL_FRUITS[key];
      } else {
        grid[key] = 'dot';
      }
    }
  }
  return grid;
}

export function generateArrowCombo(length = 3): MazeDirection[] {
  const result: MazeDirection[] = [];
  let prevDir: MazeDirection | null = null;
  for (let i = 0; i < length; i++) {
    const pool = DIRECTIONS.filter((d) => {
      if (!prevDir) return true;
      if (prevDir === 'UP' && d === 'DOWN') return false;
      if (prevDir === 'DOWN' && d === 'UP') return false;
      if (prevDir === 'LEFT' && d === 'RIGHT') return false;
      if (prevDir === 'RIGHT' && d === 'LEFT') return false;
      return true;
    });
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    result.push(chosen);
    prevDir = chosen;
  }
  return result;
}

export function getRandomTreasurePos(
  currentPac: [number, number],
): [number, number] {
  const candidates: [number, number][] = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const key = `${r}-${c}`;
      if (!WALL_SET.has(key) && (r !== currentPac[0] || c !== currentPac[1])) {
        candidates.push([r, c]);
      }
    }
  }
  return candidates[Math.floor(Math.random() * candidates.length)] || [0, 3];
}

// ==========================================
// 2. ANA BİLEŞEN: PAC-MATİK OK LABİRENTİ
// ==========================================

export function PacMathMaze({
  onExit,
  onScore,
  scoreMultiplier = 1,
}: GameComponentProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>(
    'idle',
  );
  const [selectedCharacterId, setSelectedCharacterId] =
    useState<string>('classic');

  // Oyun Durumu
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [dotsEaten, setDotsEaten] = useState(0);
  const [ghostsEaten, setGhostsEaten] = useState(0);
  const [combosCompleted, setCombosCompleted] = useState(0);

  // Labirent Nesneleri & Karakter Pozisyonları
  const [pacPos, setPacPos] = useState<[number, number]>([3, 3]);
  const [gridItems, setGridItems] = useState<Record<string, GridItemType>>(
    () => createInitialGrid(),
  );
  const [ghosts, setGhosts] = useState<GhostState[]>(() => INITIAL_GHOSTS);
  const [scaredTimer, setScaredTimer] = useState(0);
  const [treasurePos, setTreasurePos] = useState<[number, number]>([0, 3]);

  // Süper Ok Görevi
  const [arrowCombo, setArrowCombo] = useState<MazeDirection[]>(() =>
    generateArrowCombo(3),
  );
  const [comboStep, setComboStep] = useState(0);

  // Geri Bildirim
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'correct' | 'wrong';
  } | null>(null);

  const hasSubmittedRef = useRef(false);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeCharacter = useMemo(() => {
    return (
      CHARACTERS.find((c) => c.id === selectedCharacterId) || CHARACTERS[0]
    );
  }, [selectedCharacterId]);

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

  // Güç Modu (Scared Ghosts) Süresi
  useEffect(() => {
    if (gameState !== 'playing' || scaredTimer <= 0) return;

    const timer = setInterval(() => {
      setScaredTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, scaredTimer]);

  // Hayalet Devriyesi (Her 550ms)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const ghostInterval = setInterval(() => {
      setGhosts((prevGhosts) => {
        return prevGhosts.map((ghost) => {
          const [gr, gc] = ghost.pos;
          const candMoves: [number, number][] = [];
          const deltas: [number, number][] = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ];

          for (const [dr, dc] of deltas) {
            const nr = gr + dr;
            let nc = gc + dc;
            // 3. Satır tünel geçişi (wrap-around)
            if (gr === 3) {
              if (nc < 0) nc = 6;
              if (nc > 6) nc = 0;
            }
            if (nr >= 0 && nr <= 6 && nc >= 0 && nc <= 6) {
              if (!WALL_SET.has(`${nr}-${nc}`)) {
                candMoves.push([nr, nc]);
              }
            }
          }

          if (candMoves.length === 0) return ghost;
          const nextPos =
            candMoves[Math.floor(Math.random() * candMoves.length)];
          return { ...ghost, pos: nextPos };
        });
      });
    }, 550);

    return () => clearInterval(ghostInterval);
  }, [gameState]);

  // Hayalet & Pac-Man Çarpışma Denetimi (Devriye Sırasında)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const hitGhostIndex = ghosts.findIndex(
      (g) => g.pos[0] === pacPos[0] && g.pos[1] === pacPos[1],
    );

    if (hitGhostIndex !== -1) {
      if (scaredTimer > 0) {
        // Hayaleti Avlama
        gameAudio.playSlice();
        setScore((s) => s + 200);
        setGhostsEaten((ge) => ge + 1);
        setFeedback({
          message: '👻 Hayaleti Yuttun! (+200 Puan)',
          type: 'correct',
        });
        setGhosts((prev) =>
          prev.map((g, i) =>
            i === hitGhostIndex ? { ...g, pos: g.spawn } : g,
          ),
        );
      } else {
        // Pac-Man Yakalandı
        gameAudio.playWhack();
        gameAudio.playWrong();
        setPacPos([3, 3]);
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) {
            finishGame();
            return 0;
          }
          setFeedback({
            message: `Hayalet seni yakaladı! 💥 (${next} Can Kaldı)`,
            type: 'wrong',
          });
          return next;
        });
      }
    }
  }, [ghosts, pacPos, scaredTimer, gameState, finishGame]);

  // Skor Gönderimi (Maks 4800)
  useEffect(() => {
    if (gameState === 'playing') {
      hasSubmittedRef.current = false;
    }
    if (gameState === 'ended' && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      const safeFinalScore = Math.min(
        4800,
        Math.round(score * (scoreMultiplier || 1)),
      );
      onScore(safeFinalScore);
    }
  }, [gameState, score, scoreMultiplier, onScore]);

  // Temizleme
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const showFeedback = useCallback(
    (message: string, type: 'correct' | 'wrong') => {
      setFeedback({ message, type });
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback(null);
      }, 1500);
    },
    [],
  );

  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setDotsEaten(0);
    setGhostsEaten(0);
    setCombosCompleted(0);
    setPacPos([3, 3]);
    setGridItems(createInitialGrid());
    setGhosts(INITIAL_GHOSTS);
    setScaredTimer(0);
    setTreasurePos([0, 3]);
    setArrowCombo(generateArrowCombo(3));
    setComboStep(0);
    setFeedback(null);
    setGameState('playing');
    gameAudio.playPop();
  }, []);

  // Karakter Hareketi & Etkileşimler
  const handleDirection = useCallback(
    (dir: MazeDirection) => {
      if (gameState !== 'playing') return;

      const meta = DIRECTION_META[dir];
      const [dr, dc] = meta.delta;
      const [pr, pc] = pacPos;

      const nr = pr + dr;
      let nc = pc + dc;

      // 3. Satır tünel geçişi (wrap-around)
      if (pr === 3) {
        if (nc < 0) nc = 6;
        if (nc > 6) nc = 0;
      }

      // Sınır ve Duvar Kontrolü
      if (nr < 0 || nr > 6 || nc < 0 || nc > 6 || WALL_SET.has(`${nr}-${nc}`)) {
        return;
      }

      const nextPos: [number, number] = [nr, nc];
      const tileKey = `${nr}-${nc}`;

      // 1. Hayaletle Çarpışma Kontrolü
      const hitGhostIndex = ghosts.findIndex(
        (g) => g.pos[0] === nr && g.pos[1] === nc,
      );

      if (hitGhostIndex !== -1) {
        if (scaredTimer > 0) {
          gameAudio.playSlice();
          setScore((s) => s + 200);
          setGhostsEaten((ge) => ge + 1);
          showFeedback('👻 Hayaleti Yuttun! (+200 Puan)', 'correct');
          setGhosts((prev) =>
            prev.map((g, i) =>
              i === hitGhostIndex ? { ...g, pos: g.spawn } : g,
            ),
          );
        } else {
          gameAudio.playWhack();
          gameAudio.playWrong();
          setPacPos([3, 3]);
          setLives((l) => {
            const next = l - 1;
            if (next <= 0) {
              finishGame();
              return 0;
            }
            showFeedback(
              `Hayalet seni yakaladı! 💥 (${next} Can Kaldı)`,
              'wrong',
            );
            return next;
          });
          return;
        }
      }

      // Pac-Man pozisyonunu güncelle
      setPacPos(nextPos);

      // 2. Yem & Meyve & Güç Kristali Toplama
      const currentItem = gridItems[tileKey];
      if (currentItem) {
        setGridItems((prev) => ({ ...prev, [tileKey]: null }));

        if (currentItem === 'dot') {
          gameAudio.playPop();
          setScore((s) => s + 20);
          setDotsEaten((d) => d + 1);
        } else if (
          currentItem === 'cherry' ||
          currentItem === 'strawberry' ||
          currentItem === 'diamond'
        ) {
          gameAudio.playCorrect();
          const bonus = currentItem === 'diamond' ? 120 : 100;
          setScore((s) => s + bonus);
          setDotsEaten((d) => d + 1);
          showFeedback(`Nefis Meyve! 🍒 (+${bonus} Puan)`, 'correct');
        } else if (currentItem === 'power') {
          gameAudio.playNitro();
          setScore((s) => s + 150);
          setDotsEaten((d) => d + 1);
          setScaredTimer(6);
          showFeedback('⚡ Güç Kristali! Hayaletleri Avla!', 'correct');
        }
      } else {
        gameAudio.playPop();
      }

      // 3. Altın Hazine Portalı Kontrolü
      if (nr === treasurePos[0] && nc === treasurePos[1]) {
        gameAudio.playLevelUp();
        setScore((s) => s + 150);
        setCombosCompleted((c) => c + 1);
        setScaredTimer(6);
        showFeedback('👑 Altın Hazineyi Buldun! (+150 Puan)', 'correct');
        setTreasurePos(getRandomTreasurePos(nextPos));
      }

      // 4. Süper Ok Kombosu Kontrolü ("Karşımıza Oklar Çıkıyor")
      const currentTargetArrow = arrowCombo[comboStep];
      if (dir === currentTargetArrow) {
        const nextStep = comboStep + 1;
        if (nextStep >= arrowCombo.length) {
          gameAudio.playCombo(3);
          setScore((s) => s + 150);
          setCombosCompleted((c) => c + 1);
          setScaredTimer(6);
          showFeedback(
            '🔥 Süper Ok Kombosu Tamamlandı! (+150 Puan)',
            'correct',
          );
          setArrowCombo(generateArrowCombo(3));
          setComboStep(0);
        } else {
          setComboStep(nextStep);
        }
      } else if (comboStep > 0) {
        // Yanlış yönde adım atılırsa komboyu sıfırla, hareket engellenmez
        setComboStep(0);
      }

      // 5. Tüm Yemler Toplandı mı? (Yenileme Dalgası)
      const remainingItems = Object.entries(gridItems).filter(
        ([key, val]) => key !== tileKey && val !== null,
      );
      if (remainingItems.length === 0) {
        gameAudio.playFanfare();
        setScore((s) => s + 300);
        setGridItems(createInitialGrid());
        showFeedback('🌟 Labirent Temizlendi! Yeni Yem Dalgası!', 'correct');
      }
    },
    [
      gameState,
      pacPos,
      ghosts,
      scaredTimer,
      gridItems,
      treasurePos,
      arrowCombo,
      comboStep,
      showFeedback,
      finishGame,
    ],
  );

  // Klavye Kontrolleri: Ok Tuşları, WASD ve 1,2,3,4
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === '1') {
        e.preventDefault();
        handleDirection('UP');
      } else if (
        key === 'ArrowRight' ||
        key === 'd' ||
        key === 'D' ||
        key === '2'
      ) {
        e.preventDefault();
        handleDirection('RIGHT');
      } else if (
        key === 'ArrowLeft' ||
        key === 'a' ||
        key === 'A' ||
        key === '3'
      ) {
        e.preventDefault();
        handleDirection('LEFT');
      } else if (
        key === 'ArrowDown' ||
        key === 's' ||
        key === 'S' ||
        key === '4'
      ) {
        e.preventDefault();
        handleDirection('DOWN');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleDirection]);

  // Hazineye Yönlendiren Ok İpuçları
  const targetGuideText = useMemo(() => {
    const [pr, pc] = pacPos;
    const [tr, tc] = treasurePos;
    const hints: string[] = [];
    if (tr < pr) hints.push('⬆️ Yukarı');
    else if (tr > pr) hints.push('⬇️ Aşağı');
    if (tc < pc) hints.push('⬅️ Sola');
    else if (tc > pc) hints.push('➡️ Sağa');
    if (hints.length === 0) return 'Tam Üstündesin!';
    return hints.join(' & ');
  }, [pacPos, treasurePos]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xl text-slate-900 dark:text-slate-100 min-h-[620px] flex flex-col justify-between select-none">
      {/* BAŞLIK & BİLGİ ŞERİDİ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-slate-950 dark:text-slate-950 shadow-lg shadow-amber-500/20">
            <Gamepad2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Pac-Matik: Ok Labirenti
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                Arcade Pac-Man & Ok Refleksi
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Labirentte oklarla koş, yemleri topla, komboları tamamla ve
              hayaletleri avla!
            </p>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
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

            {/* Kalan Süre */}
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

            {/* Toplanan Yem & Meyve */}
            <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 font-mono font-bold text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>{dotsEaten} Yem & Meyve</span>
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
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/25 text-5xl sm:text-6xl animate-bounce">
              {activeCharacter.emoji}
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-emerald-500 text-slate-950 dark:text-slate-950 rounded-full text-xs font-black shadow-lg">
              60 SN
            </div>
          </div>

          <div className="max-w-lg space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Labirente Girmeye Hazır mısın?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Neon labirentte ok tuşlarıyla koş, altın yemleri ve kirazları topla!
              Ekrandaki süper ok kombolarını tamamla, güç kristaliyle
              hayaletleri avla ve altın hazineye ulaş!
            </p>
          </div>

          {/* KARAKTER SEÇİMİ (role="radiogroup" / role="radio") */}
          <div className="w-full max-w-xl space-y-2">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Karakterini Seç
            </div>
            <div
              role="radiogroup"
              aria-label="Karakter Seçimi"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
            >
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharacterId === char.id;
                return (
                  <div
                    key={char.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => setSelectedCharacterId(char.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setSelectedCharacterId(char.id);
                      }
                    }}
                    className={`cursor-pointer p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center select-none ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 dark:bg-amber-400/20 shadow-md ring-2 ring-amber-400/40 scale-102'
                        : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span className="text-3xl mb-1">{char.emoji}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {char.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {char.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OYUN BİLGİ KARTLARI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl text-left">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Süre & Can
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                60 Sn / 3 Can
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Kontroller
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Ok Tuşları, WASD, 1-4
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Bonus Yemler
              </div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                🍒 Kiraz & ⚡ Kristal
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Oyun Modu
              </div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                %100 Arcade Refleks
              </div>
            </div>
          </div>

          {/* İLK BUTON (Testlerin bulacağı birincil buton) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-lg transition-all transform active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              Labirente Gir
            </button>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white font-bold transition-all border border-slate-200 dark:border-transparent cursor-pointer"
              >
                Çıkış
              </button>
            )}
          </div>
        </div>
      )}

      {/* OYUN OYNAMA EKRANI (PLAYING) */}
      {gameState === 'playing' && (
        <div className="py-2 space-y-3 sm:space-y-4">
          {/* ⚡ OK HEDEFİ & SÜPER HAZİNE EKRANI ("Karşımıza Oklar Çıkıyor") */}
          <div className="relative p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 border-2 border-indigo-500/50 dark:border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.25)] text-center overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 dark:text-indigo-300 border border-indigo-500/30 font-black">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ SÜPER OK KOMBOSU</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 dark:text-amber-400 font-mono font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                <span>{combosCompleted} Tamamlandı (+150 P)</span>
              </div>
            </div>

            {/* 3'LÜ OK DİZİLİMİ */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-1 flex-wrap">
              {arrowCombo.map((dir, idx) => {
                const isPast = idx < comboStep;
                const isCurrent = idx === comboStep;
                const meta = DIRECTION_META[dir];
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1.5 rounded-xl border-2 transition-all flex items-center gap-1.5 ${
                        isPast
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 dark:text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                          : isCurrent
                          ? 'bg-amber-500/25 border-amber-400 text-amber-300 dark:text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.7)] animate-pulse scale-105'
                          : 'bg-slate-800/60 dark:bg-slate-900/60 border-slate-700 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60'
                      }`}
                    >
                      <span className="text-lg sm:text-xl">{meta.arrow}</span>
                      <span className="text-xs font-black tracking-wider">
                        {meta.label}
                      </span>
                      {isPast && <span className="text-xs font-black">✓</span>}
                    </div>
                    {idx < arrowCombo.length - 1 && (
                      <span className="text-slate-500 dark:text-slate-500 font-bold">
                        ➔
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* HAZİNE RADARI & YÖN İPUCU */}
            <div className="mt-2 pt-2 border-t border-slate-800 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 dark:text-amber-300 font-bold">
                <span className="text-sm">👑</span>
                <span>Hazine Hedefi:</span>
                <span className="text-slate-300 dark:text-slate-300 font-mono">
                  {targetGuideText}
                </span>
              </div>
              {scaredTimer > 0 && (
                <div className="flex items-center gap-1 text-xs font-black text-cyan-300 dark:text-cyan-300 animate-pulse">
                  <Zap className="w-3.5 h-3.5" />
                  <span>GÜÇ MODU:</span>
                  <span className="font-mono">
                    {scaredTimer}s (Hayaletleri Yut!)
                  </span>
                </div>
              )}
            </div>

            {/* GERİ BİLDİRİM BİLGİSİ */}
            <div className="min-h-[20px] mt-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.message}
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    className={`text-xs sm:text-sm font-black ${
                      feedback.type === 'correct'
                        ? 'text-emerald-400 dark:text-emerald-400'
                        : 'text-rose-400 dark:text-rose-400'
                    }`}
                  >
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 7x7 NEON ARCADE PAC-MAN LABİRENT IZGARASI */}
          <div className="w-full max-w-[340px] sm:max-w-[390px] aspect-square mx-auto p-2 sm:p-2.5 rounded-3xl bg-slate-950 dark:bg-slate-950 border-4 border-blue-600/70 dark:border-blue-500/70 shadow-[0_0_30px_rgba(37,99,235,0.3)] grid grid-cols-7 grid-rows-7 gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map((r) =>
              [0, 1, 2, 3, 4, 5, 6].map((c) => {
                const cellKey = `${r}-${c}`;
                const isWall = WALL_SET.has(cellKey);
                const isPacman = pacPos[0] === r && pacPos[1] === c;
                const activeGhost = ghosts.find(
                  (g) => g.pos[0] === r && g.pos[1] === c,
                );
                const isTreasure =
                  treasurePos[0] === r && treasurePos[1] === c;
                const item = gridItems[cellKey];

                return (
                  <div
                    key={cellKey}
                    className={`relative rounded-xl flex items-center justify-center transition-all ${
                      isWall
                        ? 'bg-blue-950/60 dark:bg-slate-900 border-2 border-blue-500/40 dark:border-blue-600/40 shadow-inner'
                        : isTreasure
                        ? 'bg-amber-500/20 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                        : 'bg-slate-900/60 dark:bg-slate-950/80 border border-blue-500/20 dark:border-blue-500/20'
                    }`}
                  >
                    {/* Pac-Man Karakteri */}
                    {isPacman && (
                      <motion.div
                        className="text-2xl sm:text-3xl z-20 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.35, repeat: Infinity }}
                      >
                        {activeCharacter.emoji}
                      </motion.div>
                    )}

                    {/* Hayalet */}
                    {!isPacman && activeGhost && (
                      <motion.div
                        className="text-xl sm:text-2xl z-10"
                        animate={
                          scaredTimer > 0
                            ? { x: [-2, 2, -2], rotate: [0, 8, -8, 0] }
                            : { y: [-2, 2, -2] }
                        }
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        {scaredTimer > 0 ? '😱' : activeGhost.emoji}
                      </motion.div>
                    )}

                    {/* Altın Hazine Portalı */}
                    {!isPacman && !activeGhost && isTreasure && (
                      <motion.div
                        className="text-xl sm:text-2xl drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
                        animate={{
                          scale: [0.9, 1.2, 0.9],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        👑
                      </motion.div>
                    )}

                    {/* Yemler, Meyveler ve Güç Kristali */}
                    {!isPacman && !activeGhost && !isTreasure && item && (
                      <>
                        {item === 'power' && (
                          <motion.div
                            className="text-base sm:text-lg drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                            animate={{ scale: [0.85, 1.3, 0.85] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          >
                            ⚡
                          </motion.div>
                        )}
                        {item === 'cherry' && (
                          <span className="text-sm sm:text-base">🍒</span>
                        )}
                        {item === 'strawberry' && (
                          <span className="text-sm sm:text-base">🍓</span>
                        )}
                        {item === 'diamond' && (
                          <span className="text-sm sm:text-base">💎</span>
                        )}
                        {item === 'dot' && (
                          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                        )}
                      </>
                    )}

                    {/* Boş Açık Koridor Merkez İzi */}
                    {!isPacman &&
                      !activeGhost &&
                      !isTreasure &&
                      !item &&
                      !isWall && (
                        <div className="w-1 h-1 rounded-full bg-blue-500/20" />
                      )}
                  </div>
                );
              }),
            )}
          </div>

          {/* 4 BÜYÜK NEON YÖN OKU BUTONU (Testlerin aradığı ve dokunmatik oyuncular için) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-xl mx-auto w-full">
            <button
              type="button"
              onClick={() => handleDirection('UP')}
              className="group p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-400/15 hover:border-amber-400 active:scale-95 transition-all flex flex-col items-center justify-center shadow-md cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl">⬆️</span>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                Yukarı
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                [W / ↑]
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleDirection('LEFT')}
              className="group p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-400/15 hover:border-amber-400 active:scale-95 transition-all flex flex-col items-center justify-center shadow-md cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl">⬅️</span>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                Sol
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                [A / ←]
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleDirection('DOWN')}
              className="group p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-400/15 hover:border-amber-400 active:scale-95 transition-all flex flex-col items-center justify-center shadow-md cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl">⬇️</span>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                Aşağı
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                [S / ↓]
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleDirection('RIGHT')}
              className="group p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-400/15 hover:border-amber-400 active:scale-95 transition-all flex flex-col items-center justify-center shadow-md cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl">➡️</span>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                Sağ
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                [D / →]
              </span>
            </button>
          </div>
        </div>
      )}

      {/* OYUN BİTİŞ EKRANI (ENDED) */}
      {gameState === 'ended' && (
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6">
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center mb-3 shadow-lg text-slate-950 dark:text-slate-950">
              <Award className="w-10 h-10" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {dotsEaten >= 25
                ? '👑 Labirentin Büyük Efendisi!'
                : dotsEaten >= 10
                ? '🍒 Hızlı Pac-Matik Ustası!'
                : '🎮 Labirent Macerası Tamamlandı!'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md">
              Toplam {dotsEaten} yem ve meyve topladın, {ghostsEaten} hayalet
              avladın ve {combosCompleted} süper ok kombosu tamamladın!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Toplam Puan
              </div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {Math.min(4800, Math.round(score * (scoreMultiplier || 1)))}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Toplanan Yem
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {dotsEaten}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Avlanan Hayalet
              </div>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400">
                {ghostsEaten}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Ok Kombosu
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {combosCompleted}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black active:scale-95 transition-all bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              Yeniden Oyna
            </button>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white font-bold transition-all border border-slate-200 dark:border-transparent cursor-pointer"
              >
                Çıkış
              </button>
            )}
          </div>
        </div>
      )}

      {/* ALT BİLGİ */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <span>
          Klavye: [↑, →, ←, ↓] veya [W, D, A, S] tuşlarıyla Pac-Man&apos;i
          yönlendirebilirsin.
        </span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}

export default PacMathMaze;
