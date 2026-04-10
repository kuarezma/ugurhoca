"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  ChevronRight,
  ClipboardList,
  LucideIcon,
  PencilLine,
} from "lucide-react";
import { QuickActionCardProps } from "@/types/dashboard";

interface QuickActionItem extends QuickActionCardProps {
  icon: LucideIcon;
}

interface QuickActionGridProps {
  items: QuickActionItem[];
}

export default function QuickActionGrid({ items }: QuickActionGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <motion.article
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * index }}
          className={`group rounded-3xl border border-white/10 bg-gradient-to-br ${item.accentClass} p-5`}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClass}`}>
              <item.icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              {item.badge ? (
                <div className="mb-2 inline-flex rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                  {item.badge}
                </div>
              ) : null}
              <div className="text-2xl font-black text-white">{item.stat}</div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white">{item.title}</h2>
          <p className="mt-2 min-h-[44px] text-sm text-slate-300">
            {item.description}
          </p>

          <button
            type="button"
            onClick={item.onAction}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
          >
            {item.actionLabel}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.article>
      ))}
    </section>
  );
}

export const quickActionIcons = {
  tests: PencilLine,
  assignments: ClipboardList,
  progress: BarChart3,
  messages: Bell,
};
