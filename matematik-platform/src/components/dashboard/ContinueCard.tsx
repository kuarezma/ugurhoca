'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { DashboardTask } from '@/types/dashboard';

interface ContinueCardProps {
  onAction: () => void;
  task: DashboardTask;
}

export default function ContinueCard({ onAction, task }: ContinueCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${task.accentClass} p-6`}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-3xl" />

      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          Şimdi Yapman Gereken
        </div>
        <h2 className="text-2xl font-black text-white">{task.title}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-200">
          {task.description}
        </p>
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15"
        >
          {task.actionLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.section>
  );
}
