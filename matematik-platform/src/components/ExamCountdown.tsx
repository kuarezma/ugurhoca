"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, Clock3 } from "lucide-react";
import type { FeaturedExam } from "@/lib/examDates";

type ExamCountdownProps = {
  exam: FeaturedExam;
  isLight: boolean;
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

export function ExamCountdown({ exam, isLight }: ExamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(exam.targetDate),
  );

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft(exam.targetDate));

    update();
    const interval = window.setInterval(update, 60000);

    return () => window.clearInterval(interval);
  }, [exam.targetDate]);

  const status = useMemo(() => {
    if (timeLeft.total <= 0) {
      return "Sınav gerçekleşti";
    }

    if (timeLeft.days === 0) {
      return "Bugün!";
    }

    return "Hazırlık zamanı";
  }, [timeLeft]);

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[26px] border p-3 sm:p-3.5 transition-transform duration-200 hover:-translate-y-0.5",
        isLight
          ? "light-card shadow-[0_14px_30px_rgba(99,102,241,0.14)]"
          : "glass border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-900/92 to-slate-800/90 shadow-[0_20px_48px_rgba(15,23,42,0.42)]",
      ].join(" ")}
    >
      <div
        className={`animate-pulse-soft absolute -top-10 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${exam.accent} blur-3xl`}
        aria-hidden="true"
        style={{
          ['--pulse-duration' as string]: '4.8s',
          ['--pulse-opacity-start' as string]: isLight ? '0.18' : '0.26',
          ['--pulse-opacity-end' as string]: isLight ? '0.26' : '0.36',
        }}
      />
      <div
        className={`animate-drift-xy absolute -bottom-10 -left-8 h-20 w-20 rounded-full bg-gradient-to-br ${exam.accent} blur-3xl`}
        style={{
          ['--drift-duration' as string]: '5.6s',
          ['--drift-opacity-start' as string]: isLight ? '0.14' : '0.22',
          ['--drift-opacity-end' as string]: isLight ? '0.22' : '0.3',
        }}
      />
      {!isLight && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${exam.accent} opacity-[0.1]`}
        />
      )}
      <div
        className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${exam.accent}`}
      />
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`animate-sparkle absolute rounded-full bg-gradient-to-br ${exam.accent} ${index === 0 ? "right-14 top-3 h-1.5 w-1.5" : index === 1 ? "right-8 top-8 h-2 w-2" : "left-4 top-5 h-1.5 w-1.5"}`}
          style={{
            animationDelay: `${index * 0.25}s`,
            ['--sparkle-duration' as string]: `${2.6 + index * 0.35}s`,
          }}
        />
      ))}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${isLight ? "border border-white/70 bg-gradient-to-r from-white to-slate-50 text-slate-700 shadow-sm" : "bg-white/10 text-white border border-white/15 shadow-[0_6px_16px_rgba(15,23,42,0.28)]"}`}
            >
              <Clock3 className="w-3.5 h-3.5" />
              {exam.provider}
            </span>
            <span
              className={`inline-flex items-center rounded-full bg-gradient-to-r ${exam.accent} px-2 py-1 text-[10px] font-bold text-white shadow-sm`}
            >
              {status}
            </span>
          </div>
          <h3
            className={`truncate text-sm sm:text-[15px] font-black ${isLight ? "light-text-strong" : "text-white"}`}
          >
            {exam.title}
          </h3>
        </div>

        <div
          className={`animate-icon-bob flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${exam.accent} shadow-lg`}
          style={{ ['--icon-duration' as string]: '3.8s' }}
        >
          <Clock className="h-4.5 w-4.5 text-white" />
        </div>
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-2">
        {[
          { label: "Gün", value: formatUnit(timeLeft.days) },
          { label: "Saat", value: formatUnit(timeLeft.hours) },
          { label: "Dakika", value: formatUnit(timeLeft.minutes) },
        ].map((item, index) => (
          <div
            key={item.label}
            className={[
              "animate-bob-soft rounded-2xl border px-2 py-2.5 text-center",
              isLight
                ? "border-white/75 bg-gradient-to-br from-white via-slate-50 to-indigo-50/80 shadow-sm"
                : "bg-gradient-to-br from-white/12 via-white/8 to-transparent border-white/10 backdrop-blur-sm",
            ].join(" ")}
            style={{
              animationDelay: `${index * 0.18}s`,
              ['--bob-duration' as string]: '2.8s',
            }}
          >
            <div
              className={`text-lg sm:text-xl font-black leading-none ${isLight ? "bg-gradient-to-br from-slate-950 via-indigo-700 to-fuchsia-600 bg-clip-text text-transparent" : "bg-gradient-to-br from-white via-cyan-200 to-fuchsia-300 bg-clip-text text-transparent"}`}
            >
              {item.value}
            </div>
            <div
              className={`mt-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-slate-300"}`}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div
        className={[
          "relative mt-2.5 rounded-2xl border p-2.5",
          isLight
            ? "border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-pink-50/80 shadow-sm"
            : "bg-gradient-to-r from-white/10 via-white/5 to-transparent border-white/10 backdrop-blur-sm",
        ].join(" ")}
      >
        <div
          className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isLight ? "text-slate-700" : "text-white"}`}
        >
          Sınav Takvimi
        </div>
        <div
          className={`mt-1 text-[11px] sm:text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-300"}`}
        >
          {exam.dateLabel}
        </div>

        {exam.subItems?.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {exam.subItems.map((item) => (
              <div
                key={item.label}
                className={[
                  "rounded-full px-2 py-1 text-[10px] font-semibold",
                  isLight
                    ? "bg-white/80 text-slate-700 shadow-sm ring-1 ring-indigo-100"
                    : "bg-white/10 text-slate-200 ring-1 ring-white/10",
                ].join(" ")}
              >
                {item.label}: {item.dateLabel}
              </div>
            ))}
          </div>
        ) : null}

        {exam.toolHref ? (
          <Link
            href={exam.toolHref}
            className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              isLight
                ? "bg-white text-slate-700 ring-1 ring-indigo-100"
                : "bg-white/15 text-white ring-1 ring-white/10"
            }`}
          >
            Puan Hesapla
          </Link>
        ) : null}
      </div>
    </div>
  );
}
