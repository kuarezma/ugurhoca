'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BookOpenCheck,
  ClipboardList,
  FileText,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { HomeStatsSnapshot } from '@/features/home/home-initial-feed';

type HomeStatsStripProps = {
  isLight: boolean;
  stats?: HomeStatsSnapshot | null;
};

type StatTile = {
  id: keyof HomeStatsSnapshot;
  label: string;
  suffix: string;
  accent: string;
  iconClass: string;
  icon: LucideIcon;
  minimum: number;
};

const TILES: StatTile[] = [
  {
    id: 'students',
    label: 'Kayıtlı öğrenci',
    suffix: '+',
    accent: 'from-fuchsia-500/25 via-pink-500/20 to-rose-500/15',
    iconClass: 'bg-fuchsia-500/30 text-fuchsia-200',
    icon: Users,
    minimum: 100,
  },
  {
    id: 'quizzes',
    label: 'Hazır test',
    suffix: '+',
    accent: 'from-violet-500/25 via-indigo-500/20 to-blue-500/15',
    iconClass: 'bg-violet-500/30 text-violet-200',
    icon: BookOpenCheck,
    minimum: 25,
  },
  {
    id: 'documents',
    label: 'Ders belgesi',
    suffix: '+',
    accent: 'from-cyan-500/25 via-sky-500/20 to-blue-500/15',
    iconClass: 'bg-cyan-500/30 text-cyan-200',
    icon: FileText,
    minimum: 40,
  },
  {
    id: 'assignments',
    label: 'Takip edilen ödev',
    suffix: '+',
    accent: 'from-amber-500/25 via-orange-500/20 to-red-500/15',
    iconClass: 'bg-amber-500/30 text-amber-200',
    icon: ClipboardList,
    minimum: 30,
  },
];

function useCountUp(target: number, shouldStart: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldStart) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced || target === 0) {
      setValue(target);
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [shouldStart, target, duration]);

  return value;
}

function StatCard({
  tile,
  value,
  inView,
  isLight,
}: {
  tile: StatTile;
  value: number;
  inView: boolean;
  isLight: boolean;
}) {
  const count = useCountUp(value, inView);
  const Icon = tile.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className={`tilt-on-hover relative overflow-hidden rounded-3xl border p-5 backdrop-blur ${
        isLight
          ? 'border-slate-200/80 bg-white shadow-sm'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tile.accent} opacity-60`}
        aria-hidden="true"
      />
      <div className="relative flex items-start gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tile.iconClass}`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p
            className={`font-display text-3xl font-black tracking-tight sm:text-4xl ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
            aria-live="polite"
          >
            {count.toLocaleString('tr-TR')}
            <span className="ml-1 text-base font-bold text-amber-300">
              {tile.suffix}
            </span>
          </p>
          <p
            className={`mt-1 text-sm font-semibold ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            {tile.label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function HomeStatsStripInner({ isLight, stats }: HomeStatsStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  const resolved: HomeStatsSnapshot = {
    students: Math.max(stats?.students ?? 0, TILES[0].minimum),
    quizzes: Math.max(stats?.quizzes ?? 0, TILES[1].minimum),
    documents: Math.max(stats?.documents ?? 0, TILES[2].minimum),
    assignments: Math.max(stats?.assignments ?? 0, TILES[3].minimum),
  };

  return (
    <section
      ref={ref}
      aria-labelledby="home-stats-heading"
      className="mx-auto mt-6 w-full max-w-6xl px-4 sm:mt-10"
    >
      <h2 id="home-stats-heading" className="sr-only">
        Platform istatistikleri
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {TILES.map((tile) => (
          <StatCard
            key={tile.id}
            tile={tile}
            value={resolved[tile.id]}
            inView={inView}
            isLight={isLight}
          />
        ))}
      </div>
    </section>
  );
}

export const HomeStatsStrip = memo(HomeStatsStripInner);
HomeStatsStrip.displayName = 'HomeStatsStrip';
