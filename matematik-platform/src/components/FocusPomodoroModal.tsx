'use client';

import { useState, useEffect, useRef, useId } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Volume2,
  VolumeX,
  CheckCircle2,
} from 'lucide-react';

type FocusPomodoroModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type TimerMode = 'focus25' | 'focus50' | 'break5' | 'break10';

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus25: 25 * 60,
  focus50: 50 * 60,
  break5: 5 * 60,
  break10: 10 * 60,
};

const playCompletionSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Tatlı C-E-G akoru
    playTone(523.25, now, 0.3);       // C5
    playTone(659.25, now + 0.15, 0.3); // E5
    playTone(783.99, now + 0.3, 0.5);  // G5
  } catch {
    // AudioContext izin verilmemişse sessizce geç
  }
};

export function FocusPomodoroModal({ isOpen, onClose }: FocusPomodoroModalProps) {
  const titleId = useId();
  const [mode, setMode] = useState<TimerMode>('focus25');
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.focus25);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<number | null>(null);

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Sayacı çalıştırma efekti
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (soundEnabled) playCompletionSound();
          if (mode.startsWith('focus')) {
            setCompletedSessions((c) => c + 1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled, mode]);

  if (!isOpen) return null;

  const handleSelectMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isBreak = mode.startsWith('break');

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5">
      <div
        className="fixed inset-0 -z-10 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl transition-all"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
              isBreak ? 'bg-emerald-500' : 'bg-gradient-to-br from-rose-500 to-amber-500'
            }`}>
              {isBreak ? <Coffee className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
            </div>
            <div>
              <h2 id={titleId} className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isBreak ? 'Mola Zamanı ☕' : 'Matematik Odak Sayacı ⏱️'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBreak ? 'Derin nefes al, zihnini dinlendir.' : 'Sorulara odaklan, dikkat dağıtıcıları kapat.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-indigo-500" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Gövde */}
        <div className="flex flex-col items-center p-6 space-y-6">
          {/* Mod Butonları */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              type="button"
              onClick={() => handleSelectMode('focus25')}
              className={`rounded-2xl p-2.5 text-xs font-bold transition-all border ${
                mode === 'focus25'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 shadow-sm'
                  : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              🎯 25 Dk Odak
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('focus50')}
              className={`rounded-2xl p-2.5 text-xs font-bold transition-all border ${
                mode === 'focus50'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              🔥 50 Dk Derin Odak
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('break5')}
              className={`rounded-2xl p-2.5 text-xs font-bold transition-all border ${
                mode === 'break5'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              ☕ 5 Dk Kısa Mola
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('break10')}
              className={`rounded-2xl p-2.5 text-xs font-bold transition-all border ${
                mode === 'break10'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              🌴 10 Dk Uzun Mola
            </button>
          </div>

          {/* Dairesel Sayaç */}
          <div className="relative flex items-center justify-center">
            <svg className="w-56 h-56 -rotate-90 transform" viewBox="0 0 200 200">
              {/* Arka plan halkası */}
              <circle
                cx="100"
                cy="100"
                r="84"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="12"
                fill="none"
              />
              {/* İlerleme halkası */}
              <circle
                cx="100"
                cy="100"
                r="84"
                className={`transition-all duration-1000 ${
                  isBreak ? 'stroke-emerald-500' : 'stroke-rose-500'
                }`}
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 84}
                strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Ortadaki Süre Metni */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-display text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                {timeString}
              </span>
              <span className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                {isRunning ? (isBreak ? 'Dinleniyorsun' : 'Odaklanıyorsun') : (timeLeft === 0 ? 'Süre Doldu!' : 'Hazır')}
              </span>
            </div>
          </div>

          {/* Aksiyon Kontrol Butonları */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              title="Sıfırla"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`flex h-14 px-8 items-center justify-center gap-2 rounded-2xl font-display text-base font-bold text-white shadow-lg transition-all active:scale-95 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                  : isBreak
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:opacity-95 shadow-rose-500/25'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5" />
                  <span>Duraklat</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-white" />
                  <span>{timeLeft === 0 ? 'Yeniden Başlat' : 'Başlat'}</span>
                </>
              )}
            </button>
          </div>

          {/* Tamamlanan Oturum Sayacı */}
          <div className="flex items-center gap-2 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-500/20 px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
            <span>Bugün Tamamlanan Oturum:</span>
            <span className="font-extrabold text-sm">{completedSessions}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
