'use client';

import { motion } from 'framer-motion';
import { ChevronRight, ListTodo } from 'lucide-react';
import type { DashboardTask } from '@/types/dashboard';

interface TodayPlanCardProps {
  tasks: DashboardTask[];
  onSelectTask: (task: DashboardTask) => void;
}

export default function TodayPlanCard({
  tasks,
  onSelectTask,
}: TodayPlanCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">
            <ListTodo className="h-3.5 w-3.5" />
            Bugünkü Plan
          </div>
          <h2 className="text-2xl font-bold text-white">
            Bugün ne yapmalıyım?
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Öncelik sırasına göre seçilmiş üç kısa adım.
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 px-4 py-2 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Görev
          </p>
          <p className="text-xl font-black text-white">{tasks.length}</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
          <p className="text-lg font-semibold text-white">
            Bugünkü plan temiz.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Hedeflerini kapatmışsın. İstersen bir test daha çözüp ritmi sıcak
            tutabilirsin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task)}
              className={`group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${task.accentClass} p-5 text-left transition-all hover:border-white/20 hover:bg-white/10`}
            >
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/10 to-transparent opacity-70" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/15 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/90">
                        {task.badge}
                      </span>
                      <span className="text-xs font-medium text-white/70">
                        {task.meta}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-200">
                      {task.description}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 self-start rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors group-hover:bg-white/15 sm:self-center">
                  {task.actionLabel}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.section>
  );
}
