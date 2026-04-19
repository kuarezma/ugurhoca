'use client';

import { motion } from 'framer-motion';
import { Award, Flame, Sparkles, Trophy } from 'lucide-react';
import type { DashboardBadge } from '@/types/dashboard';

interface MotivationPanelProps {
  badges: DashboardBadge[];
  latestScore: number | null;
  message: string;
  streak: number;
}

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
            Son Rozetler
          </h3>
          <span className="text-xs text-slate-400">{badges.length} toplam</span>
        </div>

        {badges.length === 0 ? (
          <p className="text-sm text-slate-400">
            İlk rozeti açmak için test çözüp seriyi başlat.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {badges.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="min-w-[140px] rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3"
              >
                <p className="text-sm font-bold text-white">{badge.name}</p>
                <p className="mt-1 text-xs text-amber-200/80">
                  {badge.earnedAt
                    ? new Date(badge.earnedAt).toLocaleDateString('tr-TR')
                    : 'Yeni rozet'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
