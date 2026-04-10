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
  const items = [
    {
      label: "Çalışma Serisi",
      value: `${streak} gün`,
      icon: Flame,
      text: "text-orange-300",
      bg: "bg-orange-500/15",
    },
    {
      label: "Bu Hafta",
      value: `${weeklyMinutes} dk`,
      icon: Target,
      text: "text-cyan-300",
      bg: "bg-cyan-500/15",
    },
    {
      label: "Son Test",
      value: latestScore !== null ? `%${latestScore}` : "Henüz yok",
      icon: Trophy,
      text: "text-emerald-300",
      bg: "bg-emerald-500/15",
    },
    {
      label: "Odak Konu",
      value: focusTopic || strongTopic || "Çalışma ekle",
      icon: BarChart3,
      text: "text-violet-300",
      bg: "bg-violet-500/15",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">İlerleme Özeti</h2>
          <p className="mt-1 text-sm text-slate-400">
            Gelişimini tek bakışta gör, detay için ilerleme ekranına geç.
          </p>
        </div>
        <Link
          href={detailHref}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
        >
          Detaylı Analiz
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.text}`} />
            </div>
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-1 text-lg font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Güçlü Alan
          </p>
          <p className="mt-2 text-white">
            {strongTopic || "Henüz yeterli veri yok. Düzenli çalışma ekledikçe burada güçlendiğin konular görünecek."}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
            Tekrar Önerisi
          </p>
          <p className="mt-2 text-white">
            {focusTopic || "Şu an belirgin bir eksik alan görünmüyor. İstersen ilerleme sayfasından yeni çalışma ekleyebilirsin."}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
