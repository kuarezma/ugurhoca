'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Target, Sparkles, ArrowRight, Flame } from 'lucide-react';
import { featuredExams } from '@/lib/examDates';

type ExamCountdownCardProps = {
  userGrade?: number | string | null;
  isLight?: boolean;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
};

function getTimeRemaining(targetDate: string): TimeLeft {
  const total = new Date(targetDate).getTime() - Date.now();
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  return { days, hours, minutes };
}

function getMotivationMotto(daysLeft: number, examTitle: string): string {
  if (daysLeft > 120) {
    return `Büyük hedefler sabırlı adımlarla inşa edilir. ${examTitle} yolculuğunda bugün çözdüğün her soru geleceğini şekillendirir!`;
  }
  if (daysLeft > 45) {
    return `Tempo artıyor! Düzenli tekrar ve deneme analizleriyle eksik kazanımlarını hızla kapatıyorsun.`;
  }
  return `Son düzlük! Sakin kal, stratejine güven ve soru çözme rutinini kararlılıkla sürdür.`;
}

export function ExamCountdownCard({
  userGrade,
  isLight = false,
}: ExamCountdownCardProps) {
  const defaultExamId = useMemo(() => {
    const gradeNum = Number(userGrade);
    if (gradeNum === 8) return 'lgs-2026';
    if (gradeNum >= 10) return 'yks-2026';
    return 'lgs-2026';
  }, [userGrade]);

  const [selectedExamId, setSelectedExamId] = useState<string>(defaultExamId);
  const currentExam = useMemo(
    () => featuredExams.find((e) => e.id === selectedExamId) || featuredExams[0],
    [selectedExamId],
  );

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeRemaining(currentExam.targetDate),
  );

  useEffect(() => {
    setTimeLeft(getTimeRemaining(currentExam.targetDate));
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(currentExam.targetDate));
    }, 60000);
    return () => clearInterval(timer);
  }, [currentExam]);

  const motto = useMemo(
    () => getMotivationMotto(timeLeft.days, currentExam.title.replace("'ye Kalan Süre", "")),
    [timeLeft.days, currentExam],
  );

  const targetNet = useMemo(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`ugurhoca_exam_target_${currentExam.id}`);
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    return currentExam.id.includes('lgs') ? 18 : 32;
  }, [currentExam.id]);

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 transition-all shadow-xl backdrop-blur-xl relative overflow-hidden ${
        isLight
          ? 'border-indigo-100 bg-white/90 text-slate-900 shadow-indigo-950/5'
          : 'border-white/10 bg-slate-900/80 text-white shadow-indigo-950/30'
      }`}
    >
      {/* Background Subtle Gradient Glow */}
      <div
        className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/20">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold">
                {currentExam.title}
              </h3>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                {currentExam.provider}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentExam.dateLabel}
            </p>
          </div>
        </div>

        {/* Exam Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 self-start sm:self-center">
          {featuredExams.map((exam) => (
            <button
              key={exam.id}
              type="button"
              onClick={() => setSelectedExamId(exam.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedExamId === exam.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {exam.id.includes('lgs') ? 'LGS' : 'YKS'}
            </button>
          ))}
        </div>
      </div>

      {/* Countdown Digits */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
            {timeLeft.days}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Gün
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
            {timeLeft.hours}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Saat
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
            {timeLeft.minutes}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Dakika
          </div>
        </div>
      </div>

      {/* Motivational Motto & Target Net Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
        <div className="flex items-start gap-2 max-w-lg">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 italic leading-relaxed">
            {motto}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
            <Target className="w-3.5 h-3.5" />
            Hedef: {targetNet} Net
          </span>
          {currentExam.toolHref && (
            <Link
              href={currentExam.toolHref}
              className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-1 text-xs font-semibold text-white transition-colors"
            >
              <span>Program</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
