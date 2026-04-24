'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import { Bot, Hand, Play, RotateCcw, Trophy, Users } from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import {
  MATMATIK_FACTORS,
  MATMATIK_GRID_NUMBERS,
  applyMatMatikMove,
  createMatMatikBoard,
  findWinner,
  getProductIndex,
  isBoardFull,
  type MatMatikBoard,
  type MatMatikDifficulty,
  type MatMatikMove,
  type MatMatikPlayer,
} from './matmatik-engine';

type GameMode = 'single' | 'two';
type GamePhase = 'setup' | 'playing' | 'ended';
type SelectorHandle = 'top' | 'bottom';
type SelectorMove = MatMatikMove & {
  factor: number;
  selector: SelectorHandle;
};

const difficultyLabels: Record<MatMatikDifficulty, string> = {
  easy: 'Kolay',
  hard: 'Zor',
  medium: 'Orta',
};

const playerStyles: Record<MatMatikPlayer, string> = {
  1: 'border-emerald-400 bg-emerald-500 text-white shadow-emerald-500/30',
  2: 'border-rose-400 bg-rose-500 text-white shadow-rose-500/30',
};

export function MatMatik({ onExit }: GameComponentProps) {
  const numberLineRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [mode, setMode] = useState<GameMode>('single');
  const [difficulty, setDifficulty] = useState<MatMatikDifficulty>('medium');
  const [player1Input, setPlayer1Input] = useState('');
  const [player2Input, setPlayer2Input] = useState('');
  const [playerNames, setPlayerNames] = useState<Record<MatMatikPlayer, string>>(
    {
      1: 'Oyuncu 1',
      2: 'Bilgisayar',
    },
  );
  const [board, setBoard] = useState<MatMatikBoard>(() => createMatMatikBoard());
  const [currentPlayer, setCurrentPlayer] = useState<MatMatikPlayer>(1);
  const [selectedFactors, setSelectedFactors] = useState<
    Record<SelectorHandle, number>
  >({
    bottom: 5,
    top: 5,
  });
  const [activeSelector, setActiveSelector] = useState<SelectorHandle>('top');
  const [draggingSelector, setDraggingSelector] =
    useState<SelectorHandle | null>(null);
  const [message, setMessage] = useState('Oklardan birini sayıya taşı.');
  const [winner, setWinner] = useState<MatMatikPlayer | 'draw' | null>(null);
  const [computerThinking, setComputerThinking] = useState(false);

  const selectedProduct = selectedFactors.top * selectedFactors.bottom;
  const selectedProductIndex = getProductIndex(selectedProduct);
  const isComputerTurn =
    phase === 'playing' && mode === 'single' && currentPlayer === 2;

  const occupiedCount = useMemo(
    () => board.filter((owner) => owner !== null).length,
    [board],
  );

  useEffect(() => {
    if (!isComputerTurn || winner) {
      return;
    }

    setComputerThinking(true);
    const timer = window.setTimeout(() => {
      const move = chooseConstrainedComputerMove(
        board,
        difficulty,
        selectedFactors,
      );
      if (!move) {
        finishGame(board, 'draw');
        setComputerThinking(false);
        return;
      }

      const nextBoard = applyMatMatikMove(board, move.product, 2);
      if (!nextBoard) {
        setComputerThinking(false);
        return;
      }

      setSelectedFactors((currentFactors) => ({
        ...currentFactors,
        [move.selector]: move.factor,
      }));
      completeMove(nextBoard, 2, `${move.a} × ${move.b} = ${move.product}`);
      setComputerThinking(false);
    }, 650);

    return () => window.clearTimeout(timer);
    // completeMove and finishGame intentionally derive from current render state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, difficulty, isComputerTurn, selectedFactors, winner]);

  useEffect(() => {
    if (!draggingSelector) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      updateSelectorFromClientX(draggingSelector, event.clientX);
    };
    const stopDragging = (event: PointerEvent) => {
      const factor = getFactorFromClientX(event.clientX);
      const nextFactors = { ...selectedFactors, [draggingSelector]: factor };
      setSelectedFactors(nextFactors);
      setDraggingSelector(null);
      playMove(nextFactors);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging, { once: true });
    window.addEventListener('pointercancel', stopDragging, { once: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
    // playMove intentionally uses the board/current player from drag start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingSelector, selectedFactors]);

  const startGame = () => {
    setBoard(createMatMatikBoard());
    setCurrentPlayer(1);
    setSelectedFactors({ bottom: 5, top: 5 });
    setActiveSelector('top');
    setWinner(null);
    setPhase('playing');
    setMessage('Oyuncu 1 başlar. Oklardan birini sayıya taşı.');
    setPlayerNames({
      1: player1Input.trim() || 'Oyuncu 1',
      2:
        mode === 'single'
          ? 'Bilgisayar'
          : player2Input.trim() || 'Oyuncu 2',
    });
  };

  const resetToSetup = () => {
    setPhase('setup');
    setBoard(createMatMatikBoard());
    setSelectedFactors({ bottom: 5, top: 5 });
    setActiveSelector('top');
    setWinner(null);
    setCurrentPlayer(1);
    setMessage('Oklardan birini sayıya taşı.');
    setComputerThinking(false);
  };

  const restartSameGame = () => {
    setBoard(createMatMatikBoard());
    setSelectedFactors({ bottom: 5, top: 5 });
    setActiveSelector('top');
    setWinner(null);
    setCurrentPlayer(1);
    setPhase('playing');
    setMessage(`${playerNames[1]} başlar. Oklardan birini sayıya taşı.`);
    setComputerThinking(false);
  };

  const moveSelector = (selector: SelectorHandle, factor: number) => {
    if (phase !== 'playing' || isComputerTurn || winner) {
      return;
    }

    const nextFactors = { ...selectedFactors, [selector]: factor };
    setSelectedFactors(nextFactors);
    setActiveSelector(selector);
    playMove(nextFactors);
  };

  const activateSelector = (selector: SelectorHandle) => {
    if (phase !== 'playing' || isComputerTurn || winner) {
      return;
    }

    setActiveSelector(selector);
  };

  const nudgeSelector = (selector: SelectorHandle, direction: -1 | 1) => {
    const currentValue = selectedFactors[selector];
    const nextValue = Math.min(9, Math.max(1, currentValue + direction));
    moveSelector(selector, nextValue);
  };

  const startDraggingSelector = (
    selector: SelectorHandle,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (phase !== 'playing' || isComputerTurn || winner) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingSelector(selector);
    setActiveSelector(selector);
    updateSelectorFromClientX(selector, event.clientX);
  };

  const updateSelectorFromClientX = (
    selector: SelectorHandle,
    clientX: number,
  ) => {
    const factor = getFactorFromClientX(clientX);

    setSelectedFactors((currentFactors) => ({
      ...currentFactors,
      [selector]: factor,
    }));
  };

  const getFactorFromClientX = (clientX: number) => {
    const line = numberLineRef.current;
    if (!line) {
      return 5;
    }

    const rect = line.getBoundingClientRect();
    const relativeX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const index = Math.round((relativeX / rect.width) * 8);
    return Math.min(9, Math.max(1, index + 1));
  };

  const playMove = (factors: Record<SelectorHandle, number>) => {
    const product = factors.top * factors.bottom;
    const nextBoard = applyMatMatikMove(board, product, currentPlayer);

    if (!nextBoard) {
      setMessage(
        `${factors.top} × ${factors.bottom} = ${product} dolu. Aynı oyuncu farklı bir ok konumu denesin.`,
      );
      return;
    }

    completeMove(
      nextBoard,
      currentPlayer,
      `${factors.top} × ${factors.bottom} = ${product}`,
    );
  };

  const completeMove = (
    nextBoard: MatMatikBoard,
    player: MatMatikPlayer,
    moveLabel: string,
  ) => {
    const nextWinner = findWinner(nextBoard);
    setBoard(nextBoard);

    if (nextWinner) {
      finishGame(nextBoard, nextWinner);
      setMessage(`${moveLabel}. ${playerNames[nextWinner]} kazandı.`);
      return;
    }

    if (isBoardFull(nextBoard)) {
      finishGame(nextBoard, 'draw');
      setMessage(`${moveLabel}. Oyun berabere bitti.`);
      return;
    }

    const nextPlayer: MatMatikPlayer = player === 1 ? 2 : 1;
    setCurrentPlayer(nextPlayer);
    setMessage(`${moveLabel}. Sıra ${playerNames[nextPlayer]}.`);
  };

  const finishGame = (
    nextBoard: MatMatikBoard,
    result: MatMatikPlayer | 'draw',
  ) => {
    setBoard(nextBoard);
    setWinner(result);
    setPhase('ended');
  };

  if (phase === 'setup') {
    return (
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto max-w-3xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-2xl shadow-emerald-500/30">
            <span className="text-5xl font-black text-white">×</span>
          </div>
          <h2 className="mb-3 text-4xl font-bold text-white">MatMatik</h2>
          <p className="mx-auto max-w-xl text-slate-400">
            İki sayı seç, çarpımı tabloda işaretle. Kendi renginle yatay,
            dikey veya çapraz dört hücreyi ilk tamamlayan kazanır.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md sm:p-6">
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <ModeButton
              active={mode === 'single'}
              icon={<Bot className="h-5 w-5" />}
              label="Tek Kişilik"
              onClick={() => setMode('single')}
            />
            <ModeButton
              active={mode === 'two'}
              icon={<Users className="h-5 w-5" />}
              label="İki Kişilik"
              onClick={() => setMode('two')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Oyuncu 1
              </span>
              <input
                value={player1Input}
                onChange={(event) => setPlayer1Input(event.target.value)}
                placeholder="Oyuncu 1"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              />
            </label>
            {mode === 'two' && (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-300">
                  Oyuncu 2
                </span>
                <input
                  value={player2Input}
                  onChange={(event) => setPlayer2Input(event.target.value)}
                  placeholder="Oyuncu 2"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-rose-400"
                />
              </label>
            )}
          </div>

          {mode === 'single' && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-slate-300">
                Bilgisayar zorluğu
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`rounded-2xl border px-4 py-3 font-bold transition ${
                      difficulty === level
                        ? 'border-cyan-300 bg-cyan-400 text-slate-950'
                        : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-cyan-300/60'
                    }`}
                  >
                    {difficultyLabels[level]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startGame}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-xl font-bold text-white shadow-lg shadow-cyan-500/20"
          >
            <Play className="h-6 w-6" />
            Oyuna Başla
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <PlayerBadge
          active={currentPlayer === 1 && phase === 'playing'}
          name={playerNames[1]}
          player={1}
          thinking={false}
        />
        <div className="flex min-h-20 flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Durum
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-200">
            {computerThinking ? 'Bilgisayar düşünüyor...' : message}
          </p>
        </div>
        <PlayerBadge
          active={currentPlayer === 2 && phase === 'playing'}
          name={playerNames[2]}
          player={2}
          thinking={computerThinking}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-md sm:p-5">
          <div className="grid grid-cols-6 gap-2" role="grid">
            {MATMATIK_GRID_NUMBERS.map((number, index) => {
              const owner = board[index];
              const highlighted = selectedProductIndex === index;

              return (
                <div
                  key={number}
                  role="gridcell"
                  aria-label={`${number}${owner ? ` ${playerNames[owner]} tarafından işaretlendi` : ''}`}
                  className={`flex aspect-square min-h-0 items-center justify-center rounded-2xl border text-base font-black shadow-lg transition sm:text-xl ${
                    owner
                      ? playerStyles[owner]
                      : highlighted
                        ? 'border-cyan-300 bg-cyan-300/20 text-cyan-100'
                        : 'border-white/10 bg-slate-950/70 text-slate-200'
                  }`}
                >
                  {number}
                </div>
              );
            })}
          </div>
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-300">
                Sayı seçimi
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Sürükle ve bırak
              </p>
            </div>
            <div
              className="rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-3 shadow-inner"
              aria-label="MatMatik sayı hattı"
            >
              <div
                ref={numberLineRef}
                className="relative mx-auto grid max-w-[620px] grid-cols-9 gap-1 pb-11 pt-11 sm:gap-2"
              >
                <SelectorArrow
                  active={activeSelector === 'top'}
                  disabled={isComputerTurn || phase !== 'playing'}
                  label="Üst ok"
                  position={selectedFactors.top}
                  selector="top"
                  onActivate={activateSelector}
                  onKeyMove={nudgeSelector}
                  onPointerDown={startDraggingSelector}
                />
                {MATMATIK_FACTORS.map((factor) => (
                  <button
                    key={factor}
                    type="button"
                    disabled={isComputerTurn || phase !== 'playing'}
                    onClick={() => moveSelector(activeSelector, factor)}
                    className="aspect-square rounded-xl border border-cyan-300/25 bg-cyan-500/15 text-lg font-black text-cyan-50 shadow-md transition hover:border-cyan-200 hover:bg-cyan-400/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-70 sm:text-2xl"
                    aria-label={`${factor} sayısını ${activeSelector === 'top' ? 'üst' : 'alt'} oka seç`}
                  >
                    {factor}
                  </button>
                ))}
                <SelectorArrow
                  active={activeSelector === 'bottom'}
                  disabled={isComputerTurn || phase !== 'playing'}
                  label="Alt ok"
                  position={selectedFactors.bottom}
                  selector="bottom"
                  onActivate={activateSelector}
                  onKeyMove={nudgeSelector}
                  onPointerDown={startDraggingSelector}
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Bir oku bıraktığında iki okun üzerindeki sayılar çarpılır ve sıra
              değişir.
            </p>
          </div>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl">
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Çarpım
            </p>
            <p className="mt-2 min-h-10 text-3xl font-black text-white">
              {selectedFactors.top} × {selectedFactors.bottom} ={' '}
              {selectedProduct}
            </p>
          </div>

          <button
            type="button"
            onClick={resetToSetup}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-slate-200 transition hover:border-white/30"
          >
            Ayarlara Dön
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Dolu hücreye denk gelen seçimlerde sıra değişmez.
          </p>
          <p className="mt-2 text-center text-xs font-semibold text-slate-600">
            İşaretli hücre: {occupiedCount} / {MATMATIK_GRID_NUMBERS.length}
          </p>
        </aside>
      </div>

      {phase === 'ended' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-500">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h3 className="mb-2 text-3xl font-black text-white">
              {winner === 'draw' ? 'Berabere' : `${playerNames[winner ?? 1]} Kazandı`}
            </h3>
            <p className="mb-6 text-slate-400">
              {winner === 'draw'
                ? 'Tüm hamleler tamamlandı, kazanan çıkmadı.'
                : 'Dört hücrelik diziyi tamamladı.'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={restartSameGame}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-bold text-white"
              >
                <RotateCcw className="h-5 w-5" />
                Yeniden Oyna
              </button>
              <button
                type="button"
                onClick={onExit ?? resetToSetup}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-slate-200"
              >
                Oyunlara Dön
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function chooseConstrainedComputerMove(
  board: MatMatikBoard,
  difficulty: MatMatikDifficulty,
  factors: Record<SelectorHandle, number>,
): SelectorMove | null {
  const candidates = getConstrainedMoves(board, factors);
  if (candidates.length === 0) {
    return null;
  }

  if (difficulty === 'easy') {
    return pickRandomCandidate(candidates);
  }

  const winningMove = findImmediateCandidate(board, candidates, 2);
  if (winningMove) {
    return winningMove;
  }

  const blockingMove = findImmediateCandidate(board, candidates, 1);
  if (blockingMove) {
    return blockingMove;
  }

  if (difficulty === 'medium') {
    return pickRandomCandidate(candidates);
  }

  const bestScore = Math.max(
    ...candidates.map((candidate) =>
      scoreCandidate(board, candidate, factors, 2),
    ),
  );
  const bestCandidates = candidates.filter(
    (candidate) => scoreCandidate(board, candidate, factors, 2) === bestScore,
  );

  return pickRandomCandidate(bestCandidates);
}

function getConstrainedMoves(
  board: MatMatikBoard,
  factors: Record<SelectorHandle, number>,
): SelectorMove[] {
  const candidates = new Map<string, SelectorMove>();

  for (const factor of MATMATIK_FACTORS) {
    if (factor !== factors.top) {
      const product = factor * factors.bottom;
      const productIndex = getProductIndex(product);
      if (productIndex >= 0 && board[productIndex] === null) {
        candidates.set(`top-${product}`, {
          a: factor,
          b: factors.bottom,
          factor,
          product,
          selector: 'top',
        });
      }
    }

    if (factor !== factors.bottom) {
      const product = factors.top * factor;
      const productIndex = getProductIndex(product);
      if (productIndex >= 0 && board[productIndex] === null) {
        candidates.set(`bottom-${product}`, {
          a: factors.top,
          b: factor,
          factor,
          product,
          selector: 'bottom',
        });
      }
    }
  }

  return Array.from(candidates.values());
}

function findImmediateCandidate(
  board: MatMatikBoard,
  candidates: SelectorMove[],
  player: MatMatikPlayer,
) {
  return (
    candidates.find((candidate) => {
      const nextBoard = applyMatMatikMove(board, candidate.product, player);
      return nextBoard ? findWinner(nextBoard) === player : false;
    }) ?? null
  );
}

function scoreCandidate(
  board: MatMatikBoard,
  candidate: SelectorMove,
  factors: Record<SelectorHandle, number>,
  player: MatMatikPlayer,
) {
  const nextBoard = applyMatMatikMove(board, candidate.product, player);
  if (!nextBoard) {
    return 0;
  }

  let score = 0;
  for (const nextCandidate of getConstrainedMoves(nextBoard, {
    ...factors,
    [candidate.selector]: candidate.factor,
  })) {
    const followUpBoard = applyMatMatikMove(
      nextBoard,
      nextCandidate.product,
      player,
    );
    if (followUpBoard && findWinner(followUpBoard) === player) {
      score += 20;
    }
    score += 1;
  }

  return score;
}

function pickRandomCandidate(candidates: SelectorMove[]): SelectorMove {
  return (
    candidates[Math.floor(Math.random() * candidates.length)] ?? candidates[0]
  );
}

function SelectorArrow({
  active,
  disabled,
  label,
  onActivate,
  onKeyMove,
  onPointerDown,
  position,
  selector,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onActivate: (selector: SelectorHandle) => void;
  onKeyMove: (selector: SelectorHandle, direction: -1 | 1) => void;
  onPointerDown: (
    selector: SelectorHandle,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
  position: number;
  selector: SelectorHandle;
}) {
  const isTop = selector === 'top';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onActivate(selector);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onKeyMove(selector, -1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          onKeyMove(selector, 1);
        }
      }}
      onPointerDown={(event) => onPointerDown(selector, event)}
      aria-label={`${label}: ${position}`}
      className={`absolute z-10 flex h-10 w-10 touch-none cursor-grab items-center justify-center rounded-full text-yellow-400 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/70 disabled:cursor-not-allowed disabled:opacity-60 ${
        isTop ? 'top-1' : 'bottom-1'
      } ${active ? 'scale-110 drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]' : 'drop-shadow-md'}`}
      style={{
        left: `${((position - 0.5) / MATMATIK_FACTORS.length) * 100}%`,
        transform: 'translateX(-50%)',
      }}
    >
      <Hand
        className={`h-9 w-9 fill-yellow-400 stroke-yellow-500 ${
          isTop ? 'rotate-180' : ''
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border px-5 py-4 font-bold transition ${
        active
          ? 'border-emerald-300 bg-emerald-400 text-slate-950'
          : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-emerald-300/60'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PlayerBadge({
  active,
  name,
  player,
  thinking,
}: {
  active: boolean;
  name: string;
  player: MatMatikPlayer;
  thinking: boolean;
}) {
  const isPlayerOne = player === 1;
  return (
    <div
      className={`relative min-h-20 overflow-visible rounded-3xl border px-4 py-3 transition ${
        isPlayerOne
          ? 'border-emerald-400/30 bg-emerald-500/10'
          : 'border-rose-400/30 bg-rose-500/10'
      } ${
        active
          ? isPlayerOne
            ? 'shadow-[0_0_34px_rgba(16,185,129,0.24)] ring-4 ring-emerald-300/25'
            : 'shadow-[0_0_34px_rgba(244,63,94,0.24)] ring-4 ring-rose-300/25'
          : ''
      }`}
    >
      {active && (
        <div
          className={`absolute top-1/2 hidden h-0 w-0 -translate-y-1/2 md:block ${
            isPlayerOne
              ? '-right-4 border-y-[12px] border-l-[16px] border-y-transparent border-l-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]'
              : '-left-4 border-y-[12px] border-r-[16px] border-y-transparent border-r-rose-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]'
          }`}
          aria-hidden="true"
        />
      )}
      <div className="flex h-full items-center gap-3">
        <div
          className={`h-12 w-12 shrink-0 rounded-2xl border-2 shadow-lg ${
            isPlayerOne
              ? 'border-emerald-200 bg-emerald-500 shadow-emerald-500/25'
              : 'border-rose-200 bg-rose-500 shadow-rose-500/25'
          }`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 text-left">
          <p
            className={`text-xs font-semibold uppercase tracking-widest ${
              active
                ? isPlayerOne
                  ? 'text-emerald-200'
                  : 'text-rose-200'
                : 'text-slate-500'
            }`}
          >
            {active
              ? thinking
                ? 'Düşünüyor'
                : 'Sıra sende'
              : isPlayerOne
                ? 'Yeşil'
                : 'Kırmızı'}
          </p>
          <p
            className={`mt-1 truncate text-xl font-black ${
              isPlayerOne ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            {name}
          </p>
        </div>
      </div>
    </div>
  );
}
