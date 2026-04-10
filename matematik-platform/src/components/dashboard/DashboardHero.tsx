"use client";

import { motion } from "framer-motion";
import { Bell, BookOpen, ClipboardList, Sparkles } from "lucide-react";
import { StudentProfile } from "@/types/dashboard";

interface DashboardHeroProps {
  user: StudentProfile;
  pendingAssignments: number;
  unreadCount: number;
  availableQuizCount: number;
  weeklyMinutes: number;
}

const formatGradeLabel = (grade: number | string) =>
  grade === "Mezun" ? "Mezun" : `${grade}. Sınıf`;

export default function DashboardHero({
  user,
  pendingAssignments,
  unreadCount,
  availableQuizCount,
  weeklyMinutes,
}: DashboardHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/30 to-fuchsia-500/25 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500/25 to-cyan-500/20 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-3xl font-bold text-white"
          >
            {user.name?.[0] || "?"}
          </motion.div>

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Öğrenci Dashboard
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Hoş geldin, {user.name?.split(" ")[0] || "Öğrenci"}
            </h1>
            <p className="mt-1 text-sm text-slate-400 sm:text-base">
              İçeriklerine, görevlerine ve gelişimine tek yerden ulaş.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-4 py-1.5">
              <BookOpen className="h-4 w-4 text-indigo-300" />
              <span className="text-sm font-semibold text-indigo-200">
                {formatGradeLabel(user.grade)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[440px]">
          {[
            {
              label: "Bekleyen Ödev",
              value: pendingAssignments,
              icon: ClipboardList,
              accent: "from-purple-500/20 to-fuchsia-500/20",
              text: "text-purple-200",
            },
            {
              label: "Yeni Bildirim",
              value: unreadCount,
              icon: Bell,
              accent: "from-indigo-500/20 to-cyan-500/20",
              text: "text-indigo-200",
            },
            {
              label: "Uygun Test",
              value: availableQuizCount,
              icon: BookOpen,
              accent: "from-emerald-500/20 to-teal-500/20",
              text: "text-emerald-200",
            },
            {
              label: "Bu Hafta",
              value: `${weeklyMinutes} dk`,
              icon: Sparkles,
              accent: "from-amber-500/20 to-orange-500/20",
              text: "text-amber-200",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${item.accent} p-3`}
            >
              <div className="mb-2 flex items-center justify-between">
                <item.icon className={`h-4 w-4 ${item.text}`} />
                <span className={`text-lg font-black ${item.text}`}>
                  {item.value}
                </span>
              </div>
              <p className="text-xs text-slate-300">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
