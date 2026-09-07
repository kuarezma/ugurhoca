'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Flame,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import type {
  DashboardGoalSnapshot,
  DashboardTask,
  StudentProfile,
} from '@/types/dashboard';
import { isAvatarImage } from '@/features/profile/utils/avatar-upload';

interface DashboardHeroProps {
  goalSnapshot: DashboardGoalSnapshot;
  latestScore: number | null;
  onAvatarClick?: () => void;
  onPrimaryAction: () => void;
  primaryTask: DashboardTask | null;
  user: StudentProfile;
}

const formatGradeLabel = (grade: number | string) =>
  grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`;

export default function DashboardHero({
  goalSnapshot,
  latestScore,
  onAvatarClick,
  onPrimaryAction,
  primaryTask,
  user,
}: DashboardHeroProps) {
  const hasImageAvatar = isAvatarImage(user.avatar_id);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-default bg-surface-1 dark:bg-slate-900/90 p-8 shadow-xl sm:p-12"
    >
      <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-accent-brand-tint blur-3xl pointer-events-none" />
      <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-overlay-1 blur-3xl pointer-events-none" />

      <div className="relative grid gap-8 xl:grid-cols-[1.35fr_0.9fr] xl:items-center">
        <div className="space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 120 120"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="xp-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="50%" stopColor="#F472B6" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="var(--border-subtle)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="url(#xp-ring)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${(goalSnapshot.progressPercent / 100) * 339.292} 339.292`}
                  style={{ transition: 'stroke-dasharray 600ms ease-out' }}
                />
              </svg>
              <motion.button
                type="button"
                onClick={onAvatarClick}
                whileHover={{ scale: 1.04 }}
                aria-label="Avatarı değiştir"
                className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-default bg-surface-2 text-4xl font-bold text-primary shadow-xl backdrop-blur-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {hasImageAvatar ? (
                  <Image
                    src={user.avatar_id || ''}
                    alt={`${user.name} profil fotoğrafı`}
                    fill
                    sizes="96px"
                    className="h-full w-full object-cover"
                  />
                ) : user.avatar_id ? (
                  <span className="text-5xl">{user.avatar_id}</span>
                ) : (
                  <span>{user.name?.[0] || '?'}</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Değiştir
                  </span>
                </div>
              </motion.button>
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-lg"
                aria-label={`Haftalık hedef yüzdesi ${goalSnapshot.progressPercent}%`}
              >
                %{goalSnapshot.progressPercent}
              </span>
            </div>

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-hairline bg-accent-brand-tint px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent-brand-ink">
                <Sparkles className="h-4 w-4 text-accent-warning-ink" />
                Öğrenci Günlük Merkez
              </div>
              <h1 className="text-3xl font-black text-primary sm:text-4xl">
                Hoş geldin, {user.name?.split(' ')[0] || 'Öğrenci'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary sm:text-base">
                Bugünkü ritmini, haftalık hedefini ve bir sonraki en iyi adımı
                tek ekranda toparladık.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-default bg-surface-2 px-4 py-2 text-sm font-semibold text-primary">
              <BookOpen className="h-4 w-4 text-secondary" />
              {formatGradeLabel(user.grade)}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-default bg-surface-2 px-4 py-2 text-sm font-semibold text-primary">
              <Flame className="h-4 w-4 text-accent-warning-ink" />
              {user.current_streak || 0} günlük seri
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-default bg-surface-2 px-4 py-2 text-sm font-semibold text-primary">
              <Trophy className="h-4 w-4 text-accent-success-ink" />
              {latestScore !== null
                ? `%${latestScore} son test`
                : 'İlk test seni bekliyor'}
            </div>
          </div>

          <div className="rounded-3xl border border-default bg-surface-2 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
                  <Target className="h-3.5 w-3.5 text-accent-info-ink" />
                  Haftalık Hedef
                </div>
                <p className="text-3xl font-black text-primary">
                  {goalSnapshot.completedMinutes}
                  <span className="ml-2 text-lg font-semibold text-secondary">
                    / {goalSnapshot.targetMinutes} dk
                  </span>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-medium text-secondary">
                  {goalSnapshot.activeDays} aktif gün
                </p>
                <p className="text-sm font-medium text-secondary">
                  {goalSnapshot.remainingMinutes > 0
                    ? `${goalSnapshot.remainingMinutes} dk kaldı`
                    : 'Hedef tamamlandı'}
                </p>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 transition-all"
                style={{ width: `${goalSnapshot.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-default bg-surface-2 p-6"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            <Sparkles className="h-3.5 w-3.5 text-accent-warning-ink" />
            Günün Ana Adımı
          </div>

          {primaryTask ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-tertiary">
                {primaryTask.badge} • {primaryTask.meta}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-primary">
                {primaryTask.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-secondary">
                {primaryTask.description}
              </p>
              <button
                type="button"
                onClick={onPrimaryAction}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow border border-indigo-500 transition-all hover:bg-indigo-700 active:scale-[0.99]"
              >
                {primaryTask.actionLabel}
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-2xl font-bold text-primary">
                Bugünü dengede götürüyorsun
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-secondary">
                Büyük bir açık görünmüyor. İstersen kısa bir test ya da tekrar
                ile tempoyu koruyabilirsin.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
