'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  Clock3,
  Flame,
  Target,
  Trophy,
} from 'lucide-react';
import type { DashboardGoalSnapshot } from '@/types/dashboard';

interface DashboardProgressOverviewProps {
  detailHref: string;
  focusTopic: string | null;
  goalSnapshot: DashboardGoalSnapshot;
  latestScore: number | null;
  strongTopic: string | null;
}

export default function ProgressOverview({
  detailHref,
  focusTopic,
  goalSnapshot,
  latestScore,
  strongTopic,
}: DashboardProgressOverviewProps) {
  const stats = [
    {
      icon: Target,
      label: 'Hedef',
      tone: 'text-cyan-300',
      value: `%${goalSnapshot.progressPercent}`,
    },
    {
      icon: Clock3,
      label: 'Kalan',
      tone: 'text-sky-300',
      value: `${goalSnapshot.remainingMinutes} dk`,
    },
    {
      icon: Flame,
      label: 'Aktif gün',
      tone: 'text-orange-300',
      value: `${goalSnapshot.activeDays}`,
    },
    {
      icon: Trophy,
      label: 'Son test',
      tone: 'text-emerald-300',
      value: latestScore !== null ? `%${latestScore}` : 'Yok',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">
            <BarChart3 className="h-3.5 w-3.5" />
            Haftalık İlerleme
          </div>
          <h2 className="text-2xl font-bold text-white">
            Hedefini küçük adımlarla kapat
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Bu haftaki çalışma akışın ve konu sinyallerin burada.
          </p>
        </div>
        <Link
          href={detailHref}
          className="group flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <ArrowUpRight className="h-5 w-5 text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-black/15 p-4"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <item.icon className={`h-5 w-5 ${item.tone}`} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-black/15 p-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Haftalık çizgi
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {goalSnapshot.completedMinutes}
              <span className="ml-2 text-base font-semibold text-slate-400">
                / {goalSnapshot.targetMinutes} dk
              </span>
            </p>
          </div>
          <p className="text-sm font-medium text-slate-400">
            {goalSnapshot.remainingMinutes > 0
              ? `${goalSnapshot.remainingMinutes} dk daha`
              : 'Hedef tamamlandı'}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {goalSnapshot.days.map((day) => {
            const height = day.minutes > 0 ? Math.max(16, day.minutes) : 10;

            return (
              <div
                key={day.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center"
              >
                <div className="flex h-28 items-end justify-center">
                  <div
                    className={`w-full rounded-2xl ${
                      day.isToday
                        ? 'bg-gradient-to-t from-emerald-300 to-cyan-300'
                        : 'bg-gradient-to-t from-slate-500 to-slate-300'
                    }`}
                    style={{ height: `${Math.min(height, 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {day.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {day.minutes} dk
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
            Güçlü Alan
          </p>
          <p className="mt-2 text-base font-bold text-white">
            {strongTopic || 'Veri birikiyor'}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
            Tekrar Önerisi
          </p>
          <p className="mt-2 text-base font-bold text-white">
            {focusTopic || 'Şu an belirgin açık görünmüyor'}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
