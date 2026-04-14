'use client';

/* eslint-disable @next/next/no-img-element -- user-provided avatar images can come from Supabase storage URLs */

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
  const heroAccent =
    primaryTask?.accentClass ||
    'from-sky-500/20 via-blue-500/15 to-indigo-500/10';
  const hasImageAvatar = isAvatarImage(user.avatar_id);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br ${heroAccent} p-8 shadow-2xl sm:p-12`}
    >
      <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-black/10 blur-3xl" />

      <div className="relative grid gap-8 xl:grid-cols-[1.35fr_0.9fr] xl:items-center">
        <div className="space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <motion.button
              type="button"
              onClick={onAvatarClick}
              whileHover={{ scale: 1.05 }}
              className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/20 to-white/5 text-4xl font-bold text-white shadow-xl backdrop-blur-md transition-all"
            >
              {hasImageAvatar ? (
                <img
                  src={user.avatar_id || ''}
                  alt={`${user.name} profil fotoğrafı`}
                  className="h-full w-full object-cover"
                />
              ) : user.avatar_id ? (
                <span className="text-5xl">{user.avatar_id}</span>
              ) : (
                <span>{user.name?.[0] || '?'}</span>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Değiştir
                </span>
              </div>
            </motion.button>

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-amber-300" />
                Öğrenci Günlük Merkez
              </div>
              <h1 className="text-3xl font-black text-white sm:text-4xl">
                Hoş geldin, {user.name?.split(' ')[0] || 'Öğrenci'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Bugünkü ritmini, haftalık hedefini ve bir sonraki en iyi adımı
                tek ekranda toparladık.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
              <BookOpen className="h-4 w-4 text-white/70" />
              {formatGradeLabel(user.grade)}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
              <Flame className="h-4 w-4 text-orange-300" />
              {user.current_streak || 0} günlük seri
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
              <Trophy className="h-4 w-4 text-emerald-300" />
              {latestScore !== null
                ? `%${latestScore} son test`
                : 'İlk test seni bekliyor'}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-md">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                  <Target className="h-3.5 w-3.5 text-cyan-200" />
                  Haftalık Hedef
                </div>
                <p className="text-3xl font-black text-white">
                  {goalSnapshot.completedMinutes}
                  <span className="ml-2 text-lg font-semibold text-white/60">
                    / {goalSnapshot.targetMinutes} dk
                  </span>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-medium text-white/70">
                  {goalSnapshot.activeDays} aktif gün
                </p>
                <p className="text-sm font-medium text-white/70">
                  {goalSnapshot.remainingMinutes > 0
                    ? `${goalSnapshot.remainingMinutes} dk kaldı`
                    : 'Hedef tamamlandı'}
                </p>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 transition-all"
                style={{ width: `${goalSnapshot.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-md"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Günün Ana Adımı
          </div>

          {primaryTask ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                {primaryTask.badge} • {primaryTask.meta}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white">
                {primaryTask.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {primaryTask.description}
              </p>
              <button
                type="button"
                onClick={onPrimaryAction}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-all hover:scale-[1.01] hover:bg-slate-100"
              >
                {primaryTask.actionLabel}
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-2xl font-bold text-white">
                Bugünü dengede götürüyorsun
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
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
