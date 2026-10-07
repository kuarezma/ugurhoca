'use client';

import { Flame, FileCheck2, BookOpen, Trophy, Sparkles } from 'lucide-react';
import type { AppUser } from '@/types';
import { Mascot } from '@/components/Mascot';
import { SafeLink } from '@/components/SafeLink';
import type { AdventureProgressData } from './adventure-progress';
import type { AdventureTopicNode } from './AdventureCurriculumData';

interface AdventureTopHUDProps {
  user: AppUser | null;
  progress: AdventureProgressData | null;
  completedTopics: number;
  totalTopics: number;
  activeTopic: AdventureTopicNode | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AdventureTopHUD({
  user,
  progress,
  completedTopics,
  totalTopics,
  activeTopic,
  loading,
  error,
  onRetry,
}: AdventureTopHUDProps) {
  const completionPercent = totalTopics
    ? Math.round((completedTopics / totalTopics) * 100)
    : 0;
  const userName = user?.name ? user.name.split(' ')[0] : 'Şampiyon';

  return (
    <div className="card-playful-hero relative overflow-hidden rounded-3xl p-5 sm:p-8 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-6 transition-all duration-300">
      {/* Arka plan aurora ışıması */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl bg-brand-accent/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full blur-3xl bg-brand-secondary/20"
      />

      <div className="relative flex flex-col lg:contents items-center justify-between gap-6">
        {/* Sol: Maskot Pi ve Konuşma Balonu */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full">
          <div className="relative shrink-0">
            <div className="absolute -inset-2.5 rounded-full opacity-35 blur-md animate-pulse bg-brand-accent" />
            <Mascot
              pose={user ? 'celebrate' : 'waving'}
              size={96}
              className="relative drop-shadow-xl select-none"
              ariaLabel="Öğrenme Rehberin Pi"
            />
          </div>

          {/* Çizgi Film Tarzı Konuşma Balonu (Speech Bubble) */}
          <div className="relative min-w-0 flex-1 rounded-2xl p-4 bg-surface-2/90 border border-default/80 shadow-md">
            {/* Konuşma Balonu Kuyruğu (Sol Taraf) */}
            <div
              aria-hidden="true"
              className="hidden sm:block absolute -left-2 top-8 h-4 w-4 rotate-45 bg-surface-2 border-l border-b border-default/80"
            />

            <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/30 mb-1 shadow-xs">
              <Sparkles className="h-3 w-3 text-amber-700 dark:text-amber-400" />
              <span>Günün Macera Görevi</span>
            </div>

            <h1 className="font-display text-lg sm:text-xl lg:text-2xl font-black text-primary leading-tight truncate">
              Hoş geldin,{' '}
              <span className="text-blue-700 dark:text-blue-300">
                {userName}
              </span>
              !
            </h1>

            <p className="text-xs sm:text-sm text-secondary mt-1 leading-snug">
              {activeTopic ? (
                <SafeLink
                  href={activeTopic.testsHref}
                  className="hover:underline"
                >
                  Günün görevi: {activeTopic.title} yaprak testine çalış.
                </SafeLink>
              ) : (
                'Bu sınıfın tüm konularını tamamladın. İstediğin konuyu tekrar edebilirsin.'
              )}
            </p>
          </div>
        </div>

        {/* Sağ: Oyun Göstergeleri (Seri, Test, Konu, Rozet - 3D Tactile Kapsüller) */}
        {user && progress && (
          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3.5 w-full lg:grid lg:grid-cols-2 shrink-0">
            {/* 1. Günlük Seri (Streak) */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#ff9600] bg-[#fff5cc] dark:bg-amber-950/40 px-3 sm:px-4 py-2.5 shadow-[0_4px_0_#d87e00] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#d87e00] transition-all duration-150">
              <div className="flex items-center gap-1.5 text-[#d87e00] dark:text-amber-400">
                <Flame className="h-5 w-5 fill-current animate-bounce" />
                <span className="font-display text-lg sm:text-xl font-black">
                  {progress.currentStreak}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wide mt-0.5 text-[#8a5800] dark:text-amber-300">
                Gün Serisi
              </span>
            </div>

            {/* 2. Çözülen Test */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#1cb0f6] bg-[#ddf4ff] dark:bg-sky-950/40 px-3 sm:px-4 py-2.5 shadow-[0_4px_0_#1899d6] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#1899d6] transition-all duration-150">
              <div className="flex items-center gap-1.5 text-[#1899d6] dark:text-sky-400">
                <FileCheck2 className="h-5 w-5 fill-current" />
                <span className="font-display text-lg sm:text-xl font-black">
                  {progress.quizCount}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wide mt-0.5 text-[#0c6999] dark:text-sky-300">
                Çözülen Test
              </span>
            </div>

            {/* 3. Tamamlanan Konular */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#58cc02] bg-[#d7ffb8] dark:bg-emerald-950/40 px-3 sm:px-4 py-2.5 shadow-[0_4px_0_#46a302] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#46a302] transition-all duration-150">
              <div className="flex items-center gap-1.5 text-green-ink dark:text-emerald-400">
                <BookOpen className="h-5 w-5 fill-current" />
                <span className="font-display text-lg sm:text-xl font-black">
                  {completedTopics}/{totalTopics}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wide mt-0.5 text-[#276700] dark:text-emerald-300">
                Tamamlanan Konu
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-default bg-surface-2 px-3 sm:px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-primary">
                <Trophy className="h-5 w-5" />
                <span className="font-display text-lg sm:text-xl font-black">
                  {progress.badgeCount}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wide mt-0.5 text-secondary">
                Rozet
              </span>
            </div>
          </div>
        )}
      </div>

      {!user && (
        <div className="contents lg:flex lg:flex-col lg:justify-center lg:gap-3">
          <p className="hidden text-sm text-secondary lg:block">
            Konunu seç, ders notuyla hazırlan ve yaprak testlerle öğrendiklerini
            pekiştir. Giriş yaparak yıldızlarını ve ilerlemeni takip et.
          </p>
          <SafeLink href="/giris" className="btn-3d btn-green mt-5 lg:mt-0">
            Giriş yap, ilerlemen kaydedilsin
          </SafeLink>
        </div>
      )}
      {user && loading && (
        <p role="status" className="mt-5 text-sm text-secondary">
          İlerlemen yükleniyor...
        </p>
      )}
      {user && error && (
        <div role="alert" className="mt-5 text-sm text-secondary">
          {error}{' '}
          <button type="button" onClick={onRetry} className="underline">
            Yeniden dene
          </button>
        </div>
      )}

      {/* Seviye İlerleme Çubuğu */}
      {user && progress && (
        <div className="lg:col-span-2 mt-5 pt-4 border-t-2 border-default flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-secondary">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-bold text-primary">Konu İlerlemen</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="h-3.5 flex-1 rounded-full bg-surface-3 overflow-hidden p-0.5 border-2 border-default">
              <div
                className="h-full rounded-full bg-[#58cc02] shadow-inner transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="font-black text-xs text-primary whitespace-nowrap">
              {completionPercent}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdventureTopHUD;
