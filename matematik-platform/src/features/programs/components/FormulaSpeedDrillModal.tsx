'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  X,
  Zap,
  Timer,
  Trophy,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import MathText from '@/components/MathText';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { gameAudio } from '@/features/games/utils/gameAudio';
import { FLASHCARDS_DATA, type Flashcard } from './FormulaFlashcardsModal';

export const FORMULA_DRILL_BEST_SCORE_KEY = 'ugurhoca_formula_drill_best_v1';

export function getFormulaDrillBestScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(FORMULA_DRILL_BEST_SCORE_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveFormulaDrillBestScore(score: number): number {
  if (typeof window === 'undefined') return score;
  try {
    const prev = getFormulaDrillBestScore();
    const best = Math.max(prev, score);
    localStorage.setItem(FORMULA_DRILL_BEST_SCORE_KEY, String(best));
    return best;
  } catch {
    return score;
  }
}

type DrillCategory = 'all' | 'lgs' | 'yks';
type GameState = 'idle' | 'playing' | 'finished';

type MatchingItem = {
  id: string; // flashcard id
  type: 'title' | 'formula';
  text: string;
  flashcard: Flashcard;
};

export type FormulaSpeedDrillModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenFlashcards?: () => void;
};

const PAIRS_PER_ROUND = 4;
const INITIAL_TIME_SECONDS = 60;

