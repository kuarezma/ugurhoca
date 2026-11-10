'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  Zap,
  Timer,
  Trophy,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';

interface MathProblem {
  question: string;
  answer: number;
  options: number[];
}

function generateProblem(): MathProblem {
  const types = ['add', 'sub', 'mul', 'fraction'];
  const type = types[Math.floor(Math.random() * types.length)];

  let question = '';
  let answer = 0;

  if (type === 'mul') {
    const a = Math.floor(Math.random() * 10) + 3; // 3-12
    const b = Math.floor(Math.random() * 9) + 2; // 2-10
    question = `${a} × ${b}`;
    answer = a * b;
  } else if (type === 'add') {
    const a = Math.floor(Math.random() * 45) + 15;
    const b = Math.floor(Math.random() * 45) + 15;
    question = `${a} + ${b}`;
    answer = a + b;
  } else if (type === 'sub') {
    const a = Math.floor(Math.random() * 50) + 40;
    const b = Math.floor(Math.random() * 30) + 10;
    question = `${a} - ${b}`;
    answer = a - b;
  } else {
    // Kare veya küp pratikleri
    const base = Math.floor(Math.random() * 8) + 4; // 4-11
    question = `${base}²`;
    answer = base * base;
  }

  // 3 seçenek üret (1 doğru + 2 çeldirici)
  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 3) {
    const offset =
      (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const fake = answer + offset;
    if (fake > 0 && fake !== answer) {
      optionsSet.add(fake);
    }
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return { question, answer, options };
}

export function GuestSpeedMathDuel() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startNewGame = useCallback(() => {
    setIsPlaying(true);
    setIsFinished(false);
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setFeedback(null);
    setProblem(generateProblem());
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      setIsFinished(true);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

  const handleAnswer = (chosen: number) => {
    if (!problem || !isPlaying) return;

    if (chosen === problem.answer) {
      const nextCombo = combo + 1;
      const bonus = nextCombo > 3 ? 15 : 10;
      setScore((prev) => prev + bonus);
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      setFeedback('correct');
    } else {
      setCombo(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setProblem(generateProblem());
    }, 250);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-surface-1 border border-border-default shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-fg" />
            <h3 className="text-lg font-bold text-primary">
              60 Saniye Zihin Matematiği Düellosu
            </h3>
          </div>
          <p className="text-xs text-secondary mt-1">
            Hızlı düşün, işlem stratejilerini yarıştır ve arka arkaya seriler
            yakala!
          </p>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 border border-border-subtle text-xs font-bold text-primary">
              <Timer className="w-4 h-4 text-accent-fg" />
              <span>{timeLeft} sn</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-bg border border-accent-fg/20 text-xs font-bold text-accent-fg">
              <Trophy className="w-4 h-4" />
              <span>{score} Puan</span>
            </div>
            {combo > 1 && (
              <span className="text-xs font-black text-tone-warn-fg animate-bounce">
                🔥 {combo}x Seri!
              </span>
            )}
          </div>
        )}
      </div>

      {!isPlaying && !isFinished && (
        <div className="text-center py-8 space-y-4">
          <div className="max-w-md mx-auto text-sm text-secondary">
            Zihinden çarpma, toplama ve kare alma reflekslerini sına! Kayıt
            olmadan anında oyna.
          </div>
          <button
            type="button"
            onClick={startNewGame}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent-bg text-accent-fg font-bold text-sm shadow-md hover:opacity-90 transition"
          >
            <Play className="w-4 h-4" />
            <span>Düelloyu Başlat (60 sn)</span>
          </button>
        </div>
      )}

      {isPlaying && problem && (
        <div className="py-6 space-y-6 text-center">
          <div className="text-4xl sm:text-5xl font-black text-primary font-display tracking-tight">
            {problem.question} = ?
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {problem.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(opt)}
                className="py-4 px-3 rounded-2xl bg-surface-0 border border-border-default text-primary text-xl font-bold hover:bg-surface-2 hover:scale-[1.02] active:scale-[0.98] transition shadow-xs"
              >
                {opt}
              </button>
            ))}
          </div>

          {feedback && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold animate-fade-in">
              {feedback === 'correct' ? (
                <span className="text-tone-success-fg flex items-center gap-1">
                  <Check className="w-4 h-4" /> Harika! (+Seri Bonusu)
                </span>
              ) : (
                <span className="text-tone-danger-fg flex items-center gap-1">
                  <X className="w-4 h-4" /> Dikkat! Seri sıfırlandı
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {isFinished && (
        <div className="text-center py-6 space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-tone-success-bg border border-tone-success-border text-tone-success-fg mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black text-primary">Süre Doldu!</h4>
          <p className="text-sm text-secondary">
            Toplam Skor: <strong className="text-primary">{score}</strong> • En
            Uzun Seri: <strong className="text-accent-fg">{maxCombo}x</strong>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={startNewGame}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-2 border border-border-default text-primary text-xs font-bold hover:bg-surface-3 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tekrar Dene</span>
            </button>
            <Link
              href="/kayit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-bg text-accent-fg text-xs font-bold shadow-xs hover:opacity-90 transition"
            >
              <span>Liderlik Tablosuna Adını Yazdır</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
