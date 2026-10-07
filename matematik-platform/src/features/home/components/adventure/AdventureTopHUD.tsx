'use client';

import { Flame, Zap, Gem, Trophy, Target, Sparkles } from 'lucide-react';
import type { AppUser } from '@/types';
import { Mascot } from '@/components/Mascot';

interface AdventureTopHUDProps {
  user: AppUser | null;
  streakCount?: number;
  totalXp?: number;
  levelName?: string;
  diamonds?: number;
}

export function AdventureTopHUD({
  user,
  streakCount = 5,
  totalXp = 1850,
  levelName = 'Seviye 7: Denklem Avcısı',
  diamonds = 24,
}: AdventureTopHUDProps) {
  const userName = user?.name ? user.name.split(' ')[0] : 'Şampiyon';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-default bg-surface-1 shadow-2xl p-4 sm:p-7 transition-all duration-300">
      {/* Arka plan aurora ışıması */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gradient-to-br from-amber-500/20 via-pink-500/15 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-transparent blur-3xl"
      />

      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Sol: Maskot Pi ve Konuşma Balonu */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full lg:w-auto">
          <div className="relative shrink-0">
            <div className="absolute -inset-2.5 rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-indigo-600 opacity-35 blur-md animate-pulse" />
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

            <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-1 shadow-xs">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Günün Macera Görevi</span>
            </div>

            <h1 className="font-display text-lg sm:text-xl lg:text-2xl font-black text-primary leading-tight truncate">
              Hoş geldin, <span className="bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{userName}</span>!
            </h1>

            <p className="text-xs sm:text-sm text-secondary mt-1 leading-snug">
              Bugün serini korumak ve +120 XP kazanmak için 1 test çöz ve sıradaki üniteyi fethet!
            </p>
          </div>
        </div>

        {/* Sağ: Oyun Göstergeleri (Seri, XP, Elmas - 3D Tactile Kapsüller) */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2.5 sm:gap-3.5 w-full lg:w-auto shrink-0">
          {/* 1. Günlük Seri (Streak) */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-amber-400/50 bg-gradient-to-b from-amber-500/20 via-surface-2 to-surface-1 px-3 sm:px-4 py-2.5 shadow-[0_4px_0_rgba(217,119,6,0.4)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Flame className="h-5 w-5 fill-amber-500 text-amber-500 animate-bounce" />
              <span className="font-display text-lg sm:text-xl font-black text-primary">
                {streakCount}
              </span>
            </div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wide mt-0.5">
              Gün Seri
            </span>
          </div>

          {/* 2. Toplam XP */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-indigo-400/50 bg-gradient-to-b from-indigo-500/20 via-surface-2 to-surface-1 px-3 sm:px-4 py-2.5 shadow-[0_4px_0_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-1.5 text-indigo-400">
              <Zap className="h-5 w-5 fill-indigo-400 text-indigo-400" />
              <span className="font-display text-lg sm:text-xl font-black text-primary">
                {totalXp}
              </span>
            </div>
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wide mt-0.5">
              Toplam XP
            </span>
          </div>

          {/* 3. Elmaslar */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-b from-cyan-500/20 via-surface-2 to-surface-1 px-3 sm:px-4 py-2.5 shadow-[0_4px_0_rgba(6,182,212,0.4)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Gem className="h-5 w-5 fill-cyan-400 text-cyan-400" />
              <span className="font-display text-lg sm:text-xl font-black text-primary">
                {diamonds}
              </span>
            </div>
            <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wide mt-0.5">
              Elmas
            </span>
          </div>
        </div>
      </div>

      {/* Seviye İlerleme Çubuğu */}
      <div className="mt-5 pt-4 border-t border-default/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-secondary">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-bold text-primary">{levelName}</span>
          <span className="text-[11px] text-tertiary">(2.000 XP sonra Seviye 8)</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-64">
          <div className="h-2.5 flex-1 rounded-full bg-surface-3 overflow-hidden p-0.5 border border-default">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 transition-all duration-500"
              style={{ width: '75%' }}
            />
          </div>
          <span className="font-bold text-[11px] text-primary whitespace-nowrap">75%</span>
        </div>
      </div>
    </div>
  );
}

export default AdventureTopHUD;
