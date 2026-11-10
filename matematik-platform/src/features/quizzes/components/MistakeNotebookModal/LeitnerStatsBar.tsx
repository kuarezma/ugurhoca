import type { getSpacedReviewStats } from '@/features/quizzes/lib/mistakeStorage';

type SpacedReviewStats = ReturnType<typeof getSpacedReviewStats>;

type LeitnerStatsBarProps = {
  spacedStats: SpacedReviewStats;
};

export function LeitnerStatsBar({ spacedStats }: LeitnerStatsBarProps) {
  return (
    <div className="no-print border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-5 py-2.5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <span>🗃️ 5-Kutulu Leitner Tekrar Takvimi</span>
            <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
              (Ebbinghaus Kalıcı Hafıza Sistemi)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              Bugün: {spacedStats.dueToday}
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-amber-600 dark:text-amber-400">
              Yarın: {spacedStats.dueTomorrow}
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              Bu Hafta: {spacedStats.dueThisWeek}
            </span>
          </div>
        </div>

        {/* 5 Kutu + Kalıcı Hafıza Dağılım Kartları */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-xs">
          <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-950/20 p-1.5">
            <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
              1. Kutu (1g)
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-slate-800 dark:text-white">
              {spacedStats.box1}
            </div>
          </div>
          <div className="rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/60 dark:bg-blue-950/20 p-1.5">
            <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
              2. Kutu (3g)
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-slate-800 dark:text-white">
              {spacedStats.box2}
            </div>
          </div>
          <div className="rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/60 dark:bg-purple-950/20 p-1.5">
            <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
              3. Kutu (7g)
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-slate-800 dark:text-white">
              {spacedStats.box3}
            </div>
          </div>
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20 p-1.5">
            <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
              4. Kutu (14g)
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-slate-800 dark:text-white">
              {spacedStats.box4}
            </div>
          </div>
          <div className="rounded-xl border border-cyan-200 dark:border-cyan-500/20 bg-cyan-50/60 dark:bg-cyan-950/20 p-1.5">
            <div className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
              5. Kutu (30g)
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-slate-800 dark:text-white">
              {spacedStats.box5}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20 p-1.5">
            <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              Kalıcı 🏆
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              {spacedStats.mastered}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
