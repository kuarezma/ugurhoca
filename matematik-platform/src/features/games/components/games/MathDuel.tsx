'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Bot,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Swords,
  Timer,
  User,
  Zap,
} from 'lucide-react';
import type { GameComponentProps } from '@/features/games/types';
import { gameAudio } from '@/features/games/utils/gameAudio';

type DuelCategory =
  | 'Dört İşlem'
  | 'İşlem Önceliği'
  | 'Üslü Sayılar'
  | 'Basit Denklem';

type Question = {
  category: DuelCategory;
  correctAnswer: number;
  options: number[];
  prompt: string;
};

type DuelMode = 'bot' | 'solo';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDuelQuestion(streak: number): Question {
  const rand = Math.random();
  let category: DuelCategory = 'Dört İşlem';
  let prompt = '';
  let correctAnswer = 0;

  if (streak > 5 && rand > 0.65) {
    category = 'Basit Denklem';
    const x = Math.floor(Math.random() * 8) + 2;
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 15) + 1;
    const total = a * x + b;
    prompt = `${a}x + ${b} = ${total}  →  x = ?`;
    correctAnswer = x;
  } else if (streak > 2 && rand > 0.45) {
    category = 'İşlem Önceliği';
    const op = Math.random() > 0.5 ? '+' : '-';
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 6) + 2;
    const c = Math.floor(Math.random() * 10) + 5;
    if (op === '+') {
      prompt = `${c} + ${a} × ${b} = ?`;
      correctAnswer = c + a * b;
    } else {
      prompt = `(${c} + ${a}) × ${b} = ?`;
      correctAnswer = (c + a) * b;
    }
  } else if (rand > 0.75) {
    category = 'Üslü Sayılar';
    const base = Math.floor(Math.random() * 4) + 2;
    const exp = base === 2 ? 4 : base === 3 ? 3 : 2;
    const add = Math.floor(Math.random() * 10) + 1;
    const powVal = Math.pow(base, exp);
    prompt = `${base}${exp === 2 ? '²' : exp === 3 ? '³' : '⁴'} + ${add} = ?`;
    correctAnswer = powVal + add;
  } else {
    category = 'Dört İşlem';
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const a = Math.floor(Math.random() * 45) + 12;
      const b = Math.floor(Math.random() * 45) + 12;
      prompt = `${a} + ${b} = ?`;
      correctAnswer = a + b;
    } else if (type === 1) {
      const a = Math.floor(Math.random() * 60) + 25;
      const b = Math.floor(Math.random() * 30) + 10;
      prompt = `${a} - ${b} = ?`;
      correctAnswer = a - b;
    } else if (type === 2) {
      const a = Math.floor(Math.random() * 9) + 4;
      const b = Math.floor(Math.random() * 9) + 4;
      prompt = `${a} × ${b} = ?`;
      correctAnswer = a * b;
    } else {
      const b = Math.floor(Math.random() * 9) + 3;
      const ans = Math.floor(Math.random() * 10) + 3;
      const a = b * ans;
      prompt = `${a} ÷ ${b} = ?`;
      correctAnswer = ans;
    }
  }

  // Generate 3 unique distractors
  const distractors = new Set<number>();
  const offsets = [-3, -2, -1, 1, 2, 3, 5, 10, -5];
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

  const options = shuffle([correctAnswer, ...Array.from(distractors)]);

  return {
    category,
    correctAnswer,
    options,
    prompt,
  };
}

