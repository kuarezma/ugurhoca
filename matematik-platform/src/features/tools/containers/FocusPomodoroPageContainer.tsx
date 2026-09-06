'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Target,
  BookOpen,
  Headphones,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import { useTheme } from '@/components/ThemeProvider';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { gameAudio } from '@/features/games/utils/gameAudio';
import { useGameSoundMute } from '@/features/games/hooks/useGameSoundMute';
import {
  ambientAudio,
  AMBIENT_SOUND_OPTIONS,
  type AmbientSoundType,
} from '@/features/games/utils/ambientAudio';
import { getCurrentUserProfile, signOutClient } from '@/lib/auth-client';
import type { AppUser } from '@/types';

type TimerMode = 'focus25' | 'focus50' | 'break5' | 'break10';

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus25: 25 * 60,
  focus50: 50 * 60,
  break5: 5 * 60,
  break10: 10 * 60,
};

const MODE_LABELS: Record<TimerMode, { title: string; subtitle: string; icon: typeof Brain }> = {
  focus25: { title: '25 Dk Standart Odak', subtitle: 'Hızlı soru çözümü ve konu tekrarı', icon: Brain },
  focus50: { title: '50 Dk Derin Odak', subtitle: 'LGS / YKS deneme sınavı ve karmaşık problemler', icon: Flame },
  break5: { title: '5 Dk Kısa Mola', subtitle: 'Su iç, gözlerini dinlendir, derin nefes al', icon: Coffee },
  break10: { title: '10 Dk Uzun Mola', subtitle: 'Ayağa kalk, hafif esneme hareketleri yap', icon: Coffee },
};

