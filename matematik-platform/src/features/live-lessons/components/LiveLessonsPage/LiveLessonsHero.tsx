import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  HelpCircle,
  Layers,
  Plus,
  Radio,
  Video,
  Zap,
} from 'lucide-react';
import type { AuthSnapshot } from '@/lib/auth-snapshot';
import { isGraduateGrade } from '@/lib/grade';
import type { LiveLesson } from '@/features/live-lessons/types';

interface LiveLessonsHeroProps {
  user: AuthSnapshot;
  upcomingLessonsCount: number;
  totalHoursFormatted: string;
  activeLesson: LiveLesson | null;
  quickStarting: boolean;
  isPlanFormOpen: boolean;
  onTogglePlanForm: () => void;
  onQuickLaunch: () => void;
  onOpenSubmitQuestion: () => void;
  onOpenReplayArchive: () => void;
  onOpenTeacherPool: () => void;
}

export function LiveLessonsHero({
  user,
  upcomingLessonsCount,
  totalHoursFormatted,
  activeLesson,
  quickStarting,
  isPlanFormOpen,
  onTogglePlanForm,
  onQuickLaunch,
  onOpenSubmitQuestion,
  onOpenReplayArchive,
  onOpenTeacherPool,
}: LiveLessonsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-ink dark:text-brand-primary-light">
            <Video className="h-3.5 w-3.5" />
            <span>Uğur Hoca Canlı Matematik Sınıfı</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Canlı Dersler
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-foreground/70 sm:text-base">
            İnteraktif ekran paylaşımı, soru çözümleri, anlık quiz ve birebir
            rehberlikle matematik derslerini kaçırma.
          </p>
        </div>

        {/* Hızlı Aksiyon Butonları */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenSubmitQuestion}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
            title="Yapamadığın soruyu gönder, canlı derste tahtada çözelim"
          >
            <HelpCircle className="h-4 w-4" />
            <span>🙋 Derse Soru Gönder</span>
          </button>

          <button
            type="button"
            onClick={onOpenReplayArchive}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2.5 text-xs sm:text-sm font-bold text-rose-300 hover:bg-rose-500/25 transition-all active:scale-95 shadow-sm"
            title="Geçmiş canlı derslerin video kayıtları ve tahta notları"
          >
            <Video className="h-4 w-4" />
            <span>📹 Ders Kayıtları</span>
          </button>

          {user.isAdmin && (
            <>
              <button
                type="button"
                onClick={onOpenTeacherPool}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-4 py-2.5 text-xs sm:text-sm font-bold text-indigo-300 hover:bg-indigo-500/25 transition-all active:scale-95"
              >
                <Layers className="h-4 w-4" />
                <span>Soru Masası</span>
              </button>

              <button
                type="button"
                onClick={onQuickLaunch}
                disabled={quickStarting}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>
                  {quickStarting ? 'Başlatılıyor...' : 'Hızlı Ders Başlat'}
                </span>
              </button>

              <button
                type="button"
                onClick={onTogglePlanForm}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-brand-primary/25 transition-all duration-200 active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
              >
                <Plus className="h-4 w-4" />
                <span>Ders Planla</span>
                {isPlanFormOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* İstatistik Şeridi */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-border/80 pt-6">
        {/* 1. Canlı Durumu */}
        <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60">
            <Radio
              className={`h-4 w-4 ${activeLesson ? 'text-rose-500 animate-pulse' : 'text-foreground/40'}`}
            />
            <span>Canlı Durumu</span>
          </div>
          <p className="mt-2 text-lg font-black tracking-tight text-foreground sm:text-xl">
            {activeLesson ? (
              <span className="text-rose-600 dark:text-rose-400">
                Şu An Canlıda!
              </span>
            ) : (
              'Beklemede'
            )}
          </p>
          {activeLesson && (
            <Link
              href={`/canli-ders/d/${activeLesson.room_id}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline"
            >
              <span>Derse Gir</span> &rarr;
            </Link>
          )}
        </div>

        {/* 2. Planlanan Ders Sayısı */}
        <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60">
            <Calendar className="h-4 w-4 text-brand-ink" />
            <span>Yaklaşan Ders</span>
          </div>
          <p className="mt-2 text-xl font-black text-foreground sm:text-2xl">
            {upcomingLessonsCount}
          </p>
          <span className="text-[11px] text-foreground/50">
            Planlanmış oturum
          </span>
        </div>

        {/* 3. Toplam Süre */}
        <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60">
            <Clock className="h-4 w-4 text-accent-success-ink" />
            <span>Toplam Süre</span>
          </div>
          <p className="mt-2 text-xl font-black text-foreground sm:text-2xl">
            {totalHoursFormatted}
          </p>
          <span className="text-[11px] text-foreground/50">
            Yaklaşan ders toplamı
          </span>
        </div>

        {/* 4. Öğrenci Seviyesi */}
        <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60">
            <GraduationCap className="h-4 w-4 text-violet-500" />
            <span>Sınıf / Rol</span>
          </div>
          <p className="mt-2 text-lg font-black text-foreground sm:text-xl truncate">
            {user.isAdmin
              ? 'Öğretmen'
              : isGraduateGrade(user.grade)
                ? 'Mezun'
                : user.grade
                  ? `${user.grade}. Sınıf`
                  : 'Öğrenci'}
          </p>
          <span className="text-[11px] text-foreground/50">{user.name}</span>
        </div>
      </div>
    </section>
  );
}