export function MathDuel({
  onExit,
  onScore,
  scoreMultiplier = 1,
}: GameComponentProps) {
  const [mode, setMode] = useState<DuelMode>('bot');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() =>
    generateDuelQuestion(0),
  );
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'correct' | 'wrong';
  } | null>(null);

  const opponentIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextQuestion = useCallback(
    (currentStreak: number) => {
      setCurrentQuestion(generateDuelQuestion(currentStreak));
    },
    [],
  );

  const startGame = useCallback(() => {
    setPlayerScore(0);
    setOpponentScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalAnswered(0);
    setTotalCorrect(0);
    setTimeLeft(60);
    setFeedback(null);
    setCurrentQuestion(generateDuelQuestion(0));
    setGameState('playing');
    gameAudio.playPop();
  }, []);

  const finishGame = useCallback(() => {
    setGameState('ended');
    if (opponentIntervalRef.current) {
      clearInterval(opponentIntervalRef.current);
    }
    gameAudio.playFanfare();
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

  // Submit score to leaderboard once when ended
  const hasSubmittedRef = useRef(false);
  useEffect(() => {
    if (gameState === 'playing') {
      hasSubmittedRef.current = false;
    }
    if (gameState === 'ended' && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      const finalScore = Math.round(playerScore * (scoreMultiplier || 1));
      onScore(finalScore);
    }
  }, [gameState, playerScore, scoreMultiplier, onScore]);

  // Bot simulation logic
  useEffect(() => {
    if (gameState !== 'playing' || mode !== 'bot') return;

    let isMounted = true;

    // Bot solves every 3.8 to 5.2 seconds with 85% accuracy
    const scheduleNextBotAction = () => {
      const delay = Math.floor(Math.random() * 1600) + 3600;
      opponentIntervalRef.current = setTimeout(() => {
        if (!isMounted) return;

        const isBotSuccess = Math.random() < 0.85;
        if (isBotSuccess) {
          const gained = 100 + Math.floor(Math.random() * 3) * 15;
          setOpponentScore((prev) => prev + gained);
        }
        scheduleNextBotAction();
      }, delay);
    };

    scheduleNextBotAction();

    return () => {
      isMounted = false;
      if (opponentIntervalRef.current) {
        clearTimeout(opponentIntervalRef.current);
      }
    };
  }, [gameState, mode]);

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

        const streakBonus = Math.min(newStreak * 20, 100);
        const points = 100 + streakBonus;
        setPlayerScore((s) => s + points);

        if (newStreak >= 3) {
          gameAudio.playCombo(newStreak);
          setFeedback({
            message: `Harika! Kombo x${newStreak} (+${points})`,
            type: 'correct',
          });
        } else {
          gameAudio.playCorrect();
          setFeedback({
            message: `Doğru! (+${points})`,
            type: 'correct',
          });
        }
        nextQuestion(newStreak);
      } else {
        setStreak(0);
        gameAudio.playWrong();
        setFeedback({
          message: `Yanlış! Doğru cevap: ${currentQuestion.correctAnswer}`,
          type: 'wrong',
        });
        nextQuestion(0);
      }
    },
    [gameState, currentQuestion, streak, nextQuestion],
  );

  // Keyboard support (1, 2, 3, 4)
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
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-2xl text-slate-100 min-h-[560px] flex flex-col justify-between">
      {/* HEADER: Title, Modes, Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-lg shadow-rose-500/20">
            <Swords className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Matematik Düellosu
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                1v1 Hızlı İşlem
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Süreyle yarış, kombo yap, rakibine fark at!
            </p>
          </div>
        </div>

        {gameState === 'idle' && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setMode('bot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'bot'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              Robot Düellosu
            </button>
            <button
              type="button"
              onClick={() => setMode('solo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'solo'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              Hız Antrenmanı
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <Timer className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span
              className={`font-mono text-lg font-black ${
                timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
              }`}
            >
              {timeLeft} sn
            </span>
          </div>
        )}
      </div>

      {/* IDLE SCREEN */}
      {gameState === 'idle' && (
        <div className="py-8 sm:py-12 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-xl shadow-rose-500/20">
              <Swords className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-emerald-500 text-slate-950 rounded-full text-xs font-black shadow-lg">
              60 SN
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-bold text-slate-100">
              {mode === 'bot'
                ? 'Siber Matematikçi Bot seni bekliyor!'
                : 'Zamana karşı kendi rekorunu kırmaya hazır mısın?'}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dört işlem, parantezli öncelik ve temel denklemleri en hızlı çözen
              kazanır. Ardı ardına doğru cevaplarla kombo bonusu kazan!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg text-left">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <div className="text-xs text-slate-400">Süre</div>
              <div className="text-base font-bold text-slate-200">60 Saniye</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <div className="text-xs text-slate-400">Hedef</div>
              <div className="text-base font-bold text-slate-200">Yüksek Puan</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <div className="text-xs text-slate-400">Kombo Çarpanı</div>
              <div className="text-base font-bold text-amber-400">+20 Bonus</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <div className="text-xs text-slate-400">Klavye Kısayolu</div>
              <div className="text-base font-bold text-slate-200">1 - 2 - 3 - 4</div>
            </div>
          </div>

          <button
            type="button"
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 font-black text-lg shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all transform active:scale-95"
          >
            <Play className="w-6 h-6 fill-current" />
            Düelloyu Başlat
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'playing' && (
        <div className="py-4 space-y-6">
          {/* DUAL SCOREBOARD / DUEL BARS */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player Side */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-indigo-300">Sen</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {streak >= 2 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      x{streak}
                    </span>
                  )}
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {playerScore}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-indigo-500 h-2 rounded-full"
                  animate={{
                    width: `${Math.min(100, (playerScore / 2000) * 100)}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Opponent Side */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/60 to-slate-900 border border-rose-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    {mode === 'bot' ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-rose-300">
                    {mode === 'bot' ? 'Siber Bot 🤖' : 'Zaman Hedefi'}
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {mode === 'bot' ? opponentScore : '1200'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-rose-500 h-2 rounded-full"
                  animate={{
                    width: `${
                      mode === 'bot'
                        ? Math.min(100, (opponentScore / 2000) * 100)
                        : Math.min(100, ((60 - timeLeft) / 60) * 100)
                    }%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* QUESTION BOX */}
          <div className="p-6 sm:p-8 bg-slate-800/80 rounded-2xl border border-slate-700 text-center shadow-inner relative overflow-hidden">
            <div className="inline-block px-3 py-1 rounded-full bg-slate-700/60 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
              {currentQuestion.category}
            </div>

            <h3 className="text-3xl sm:text-5xl font-black tracking-wider text-amber-300 font-mono my-2 select-none">
              {currentQuestion.prompt}
            </h3>

            {/* Feedback notification toast */}
            <div className="h-6 mt-2">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.message}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`text-xs sm:text-sm font-bold ${
                      feedback.type === 'correct'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ANSWER BUTTONS (4 OPTIONS) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={`${opt}-${idx}`}
                type="button"
                onClick={() => handleSelectAnswer(opt)}
                className="relative py-4 px-6 rounded-xl bg-slate-800/90 hover:bg-indigo-600/30 active:bg-indigo-600/50 border-2 border-slate-700 hover:border-indigo-400 text-xl sm:text-2xl font-black font-mono text-white transition-all transform active:scale-95 shadow-md group flex items-center justify-center gap-3"
              >
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-normal group-hover:text-indigo-300">
                  [{idx + 1}]
                </span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* END SCREEN (RESULTS) */}
      {gameState === 'ended' && (
        <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-6">
          <div className="p-4 rounded-3xl bg-slate-800/90 border border-slate-700 flex flex-col items-center shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center mb-3 shadow-lg">
              <Award className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {mode === 'bot'
                ? playerScore > opponentScore
                  ? '🎉 Zafer! Düelloyu Kazandın!'
                  : playerScore === opponentScore
                  ? '🤝 Muazzam Mücadele! Berabere!'
                  : '⚡ Tebrikler! İyi Mücadele Ettin!'
                : '🏁 Hız Antrenmanı Tamamlandı!'}
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              {mode === 'bot'
                ? `Sen: ${playerScore} Puan  ·  Siber Bot: ${opponentScore} Puan`
                : `60 saniyede toplam ${playerScore} puan topladın!`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <div className="text-xs text-slate-400">Kazanılan Skor</div>
              <div className="text-xl font-black text-amber-400">
                {Math.round(playerScore * (scoreMultiplier || 1))}
              </div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <div className="text-xs text-slate-400">Doğruluk</div>
              <div className="text-xl font-black text-emerald-400">
                %{accuracy}
              </div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <div className="text-xs text-slate-400">En Uzun Kombo</div>
              <div className="text-xl font-black text-indigo-400">
                {maxStreak}
              </div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <div className="text-xs text-slate-400">Doğru / Toplam</div>
              <div className="text-xl font-black text-white">
                {totalCorrect} / {totalAnswered}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Tekrar Oyna / Rövanş
            </button>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-all"
              >
                Çıkış
              </button>
            )}
          </div>
        </div>
      )}

      {/* FOOTER TIPS */}
      <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
        <span>Klavye tuşları [1, 2, 3, 4] ile hızlıca cevap verebilirsin.</span>
        <span>Çarpan: x{scoreMultiplier}</span>
      </div>
    </div>
  );
}
