"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Flame, Target, Trophy } from "lucide-react";
import { ProgressSummaryProps } from "@/types/dashboard";

interface DashboardProgressOverviewProps extends ProgressSummaryProps {
  detailHref: string;
}

export default function ProgressOverview({
  streak,
  weeklyMinutes,
  latestScore,
  strongTopic,
  focusTopic,
  detailHref,
}: DashboardProgressOverviewProps) {
  const stats = [
    {
      label: "Çalışma Serisi",
      value: `${streak} gün`,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: "Bu Hafta",
      value: `${weeklyMinutes} dk`,
      icon: Target,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      label: "Son Test",
      value: latestScore !== null ? `%${latestScore}` : "Yok",
      icon: Trophy,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Odak",
      value: focusTopic || strongTopic || "-",
      icon: BarChart3,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
    >
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">İlerleme Özeti</h2>
          <p className="mt-1 text-sm text-white/50">Haftalık çalışma gelişimin</p>
        </div>
        <Link
          href={detailHref}
          className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <ArrowUpRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-8">
        {stats.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white/50 uppercase tracking-wider">{item.label}</p>
              <p className="truncate text-base font-bold text-white mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex flex-col rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent p-4 border border-emerald-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-emerald-500/5 to-transparent blur-xl"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Güçlü Alan</p>
          <p className="text-sm font-medium text-white/90">
            {strongTopic || "Veri toplanıyor..."}
          </p>
        </div>
        <div className="flex flex-col rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent p-4 border border-amber-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-amber-500/5 to-transparent blur-xl"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">Tekrar Önerisi</p>
          <p className="text-sm font-medium text-white/90">
            {focusTopic || "Şu an eksiğin görünmüyor."}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
