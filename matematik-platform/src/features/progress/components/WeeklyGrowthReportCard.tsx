'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Target,
  FileCheck2,
} from 'lucide-react';
import type { StudyGoal, StudySession } from '@/features/progress/types';

interface WeeklyGrowthReportCardProps {
  goal: StudyGoal | null;
  sessions: StudySession[];
  streak: number;
  solvedQuestionsCount?: number;
  liveLessonsCount?: number;
  studentName?: string;
}

export const WeeklyGrowthReportCard: React.FC<WeeklyGrowthReportCardProps> = ({
  goal,
  sessions,
  streak,
  solvedQuestionsCount = 0,
  liveLessonsCount = 0,
  studentName = 'Öğrenci',
}) => {
  // Bu haftanın başlangıcı (Pazartesi)
  const weekStats = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const weekSessions = sessions.filter(
      (s) => new Date(s.date).getTime() >= monday.getTime(),
    );

    const totalMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    const targetMinutes = goal?.target_duration || 180;
    const progressPercent = Math.min(100, Math.round((totalMinutes / targetMinutes) * 100));

    return {
      totalMinutes,
      targetMinutes,
      progressPercent,
      sessionCount: weekSessions.length,
    };
  }, [sessions, goal]);

  // Kişiselleştirilmiş gelişim mesajı
  const motivationalMessage = useMemo(() => {
    if (weekStats.progressPercent >= 100) {
      return 'Tebrikler! Bu haftaki çalışma hedefini eksiksiz tamamladın. Harika bir tempodasın!';
    }
    if (weekStats.progressPercent >= 60) {
      return 'Harika ilerliyorsun! Haftalık hedefini tamamlamak için son bir gayret gerekiyor.';
    }
    if (streak >= 3) {
      return `${streak} günlük kesintisiz çalışma serin devam ediyor. Düzenli çalışma başarının anahtarıdır!`;
    }
    return 'Haftalık hedefine ulaşmak ve konuları pekiştirmek için bugün 20 dakika pratik yapabilirsin.';
  }, [weekStats.progressPercent, streak]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-indigo-950/40 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
      {/* Decorative Glows */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Haftalık Gelişim Karnesi
            </span>
            {streak > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {streak} Gün Seri
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Harika Gidiyorsun, {studentName}! 🚀
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-300/90 max-w-lg leading-relaxed">
            {motivationalMessage}
          </p>
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/testler"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Test Çöz</span>
          </Link>
          <Link
            href="/odevler"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
          >
            <span>Ödevlerim</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Weekly Study Minutes */}
        <div className="rounded-2xl border border-white/5 bg-slate-800/40 p-4 transition-colors hover:border-violet-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Çalışma Süresi</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {weekStats.totalMinutes} <span className="text-xs text-slate-400 font-normal">dk</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${weekStats.progressPercent}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex justify-between">
            <span>Hedef: {weekStats.targetMinutes} dk</span>
            <span className="font-bold text-violet-300">%{weekStats.progressPercent}</span>
          </div>
        </div>

        {/* Questions Solved */}
        <div className="rounded-2xl border border-white/5 bg-slate-800/40 p-4 transition-colors hover:border-cyan-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Çözülen Soru</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300">
            {solvedQuestionsCount}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Bu hafta çözülen test soruları
          </p>
        </div>

        {/* Live Lessons Attended */}
        <div className="rounded-2xl border border-white/5 bg-slate-800/40 p-4 transition-colors hover:border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Canlı Dersler</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {liveLessonsCount} <span className="text-xs text-slate-400 font-normal">oturum</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Katılınan canlı ders sayısı
          </p>
        </div>

        {/* Study Habit / Score */}
        <div className="rounded-2xl border border-white/5 bg-slate-800/40 p-4 transition-colors hover:border-emerald-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Gelişim Skoru</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300">
            {Math.round(weekStats.progressPercent * 0.7 + Math.min(30, streak * 5))} <span className="text-xs text-slate-400 font-normal">XP</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Haftalık düzenli çalışma puanı
          </p>
        </div>
      </div>
    </div>
  );
};