// Shuffles an array deterministically / randomly
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function FormulaSpeedDrillModal({
  isOpen,
  onClose,
  onOpenFlashcards,
}: FormulaSpeedDrillModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  const [category, setCategory] = useState<DrillCategory>('all');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [bonusNotification, setBonusNotification] = useState<string | null>(null);

  // Active round items
  const [leftCards, setLeftCards] = useState<MatchingItem[]>([]);
  const [rightCards, setRightCards] = useState<MatchingItem[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [mismatchedPair, setMismatchedPair] = useState<{ left: string; right: string } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBestScore(getFormulaDrillBestScore());
      setIsMuted(gameAudio.isMuted());
    }
  }, [isOpen]);

  const pool = useMemo(() => {
    if (category === 'all') return FLASHCARDS_DATA;
    return FLASHCARDS_DATA.filter((f) => f.category === category);
  }, [category]);

  const toggleMute = () => {
    const next = gameAudio.toggleMuted();
    setIsMuted(next);
  };

  // Spawn next batch of 4 pairs
  const spawnBatch = useCallback((customPool?: Flashcard[], excludeIds: Set<string> = new Set()) => {
    const activePool = customPool || pool;
    // Prefer cards not yet matched in this session if possible
    let available = activePool.filter((f) => !excludeIds.has(f.id));
    if (available.length < PAIRS_PER_ROUND) {
      available = activePool;
    }

    const selectedCards = shuffleArray(available).slice(0, PAIRS_PER_ROUND);

    const left: MatchingItem[] = selectedCards.map((c) => ({
      id: c.id,
      type: 'title',
      text: c.title,
      flashcard: c,
    }));

    const right: MatchingItem[] = shuffleArray(selectedCards).map((c) => ({
      id: c.id,
      type: 'formula',
      text: c.formula,
      flashcard: c,
    }));

    setLeftCards(left);
    setRightCards(right);
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setMatchedIds(new Set());
    setMismatchedPair(null);
  }, [pool]);

  // Start new game
  const startGame = useCallback(() => {
    setTimeLeft(INITIAL_TIME_SECONDS);
    setScore(0);
    setCombo(1);
    setMaxCombo(1);
    setCorrectMatches(0);
    setTotalAttempts(0);
    setBonusNotification(null);
    setGameState('playing');
    spawnBatch();
  }, [spawnBatch]);

  // Timer tick
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState('finished');
          gameAudio.playFanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // End game score updater
  useEffect(() => {
    if (gameState === 'finished') {
      const updatedBest = saveFormulaDrillBestScore(score);
      setBestScore(updatedBest);
    }
  }, [gameState, score]);

  // Handle matching check
  const checkMatch = useCallback(
    (leftId: string, rightId: string) => {
      setTotalAttempts((prev) => prev + 1);

      if (leftId === rightId) {
        // MATCH!
        gameAudio.playCorrect();
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        setMaxCombo((prev) => Math.max(prev, nextCombo));

        const multiplier = Math.min(3, 1 + (combo - 1) * 0.25);
        const earnedPoints = Math.round(100 * multiplier);
        setScore((prev) => prev + earnedPoints);
        setCorrectMatches((prev) => prev + 1);

        const newMatched = new Set(matchedIds);
        newMatched.add(leftId);
        setMatchedIds(newMatched);
        setSelectedLeftId(null);
        setSelectedRightId(null);
        setMismatchedPair(null);

        // Check if round cleared
        if (newMatched.size === PAIRS_PER_ROUND) {
          // Bonus +5 seconds!
          setTimeLeft((t) => t + 5);
          setBonusNotification('+5 sn Bonus! ⚡');
          setTimeout(() => setBonusNotification(null), 1500);

          setTimeout(() => {
            spawnBatch();
          }, 350);
        }
      } else {
        // MISMATCH!
        gameAudio.playWrong();
        setCombo(1);
        setMismatchedPair({ left: leftId, right: rightId });
        setTimeout(() => {
          setSelectedLeftId(null);
          setSelectedRightId(null);
          setMismatchedPair(null);
        }, 550);
      }
    },
    [combo, matchedIds, spawnBatch]
  );

  const handleLeftClick = (id: string) => {
    if (gameState !== 'playing' || matchedIds.has(id)) return;
    if (mismatchedPair) return;

    if (selectedRightId) {
      // Both chosen, check match
      setSelectedLeftId(id);
      checkMatch(id, selectedRightId);
    } else {
      setSelectedLeftId((prev) => (prev === id ? null : id));
    }
  };

  const handleRightClick = (id: string) => {
    if (gameState !== 'playing' || matchedIds.has(id)) return;
    if (mismatchedPair) return;

    if (selectedLeftId) {
      // Both chosen, check match
      setSelectedRightId(id);
      checkMatch(selectedLeftId, id);
    } else {
      setSelectedRightId((prev) => (prev === id ? null : id));
    }
  };

  const accuracy = totalAttempts > 0 ? Math.round((correctMatches / totalAttempts) * 100) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="60 Saniye Formül Eşleştirme Antrenmanı"
        tabIndex={-1}
        className="relative z-10 flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 text-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <ErrorBoundary
          fallback={({ reset }) => (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-300 gap-4">
              <p className="text-sm">Formül antrenmanı yüklenirken bir sorun oluştu.</p>
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-xs"
              >
                Yeniden Dene
              </button>
            </div>
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>60 Saniye Hızlı Formül Antrenmanı</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Aktif Hatırlama
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Formül adını matematiksel ifadesiyle doğru eşleştir, süreni en verimli kullan!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white transition"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Antrenmanı kapat"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sub-header Bar: Stats & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/40 px-4 py-2.5 sm:px-6">
            {/* Category Filter */}
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (gameState === 'playing') return;
                  setCategory('all');
                }}
                disabled={gameState === 'playing'}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  category === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white disabled:opacity-50'
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => {
                  if (gameState === 'playing') return;
                  setCategory('lgs');
                }}
                disabled={gameState === 'playing'}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  category === 'lgs'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white disabled:opacity-50'
                }`}
              >
                LGS (8. Sınıf)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (gameState === 'playing') return;
                  setCategory('yks');
                }}
                disabled={gameState === 'playing'}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  category === 'yks'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white disabled:opacity-50'
                }`}
              >
                YKS (TYT & AYT)
              </button>
            </div>

            {/* In-game HUD */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              {/* Timer */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-bold border transition ${
                  timeLeft <= 10 && gameState === 'playing'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                    : 'bg-white/5 border-white/10 text-slate-200'
                }`}
              >
                <Timer className="h-4 w-4 text-amber-400" />
                <span>{timeLeft}s</span>
                {bonusNotification && (
                  <span className="text-[11px] font-bold text-emerald-400 ml-1">
                    {bonusNotification}
                  </span>
                )}
              </div>

              {/* Score */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-semibold">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>Skor: <strong className="text-amber-300">{score}</strong></span>
              </div>

              {/* Combo Multiplier */}
              {combo > 1 && gameState === 'playing' && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 font-bold text-xs animate-bounce">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span>x{Math.min(3, 1 + (combo - 1) * 0.25).toFixed(1)} Combo!</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {gameState === 'idle' && (
              <div className="flex flex-col items-center justify-center py-8 text-center max-w-md mx-auto">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-5 text-amber-400 shadow-lg">
                  <Zap className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Formül Hız Eşleştirmesi</h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                  60 saniyede ekrana gelen formül ve kural başlıklarını KaTeX matematiksel gösterimleriyle eşleştir. Ardışık doğru eşleştirmelerle <strong>Combo çarpanını</strong> yükselt, her temizlenen set için <strong>+5 saniye bonus</strong> kazan!
                </p>

                {bestScore > 0 && (
                  <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-xs text-amber-300 font-semibold">
                    <Trophy className="h-4 w-4" />
                    <span>Mevcut En Yüksek Skorun: <strong>{bestScore} Puan</strong></span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={startGame}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>Antrenmanı Başlat (60s)</span>
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                {/* Sol Kolon: Formül Başlıkları */}
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    1. Adım: Formül / Kural Adı
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {leftCards.map((card) => {
                      const isMatched = matchedIds.has(card.id);
                      const isSelected = selectedLeftId === card.id;
                      const isMismatch = mismatchedPair?.left === card.id;

                      return (
                        <button
                          key={`left-${card.id}`}
                          type="button"
                          disabled={isMatched}
                          onClick={() => handleLeftClick(card.id)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all relative ${
                            isMatched
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 opacity-60 pointer-events-none'
                              : isMismatch
                              ? 'border-rose-500 bg-rose-500/20 text-rose-200 ring-2 ring-rose-500'
                              : isSelected
                              ? 'border-amber-400 bg-amber-500/20 text-white ring-2 ring-amber-400 shadow-md scale-[1.01]'
                              : 'border-white/10 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:border-white/20'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wide">
                              {card.flashcard.subject}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold">
                              {card.text}
                            </span>
                          </div>
                          {isMatched && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sağ Kolon: KaTeX Formülleri */}
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    2. Adım: KaTeX Matematiksel İfadesi
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {rightCards.map((card) => {
                      const isMatched = matchedIds.has(card.id);
                      const isSelected = selectedRightId === card.id;
                      const isMismatch = mismatchedPair?.right === card.id;

                      return (
                        <button
                          key={`right-${card.id}`}
                          type="button"
                          disabled={isMatched}
                          onClick={() => handleRightClick(card.id)}
                          className={`flex items-center justify-center p-3.5 rounded-2xl border text-center transition-all min-h-[64px] ${
                            isMatched
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 opacity-60 pointer-events-none'
                              : isMismatch
                              ? 'border-rose-500 bg-rose-500/20 text-rose-200 ring-2 ring-rose-500'
                              : isSelected
                              ? 'border-cyan-400 bg-cyan-500/20 text-white ring-2 ring-cyan-400 shadow-md scale-[1.01]'
                              : 'border-white/10 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:border-white/20'
                          }`}
                        >
                          <div className="text-xs sm:text-sm pointer-events-none">
                            <MathText>{card.text}</MathText>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="flex flex-col items-center justify-center py-6 text-center max-w-md mx-auto">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-xl">
                  <Sparkles className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">Antrenman Tamamlandı!</h3>
                <p className="text-xs text-slate-300 mb-6">
                  60 saniyelik odaklanma ve aktif hatırlama seansını tamamladın.
                </p>

                {/* Score Summary Grid */}
                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                    <span className="text-[11px] text-slate-400 font-medium">Toplam Skor</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 font-mono">
                      {score}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                    <span className="text-[11px] text-slate-400 font-medium">Doğru Eşleşme</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 font-mono">
                      {correctMatches}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                    <span className="text-[11px] text-slate-400 font-medium">İsabet Oranı</span>
                    <span className="text-lg sm:text-xl font-bold text-cyan-400 mt-0.5 font-mono">
                      %{accuracy}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                    <span className="text-[11px] text-slate-400 font-medium">Maks Combo</span>
                    <span className="text-lg sm:text-xl font-bold text-orange-400 mt-0.5 font-mono">
                      {maxCombo}x
                    </span>
                  </div>
                </div>

                {score >= bestScore && score > 0 && (
                  <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-300 font-bold">
                    <Trophy className="h-4 w-4 text-emerald-400" />
                    <span>🎉 Tebrikler! Yeni En Yüksek Skorun: {score} Puan!</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={startGame}
                    className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Tekrar Oyna</span>
                  </button>

                  {onOpenFlashcards && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenFlashcards();
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                    >
                      <span>Kartları İncele 📖</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