export function FocusPomodoroPageContainer() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [user, setUser] = useState<AppUser | null>(null);
  const { isMuted, toggleMute } = useGameSoundMute();
  const soundEnabled = !isMuted;

  const [mode, setMode] = useState<TimerMode>('focus25');
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.focus25);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [sessionGoal, setSessionGoal] = useState('');

  const timerRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const originalTitleRef = useRef<string>('');
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    let isDisposed = false;
    getCurrentUserProfile({ redirectToLogin: false }).then((res) => {
      if (!isDisposed && res?.profile) {
        setUser(res.profile);
      }
    });
    return () => {
      isDisposed = true;
    };
  }, []);

  const handleLogout = async () => {
    await signOutClient();
    setUser(null);
    router.push('/');
  };

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  const isBreak = mode.startsWith('break');
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Sayacı çalıştırma ve sekme başlığı senkronizasyonu
  useEffect(() => {
    if (typeof document !== 'undefined' && !originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }

    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof document !== 'undefined' && originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
      return;
    }

    const initialTime = timeLeftRef.current;
    endTimeRef.current = Date.now() + initialTime * 1000;

    if (typeof document !== 'undefined') {
      const emoji = isBreak ? '☕' : '🍅';
      const m = Math.floor(initialTime / 60).toString().padStart(2, '0');
      const s = (initialTime % 60).toString().padStart(2, '0');
      document.title = `${emoji} ${m}:${s} - Odak | Uğur Hoca`;
    }

    timerRef.current = window.setInterval(() => {
      if (!endTimeRef.current) return;
      const remainingMs = endTimeRef.current - Date.now();
      const nextTime = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(nextTime);

      if (typeof document !== 'undefined') {
        const currentMins = Math.floor(nextTime / 60);
        const currentSecs = nextTime % 60;
        const formatted = `${currentMins.toString().padStart(2, '0')}:${currentSecs.toString().padStart(2, '0')}`;
        const emoji = isBreak ? '☕' : '🍅';
        document.title = `${emoji} ${formatted} - Odak | Uğur Hoca`;
      }

      if (nextTime <= 0) {
        setIsRunning(false);
        if (soundEnabled) gameAudio.playLevelUp();
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          try {
            navigator.vibrate([150, 80, 150]);
          } catch {
            // Sessizce devam et
          }
        }
        if (mode.startsWith('focus')) {
          setCompletedSessions((c) => c + 1);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof document !== 'undefined' && originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [isRunning, soundEnabled, mode, isBreak]);

  // Ambiyans ses kontrolü
  useEffect(() => {
    if (!isRunning || isMuted || ambientSound === 'none') {
      ambientAudio.stop();
      return;
    }

    ambientAudio.play(ambientSound);

    return () => {
      ambientAudio.stop();
    };
  }, [isRunning, isMuted, ambientSound]);

  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  const handleSelectMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const handleSelectAmbient = (type: AmbientSoundType) => {
    setAmbientSound(type);
    if (type === 'none' || isMuted || !isRunning) {
      ambientAudio.stop();
    } else {
      ambientAudio.play(type);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
      }`}
    >
      <HomeNavbar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-5xl px-4 pt-20 pb-28 sm:px-6 md:pt-24 md:pb-16">
        {/* Geri Dön Butonu */}
        <div className="mb-6">
          <SafeLink
            href="/"
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 border ${
              isLight
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </SafeLink>
        </div>

        {/* Hero Başlık */}
        <div
          className={`relative overflow-hidden rounded-3xl border px-6 py-8 sm:px-10 sm:py-9 mb-8 transition-all duration-300 ${
            isLight
              ? 'border-rose-200/80 bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 shadow-bento'
              : 'border-white/10 bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-950 shadow-2xl backdrop-blur-xl'
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-rose-500/15 blur-3xl"
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-3.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                <Timer className="h-4 w-4 animate-pulse text-rose-500" />
                <span>Odak & Pomodoro Zamanlayıcısı</span>
              </div>
              <h1
                className={`font-display text-2xl sm:text-4xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Matematik Odak Sayacı
              </h1>
              <p
                className={`max-w-2xl text-xs sm:text-base leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                25 veya 50 dakikalık kesintisiz çalışma bloklarıyla dikkatini topla, arka plan ambiyans sesleriyle çalışma verimini katla.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                aria-label={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 text-indigo-500" />
                    <span>Ses Açık</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 text-slate-400" />
                    <span>Sessiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Ana Sayaç Paneli */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol / Orta: Zamanlayıcı Kartı */}
          <div
            className={`lg:col-span-2 overflow-hidden rounded-3xl border p-6 sm:p-10 transition-all duration-300 ${
              isLight
                ? 'border-slate-200/90 bg-white shadow-bento'
                : 'border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl'
            }`}
          >
            {/* Mod Seçici Butonları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
              {[
                { id: 'focus25', label: '🎯 25 Dk Odak' },
                { id: 'focus50', label: '🔥 50 Dk Derin Odak' },
                { id: 'break5', label: '☕ 5 Dk Mola' },
                { id: 'break10', label: '🌴 10 Dk Uzun Mola' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMode(m.id as TimerMode)}
                  className={`rounded-2xl p-3 text-xs sm:text-sm font-bold transition-all border text-center ${
                    mode === m.id
                      ? isBreak
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-sm'
                      : isLight
                        ? 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Büyük Süre Göstergesi */}
            <div className="flex flex-col items-center justify-center my-6 space-y-4">
              <div
                className={`text-6xl sm:text-8xl font-black font-mono tracking-tight select-none transition-colors ${
                  isBreak
                    ? 'text-emerald-500'
                    : isRunning
                      ? 'text-rose-500 animate-pulse'
                      : isLight
                        ? 'text-slate-900'
                        : 'text-white'
                }`}
              >
                {timeString}
              </div>

              {/* İlerleme Çubuğu */}
              <div className="w-full max-w-md h-3 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${
                    isBreak
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                {isBreak ? <Coffee className="h-4 w-4 text-emerald-400" /> : <Brain className="h-4 w-4 text-rose-400" />}
                <span>{MODE_LABELS[mode].subtitle}</span>
              </div>
            </div>

            {/* Çalışma Hedefi Girişi */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={sessionGoal}
                  onChange={(e) => setSessionGoal(e.target.value)}
                  placeholder="Bu seansta neye odaklanıyorsun? (Örn: LGS Çarpanlar 20 Soru)"
                  className={`w-full rounded-2xl border pl-10 pr-4 py-2.5 text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400'
                      : 'border-white/10 bg-white/5 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>
            </div>

            {/* Başlat / Durdur / Sıfırla Butonları */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsRunning((r) => !r)}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                    : isBreak
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 shadow-rose-600/30'
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
                    <span>{timeLeft < totalDuration ? 'Devam Et' : 'Başlat'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                title="Sayacı Sıfırla"
                aria-label="Sayacı Sıfırla"
                className={`inline-flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                  isLight
                    ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <RotateCcw className="h-5 w-5" />
                <span className="hidden sm:inline">Sıfırla</span>
              </button>
            </div>
          </div>

          {/* Sağ Kolon: Ambiyans Sesleri & İstatistikler */}
          <div className="space-y-6">
            {/* Seans Sayacı */}
            <div
              className={`rounded-3xl border p-5 transition-all ${
                isLight ? 'border-slate-200/90 bg-white shadow-bento' : 'border-white/10 bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Bugünkü Odak Seansları
                </span>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-extrabold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {completedSessions}
                </span>
                <span className="text-xs font-medium text-slate-400">tamamlandı</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Her 4 odak seansından sonra 10-15 dakikalık uzun mola vererek zihnini yenile.
              </p>
            </div>

            {/* Arka Plan Ambiyans Sesleri */}
            <div
              className={`rounded-3xl border p-5 transition-all ${
                isLight ? 'border-slate-200/90 bg-white shadow-bento' : 'border-white/10 bg-slate-900/90'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Headphones className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Arka Plan Ambiyans Sesi
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Çalışırken odaklanmanı kolaylaştıran doğal ses dalgaları:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AMBIENT_SOUND_OPTIONS.map((snd) => (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => handleSelectAmbient(snd.id)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold text-left transition-all border flex items-center gap-2 ${
                      ambientSound === snd.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : isLight
                          ? 'border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{snd.icon}</span>
                    <span className="truncate">{snd.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Odak İpuçları */}
            <div
              className={`rounded-3xl border p-5 transition-all ${
                isLight ? 'border-slate-200/90 bg-white shadow-bento' : 'border-white/10 bg-slate-900/90'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Matematik Çalışma Taktikleri
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Telefonunu sessize alıp başka bir odaya bırak.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Yanına mutlaka bir bardak su ve karalama kağıdı al.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Takıldığın soruda 3 dakikadan fazla durma; turlama tekniğini uygula.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter isLight={isLight} />
    </div>
  );
}
