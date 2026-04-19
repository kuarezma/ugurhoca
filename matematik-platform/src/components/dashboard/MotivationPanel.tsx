'use client';

import { motion } from 'framer-motion';
import {
  Award,
  Crown,
  Flame,
  Lock,
  Medal,
  Sparkles,
  Sunrise,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { BADGE_CATALOG } from '@/features/profile/constants/badgeCatalog';
import type { DashboardBadge } from '@/types/dashboard';

interface MotivationPanelProps {
  badges: DashboardBadge[];
  latestScore: number | null;
  message: string;
  streak: number;
}

const BADGE_ICONS: Record<string, LucideIcon> = {
  Award,
  Crown,
  Flame,
  Medal,
  Sparkles,
  Sunrise,
  Target,
  Trophy,
};

const resolveBadgeIcon = (name?: string): LucideIcon =>
  (name && BADGE_ICONS[name]) || Award;

const getNextStreakTarget = (streak: number) => {
  if (streak < 3) {
    return 3;
  }

  if (streak < 7) {
    return 7;
  }

  if (streak < 14) {
    return 14;
  }

  return streak + 7;
};

export default function MotivationPanel({
  badges,
  latestScore,
  message,
  streak,
}: MotivationPanelProps) {
  const nextTarget = getNextStreakTarget(streak);
  const daysLeft = Math.max(nextTarget - streak, 0);

  const stats = [
    {
      icon: Flame,
      label: 'Seri',
      tone: 'text-orange-300',
      value: `${streak} gün`,
    },
    {
      icon: Trophy,
      label: 'Son test',
      tone: 'text-emerald-300',
      value: latestScore !== null ? `%${latestScore}` : 'Hazır değil',
    },
    {
      icon: Award,
      label: 'Rozet',
      tone: 'text-sky-300',
      value: `${badges.length}`,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-slate-800/70 p-6 sm:p-8"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Motivasyon
          </div>
          <h2 className="text-2xl font-bold text-white">Ritmini koru</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            {message}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Sıradaki hedef
          </p>
          <p className="mt-1 text-xl font-black text-white">{nextTarget} gün</p>
          <p className="text-xs text-slate-400">
            {daysLeft === 0 ? 'Hazır' : `${daysLeft} gün kaldı`}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <stat.icon className={`h-5 w-5 ${stat.tone}`} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              {stat.label}
            </p>
            <p className="mt-2 text-lg font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Rozet Yolculuğu
          </h3>
          <span className="text-xs text-slate-400">
            {badges.length} / {BADGE_CATALOG.length}
          </span>
        </div>

        <ul
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          aria-label="Rozet kataloğu"
        >
          {BADGE_CATALOG.map((entry) => {
            const earned = badges.find(
              (badge) => (badge.id ?? '').toString() === entry.type,
            );
            const lookup =
              earned ||
              badges.find(
                (badge) => badge.name?.toLowerCase() === entry.name.toLowerCase(),
              );
            const isEarned = Boolean(lookup);
            const Icon = resolveBadgeIcon(lookup?.icon || entry.icon);

            return (
              <li
                key={entry.type}
                className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                  isEarned
                    ? 'border-amber-500/30 bg-amber-500/10'
                    : 'border-white/5 bg-white/[0.03]'
                }`}
                title={entry.description}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isEarned
                      ? 'bg-amber-500/30 text-amber-100'
                      : 'bg-white/10 text-slate-500'
                  }`}
                  aria-hidden="true"
                >
                  {isEarned ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold ${
                      isEarned ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {entry.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
                    {entry.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.section>
  );
}
