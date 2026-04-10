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
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <motion.button
          type="button"
          onClick={item.onAction}
          key={item.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 * index }}
          className={`group flex items-center justify-between rounded-2xl border border-white/5 bg-gradient-to-r ${item.accentClass.replace('to-', 'to-transparent')} p-4 text-left transition-all hover:bg-white/5 hover:border-white/20`}
        >
          <div className="flex items-center gap-4">
            <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform ${item.iconClass}`}>
              <item.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">{item.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-semibold text-white/90">{item.stat}</span>
                {item.badge ? (
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/70">
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-white/30 transition-all group-hover:text-white group-hover:translate-x-1" />
        </motion.button>
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
