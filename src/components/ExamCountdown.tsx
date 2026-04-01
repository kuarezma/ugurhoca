'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, Clock3 } from 'lucide-react';
import type { FeaturedExam } from '@/lib/examDates';

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
  return value.toString().padStart(2, '0');
}

export function ExamCountdown({ exam, isLight }: ExamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(exam.targetDate));

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft(exam.targetDate));

    update();
    const interval = window.setInterval(update, 60000);

    return () => window.clearInterval(interval);
  }, [exam.targetDate]);

  const status = useMemo(() => {
    if (timeLeft.total <= 0) {
      return 'Sinav gerceklesti';
    }

    if (timeLeft.days === 0) {
      return 'Bugun';
    }

    return 'Hazirlik zamani';
  }, [timeLeft]);

  return (
    <div
      className={[
        'relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all',
        isLight
          ? 'light-card shadow-[0_18px_42px_rgba(99,102,241,0.16)]'
          : 'glass border-white/10',
      ].join(' ')}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${exam.accent}`} />

      <div className="relative flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${isLight ? 'light-pill' : 'bg-white/10 text-slate-200 border border-white/10'}`}>
              <Clock3 className="w-3.5 h-3.5" />
              {exam.provider}
            </span>
          </div>
          <h3 className={`text-base sm:text-lg font-bold ${isLight ? 'light-text-strong' : 'text-white'}`}>{exam.title}</h3>
          <p className={`mt-1 text-sm ${isLight ? 'light-text-muted' : 'text-slate-400'}`}>{status}</p>
        </div>

        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${exam.accent} shadow-lg`}>
          <Clock className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { label: 'Gun', value: formatUnit(timeLeft.days) },
          { label: 'Saat', value: formatUnit(timeLeft.hours) },
          { label: 'Dakika', value: formatUnit(timeLeft.minutes) },
        ].map((item) => (
          <div
            key={item.label}
            className={[
              'rounded-2xl border px-2.5 py-3 text-center',
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-white/5 border-white/10',
            ].join(' ')}
          >
            <div className={`text-xl sm:text-2xl font-black leading-none ${isLight ? 'text-slate-950' : 'text-white'}`}>{item.value}</div>
            <div className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className={['rounded-2xl border p-3.5', isLight ? 'light-soft-panel' : 'bg-white/5 border-white/10'].join(' ')}>
        <div className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Sinav Tarihi</div>
        <div className={`mt-1 text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{exam.dateLabel}</div>

        {exam.subItems?.length ? (
          <div className="mt-3 space-y-2">
            {exam.subItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className={isLight ? 'text-slate-900 font-semibold' : 'text-white font-semibold'}>{item.label}</span>
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{item.dateLabel}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
