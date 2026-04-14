'use client';

import { motion } from 'framer-motion';
import { BellRing, ChevronRight, FileBadge2, FileText } from 'lucide-react';
import type { DashboardUpdateItem } from '@/types/dashboard';

interface QuickUpdatesPanelProps {
  onSelectUpdate: (item: DashboardUpdateItem) => void;
  updates: DashboardUpdateItem[];
}

const updateIcons = {
  document: FileText,
  feedback: FileBadge2,
  message: BellRing,
} as const;

const updateTones = {
  document: 'bg-sky-500/15 text-sky-200',
  feedback: 'bg-emerald-500/15 text-emerald-200',
  message: 'bg-violet-500/15 text-violet-200',
} as const;

export default function QuickUpdatesPanel({
  onSelectUpdate,
  updates,
}: QuickUpdatesPanelProps) {
  if (updates.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
    >
      <div className="mb-5">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
          <BellRing className="h-3.5 w-3.5 text-amber-300" />
          Kısa Güncellemeler
        </div>
        <h2 className="text-xl font-bold text-white">
          Küçük ama faydalı işaretler
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Öğretmen mesajı, incelenen ödev ve yeni belgeler burada sakin bir
          akışta kalır.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {updates.map((item) => {
          const Icon = updateIcons[item.type];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectUpdate(item)}
              className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-white/20 hover:bg-white/10"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${updateTones[item.type]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                {item.description}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-white/85 transition-colors group-hover:text-white">
                  {item.actionLabel}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
