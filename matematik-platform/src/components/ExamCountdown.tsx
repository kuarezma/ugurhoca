"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, Clock3 } from "lucide-react";
import type { FeaturedExam } from "@/lib/examDates";

type ExamCountdownProps = {
  exam: FeaturedExam;
  isLight: boolean;
  onOpenCalculator?: (examType: 'lgs' | 'yks') => void;
};

type TimeLeft = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
};

function getTimeLeft(targetDate: string): TimeLeft {
  const total = new Date(targetDate).getTime() - Date.now();

  if (total <= 0) {
    return { total, days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);

  return { total, days, hours, minutes };
}

function formatUnit(value: number) {
  return value.toString().padStart(2, "0");
}

export function ExamCountdown({
  exam,
  isLight,
  onOpenCalculator,
}: ExamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft(exam.targetDate));

    update();
    const interval = window.setInterval(update, 60000);

    return () => window.clearInterval(interval);
  }, [exam.targetDate]);

  const status = useMemo(() => {
    if (!timeLeft) {
      return "Hazırlık zamanı";
    }

    if (timeLeft.total <= 0) {
      return "Sınav gerçekleşti";
    }

    if (timeLeft.days === 0) {
      return "Bugün!";
    }

    return "Hazırlık zamanı";
  }, [timeLeft]);

  const countdownItems = timeLeft
    ? [
        { label: "Gün", value: formatUnit(timeLeft.days) },
        { label: "Saat", value: formatUnit(timeLeft.hours) },
        { label: "Dakika", value: formatUnit(timeLeft.minutes) },
      ]
    : [
        { label: "Gün", value: "--" },
        { label: "Saat", value: "--" },
        { label: "Dakika", value: "--" },
      ];

  return (
    <div
      className={[
        "exam-countdown relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all duration-300",
        isLight
          ? "border-slate-200/90 bg-white/95 shadow-bento hover:shadow-bento-hover hover:border-indigo-300/60"
          : "border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-xl hover:border-white/20 hover:shadow-2xl",
      ].join(" ")}
    >
      {/* Üst İnce Gradyan Aksan Çizgisi */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${exam.accent}`}
      />

      {/* Başlık ve Durum Alanı */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                isLight
                  ? "bg-slate-100 text-slate-700 border border-slate-200/80"
                  : "bg-white/10 text-white border border-white/15"
              }`}
            >
              <Clock3 className="w-3 h-3" />
              {exam.provider}
            </span>
            <span
              className={`inline-flex items-center rounded-full bg-gradient-to-r ${exam.accent} px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm`}
            >
              {status}
            </span>
          </div>
          <h3
            className={`truncate font-display text-base sm:text-lg font-bold ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            {exam.title}
          </h3>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${exam.accent} shadow-md`}
        >
          <Clock className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Geri Sayım Sayı Kutuları (Bento tarzı 3'lü kolon) */}
      <div className="relative mt-4 grid grid-cols-3 gap-2.5">
        {countdownItems.map((item) => (
          <div
            key={item.label}
            className={[
              "rounded-2xl border p-2.5 sm:p-3 text-center transition-transform hover:-translate-y-0.5",
              isLight
                ? "border-slate-200/80 bg-slate-50/80 shadow-sm"
                : "border-white/10 bg-white/5 backdrop-blur-sm",
            ].join(" ")}
          >
            <div
              className={`font-display text-2xl sm:text-3xl font-extrabold tabular-nums leading-none ${
                isLight
                  ? "text-slate-900"
                  : "bg-gradient-to-br from-white via-slate-100 to-slate-300 bg-clip-text text-transparent"
              }`}
            >
              {item.value}
            </div>
            <div
              className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Alt Bilgi & Takvim Kutusu */}
      <div
        className={[
          "relative mt-3.5 rounded-2xl border p-3",
          isLight
            ? "border-slate-200/70 bg-indigo-50/40 text-slate-700"
            : "border-white/10 bg-white/5 text-slate-200 backdrop-blur-sm",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isLight ? "text-indigo-600" : "text-indigo-300"
              }`}
            >
              Sınav Tarihi
            </div>
            <div className="mt-0.5 truncate text-xs sm:text-sm font-semibold">
              {exam.dateLabel}
            </div>
          </div>

          {exam.toolHref ? (
            onOpenCalculator ? (
              <button
                type="button"
                onClick={() => onOpenCalculator(exam.id.includes('lgs') ? 'lgs' : 'yks')}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isLight
                    ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                    : "bg-white/15 text-white hover:bg-white/25 border border-white/10"
                }`}
              >
                Net & Puan Hesapla →
              </button>
            ) : (
              <Link
                href={exam.toolHref}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isLight
                    ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                    : "bg-white/15 text-white hover:bg-white/25 border border-white/10"
                }`}
              >
                Puan Hesapla →
              </Link>
            )
          ) : null}
        </div>

        {exam.subItems?.length ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-slate-200/50 dark:border-white/10 pt-2">
            {exam.subItems.map((item) => (
              <div
                key={item.label}
                className={[
                  "rounded-lg px-2 py-0.5 text-[10px] font-semibold",
                  isLight
                    ? "bg-white text-slate-700 shadow-sm border border-slate-200/80"
                    : "bg-white/10 text-slate-300 border border-white/10",
                ].join(" ")}
              >
                <span className="font-bold text-indigo-500 dark:text-indigo-400">{item.label}:</span> {item.dateLabel}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
