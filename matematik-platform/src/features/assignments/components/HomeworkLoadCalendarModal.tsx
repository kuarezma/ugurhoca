'use client';

import { useState, useId, useMemo } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import type { Assignment, Submission } from '@/types';

type HomeworkLoadCalendarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  assignments: Assignment[];
  submissions: Record<string, Submission>;
  onSelectAssignment?: (assignment: Assignment) => void;
};

export type DayLoad = {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  dayName: string;
  totalEstimatedMinutes: number;
  assignments: Assignment[];
  hasConflict: boolean; // > 90 minutes or > 2 assignments
  isPast: boolean;
  isToday: boolean;
};

export function calculateEstimatedMinutes(assignment: Assignment): number {
  // Description içinde "X soru" veya "X dk" tespiti ya da 30-45 dk akıllı tahmin
  const desc = assignment.description?.toLowerCase() || '';
  const matchMin = desc.match(/(\d+)\s*(dakika|dk|min)/);
  if (matchMin) return parseInt(matchMin[1], 10);

  const matchQuestions = desc.match(/(\d+)\s*(soru)/);
  if (matchQuestions) return Math.round(parseInt(matchQuestions[1], 10) * 2.5);

  return 35; // Varsayılan ders ödevi süresi
}

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function HomeworkLoadCalendarModal({
  isOpen,
  onClose,
  assignments,
  submissions,
  onSelectAssignment,
}: HomeworkLoadCalendarModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Önümüzdeki 14 günlük yük projeksiyonu
  const daysForecast = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list: DayLoad[] = [];
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = toLocalDateString(d);

      // Bu tarihe denk gelen teslimler
      const dayAssignments = assignments.filter((a) => {
        if (!a.due_date) return false;
        return a.due_date.startsWith(dateStr);
      });

      const totalMinutes = dayAssignments.reduce(
        (sum, a) => sum + calculateEstimatedMinutes(a),
        0
      );

      list.push({
        dateStr,
        dayNumber: d.getDate(),
        dayName: dayNames[d.getDay()],
        totalEstimatedMinutes: totalMinutes,
        assignments: dayAssignments,
        hasConflict: totalMinutes > 90 || dayAssignments.length >= 3,
        isPast: false,
        isToday: i === 0,
      });
    }

    return list;
  }, [assignments]);

  const activeDay = useMemo(() => {
    if (!selectedDate) return daysForecast[0];
    return daysForecast.find((d) => d.dateStr === selectedDate) || daysForecast[0];
  }, [selectedDate, daysForecast]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={modalRef}
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl border border-white/10 bg-slate-900 text-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-base font-bold tracking-tight text-white">
                  Ödev Yükü Takvimi & Çakışma Radarı
                </h2>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Denge & Planlama
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Günlük çalışma sürenizi dengeleyin, teslim tarihlerinin aynı güne yığılmasını önleyin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 14 Günlük Yük Şeridi (Radar) */}
        <div className="p-4 border-b border-white/10 bg-slate-950/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Önümüzdeki 14 Günün Ödev Yoğunluğu</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Rahat (&lt;45 dk)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Dengeli (45-90 dk)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Yoğun / Çakışma (&gt;90 dk)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-1">
            {daysForecast.map((day) => {
              const isSelected = activeDay?.dateStr === day.dateStr;
              let barColor = 'bg-slate-800 text-slate-400 border-white/5';
              let indicatorColor = 'bg-slate-600';

              if (day.totalEstimatedMinutes > 90) {
                barColor = 'bg-rose-500/20 text-rose-200 border-rose-500/40';
                indicatorColor = 'bg-rose-500';
              } else if (day.totalEstimatedMinutes > 45) {
                barColor = 'bg-amber-500/20 text-amber-200 border-amber-500/40';
                indicatorColor = 'bg-amber-500';
              } else if (day.totalEstimatedMinutes > 0) {
                barColor = 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40';
                indicatorColor = 'bg-emerald-500';
              }

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`flex flex-col items-center justify-between p-2 rounded-xl border text-center transition ${barColor} ${
                    isSelected ? 'ring-2 ring-indigo-400 scale-105 shadow-md' : 'hover:opacity-90'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{day.dayName}</span>
                  <span className="text-xs sm:text-sm font-extrabold my-0.5">{day.dayNumber}</span>
                  <div className="w-full flex justify-center items-center gap-0.5 mt-1">
                    {day.assignments.length > 0 ? (
                      <span className={`w-1.5 h-1.5 rounded-full ${indicatorColor}`} />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seçilen Günün Detayları */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{activeDay?.dateStr}</span>
                {activeDay?.isToday && (
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                    Bugün
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Toplam Tahmini Süre: <strong className="text-white">{activeDay?.totalEstimatedMinutes} dakika</strong> • {activeDay?.assignments.length} Ödev
              </p>
            </div>

            {activeDay?.hasConflict && (
              <div className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Yüksek Yük Uyarısı: Ödevleri günlere bölerek çalışın.</span>
              </div>
            )}
          </div>

          {activeDay?.assignments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-white/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-300">Bu gün için planlanmış teslim yok</p>
              <p className="text-xs text-slate-500 mt-1">
                Dinlenmek, konu tekrarı yapmak veya geçmiş eksikleri kapatmak için harika bir fırsat!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeDay?.assignments.map((assignment) => {
                const isSubmitted = Boolean(submissions[assignment.id]);
                const estMin = calculateEstimatedMinutes(assignment);

                return (
                  <div
                    key={assignment.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                          {assignment.grade}. Sınıf
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white">{assignment.title}</h4>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">{assignment.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Tahmini Süre: ~{estMin} dk
                        </span>
                        {isSubmitted ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Teslim Edildi
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-300 font-semibold">
                            <Flame className="w-3.5 h-3.5 text-amber-400" /> Teslim Bekleniyor
                          </span>
                        )}
                      </div>
                    </div>

                    {onSelectAssignment && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectAssignment(assignment);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-sm shrink-0"
                      >
                        Ödevi Aç
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeworkLoadCalendarModal;
