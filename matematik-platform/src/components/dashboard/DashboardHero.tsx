"use client";

import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { StudentProfile, ContinueState } from "@/types/dashboard";

interface DashboardHeroProps {
  user: StudentProfile;
  continueState: ContinueState;
  onAvatarClick?: () => void;
}

const formatGradeLabel = (grade: number | string) =>
  grade === "Mezun" ? "Mezun" : `${grade}. Sınıf`;

export default function DashboardHero({
  user,
  continueState,
  onAvatarClick,
}: DashboardHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br ${continueState.accentClass} p-8 sm:p-12 shadow-2xl`}
    >
      <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-black/10 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          <motion.button
            type="button"
            onClick={onAvatarClick}
            whileHover={{ scale: 1.05 }}
            className="group flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 shadow-xl backdrop-blur-md text-4xl font-bold text-white relative transition-all"
          >
            {user.avatar_id ? (
              <span className="text-5xl">{user.avatar_id}</span>
            ) : (
              <span>{user.name?.[0] || "?"}</span>
            )}
            <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Değiştir</span>
            </div>
            <div className="absolute -bottom-2 -right-2 flex items-center justify-center rounded-full bg-emerald-500 w-6 h-6 border-2 border-slate-900"></div>
          </motion.button>

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md border border-white/5">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Öğrenci Dashboard
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl drop-shadow-sm">
              Hoş geldin, {user.name?.split(" ")[0] || "Öğrenci"}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-1.5 text-sm font-semibold text-white/90 backdrop-blur-sm">
                <BookOpen className="h-4 w-4 text-white/70" />
                {formatGradeLabel(user.grade)}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
                🔥 {user.current_streak || 0} Günlük Seri
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full sm:max-w-md rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-md"
        >
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">
            Sıradaki Adım
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{continueState.title}</h2>
          <p className="text-sm text-white/70 mb-5 leading-relaxed">
            {continueState.description}
          </p>
          <button
            type="button"
            onClick={continueState.onAction}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-5 py-3 text-sm font-bold transition-all hover:bg-slate-100 hover:scale-[1.02]"
          >
            {continueState.actionLabel}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
