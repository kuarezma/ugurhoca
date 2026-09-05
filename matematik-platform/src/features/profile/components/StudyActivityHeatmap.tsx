'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Flame,
  TrendingUp,
  Award,
} from 'lucide-react';
import { getDailyGoal, type DailyGoalData } from '@/lib/dailyGoalStorage';

export type StudyActivityHeatmapProps = {
  history?: Record<string, number>;
  dailyTarget?: number;
  isLight?: boolean;
};

type DayCell = {
  dateStr: string;
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  dayOfWeek: number; // 0: Pazartesi, ..., 6: Pazar
  monthIndex: number;
  isToday: boolean;
};

const MONTH_NAMES_TR = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
];

function formatTrDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  });
}

export function calculateHeatmapLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count <= 9) return 1;
  if (count <= 19) return 2;
  if (count <= 34) return 3;
  return 4;
}

export default function StudyActivityHeatmap({
  history: propHistory,
  dailyTarget: propTarget,
  isLight = false,
}: StudyActivityHeatmapProps) {
  const [data, setData] = useState<DailyGoalData | null>(null);
  const [hoveredDay, setHoveredDay] = useState<DayCell | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayCell | null>(null);

  const loadData = useCallback(() => {
    setData(getDailyGoal());
  }, []);

  useEffect(() => {
    loadData();
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<DailyGoalData>;
      if (custom.detail) {
        setData(custom.detail);
      } else {
        loadData();
      }
    };
    window.addEventListener('ugurhoca:daily-goal-updated', handleUpdate);
    return () => window.removeEventListener('ugurhoca:daily-goal-updated', handleUpdate);
  }, [loadData]);

  const history = useMemo(
    () => propHistory ?? data?.history ?? {},
    [propHistory, data?.history]
  );
  const target = propTarget ?? data?.target ?? 20;

  // 52 haftalık (364 gün + günümüz) matris hesaplama
  const { weeks, monthLabels, stats } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Bugünün haftanın kaçıncı günü olduğu (0: Pazartesi ... 6: Pazar)
    const todayDayOfWeek = (today.getDay() + 6) % 7;

    // Tam 52 hafta geriye git: 52 * 7 = 364 gün
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364 - todayDayOfWeek);

    const generatedWeeks: DayCell[][] = [];
    let currentWeek: DayCell[] = [];

    const monthHeaderPositions: { month: string; weekIndex: number }[] = [];
    let lastMonthSeen = -1;

    let totalSolved = 0;
    let activeDaysCount = 0;
    let maxSingleDay = { count: 0, dateStr: '' };

    const iter = new Date(startDate);
    let weekIndex = 0;

    while (iter <= today) {
      const y = iter.getFullYear();
      const m = String(iter.getMonth() + 1).padStart(2, '0');
      const d = String(iter.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const count = history[dateStr] || 0;
      const level = calculateHeatmapLevel(count);
      const dayOfWeek = (iter.getDay() + 6) % 7;
      const monthIndex = iter.getMonth();

      if (count > 0) {
        totalSolved += count;
        activeDaysCount++;
        if (count > maxSingleDay.count) {
          maxSingleDay = { count, dateStr };
        }
      }

      // Yeni ay başlangıcı ve sütun tespiti
      if (monthIndex !== lastMonthSeen && iter.getDate() <= 7) {
        monthHeaderPositions.push({
          month: MONTH_NAMES_TR[monthIndex],
          weekIndex,
        });
        lastMonthSeen = monthIndex;
      }

      const cell: DayCell = {
        dateStr,
        date: new Date(iter),
        count,
        level,
        dayOfWeek,
        monthIndex,
        isToday: iter.getTime() === today.getTime(),
      };

      currentWeek.push(cell);

      if (dayOfWeek === 6) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      iter.setDate(iter.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    return {
      weeks: generatedWeeks,
      monthLabels: monthHeaderPositions,
      stats: {
        totalSolved,
        activeDaysCount,
        maxSingleDay,
      },
    };
  }, [history]);

  const activeDayForInfo = hoveredDay || selectedDay;

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 transition-all ${
        isLight
          ? 'border-slate-200 bg-white text-slate-900 shadow-lg'
          : 'border-white/10 bg-slate-900/80 text-white shadow-xl backdrop-blur-xl'
      }`}
    >
      {/* Başlık ve Özet Sayaçlar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-slate-200/60 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
              <span>Yıllık Soru Çözüm Isı Haritası</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                365 Gün
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Düzenli pratik ve çalışma sürekliliğinin yıl boyunca kümülatif dağılımı
            </p>
          </div>
        </div>

        {/* 3 İstatistik Rozeti */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 font-semibold">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">Toplam:</span>
            <strong className="text-emerald-500 dark:text-emerald-400 font-mono">
              {stats.totalSolved} Soru
            </strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 font-semibold">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">Aktif Gün:</span>
            <strong className="text-amber-500 dark:text-amber-400 font-mono">
              {stats.activeDaysCount} Gün
            </strong>
          </div>

          {stats.maxSingleDay.count > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 font-semibold">
              <Award className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-slate-600 dark:text-slate-300">Zirve:</span>
              <strong className="text-purple-400 font-mono">
                {stats.maxSingleDay.count} Soru/Gün
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Isı Haritası Izgara Alanı (Yatay Kaydırılabilir) */}
      <div className="mt-4 overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-block min-w-[720px] select-none">
          {/* Aylar Satırı */}
          <div className="flex text-[10px] text-slate-600 dark:text-slate-300 mb-1 ml-7 font-medium h-4 relative">
            {monthLabels.map((lbl, idx) => (
              <span
                key={`${lbl.month}-${idx}`}
                style={{
                  position: 'absolute',
                  left: `${lbl.weekIndex * 13}px`,
                }}
              >
                {lbl.month}
              </span>
            ))}
          </div>

          {/* Günler + 7x52 Hücre Matrisi */}
          <div className="flex items-start gap-1">
            {/* Gün İsimleri (Pzt, Çar, Cum) */}
            <div className="flex flex-col gap-[3px] text-[9px] text-slate-600 dark:text-slate-300 w-6 shrink-0 font-medium pt-0.5">
              <span className="h-[10px] leading-[10px]">Pzt</span>
              <span className="h-[10px] leading-[10px]"></span>
              <span className="h-[10px] leading-[10px]">Çar</span>
              <span className="h-[10px] leading-[10px]"></span>
              <span className="h-[10px] leading-[10px]">Cum</span>
              <span className="h-[10px] leading-[10px]"></span>
              <span className="h-[10px] leading-[10px]">Paz</span>
            </div>

            {/* Hafta Sütunları */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="flex flex-col gap-[3px]">
                  {week.map((cell) => {
                    const isSelected = activeDayForInfo?.dateStr === cell.dateStr;

                    // Renk seviyeleri (5 kademe)
                    let bgClass = '';
                    if (cell.level === 0) {
                      bgClass = isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200/80'
                        : 'bg-white/5 hover:bg-white/15 border-white/5';
                    } else if (cell.level === 1) {
                      bgClass = isLight
                        ? 'bg-emerald-200 border-emerald-300 hover:bg-emerald-300'
                        : 'bg-emerald-900/60 border-emerald-700/60 hover:bg-emerald-800';
                    } else if (cell.level === 2) {
                      bgClass = isLight
                        ? 'bg-emerald-400 border-emerald-500 hover:bg-emerald-500 text-white'
                        : 'bg-emerald-700 border-emerald-500 hover:bg-emerald-600';
                    } else if (cell.level === 3) {
                      bgClass = isLight
                        ? 'bg-emerald-600 border-emerald-700 hover:bg-emerald-700 text-white'
                        : 'bg-emerald-500 border-emerald-400 hover:bg-emerald-400 shadow-sm shadow-emerald-500/20';
                    } else {
                      bgClass = isLight
                        ? 'bg-teal-600 border-teal-700 hover:bg-teal-700 text-white shadow-sm'
                        : 'bg-teal-400 border-teal-300 hover:bg-teal-300 shadow-sm shadow-teal-400/40';
                    }

                    return (
                      <button
                        key={cell.dateStr}
                        type="button"
                        onClick={() => setSelectedDay(cell)}
                        onMouseEnter={() => setHoveredDay(cell)}
                        onMouseLeave={() => setHoveredDay(null)}
                        aria-label={`${cell.dateStr}: ${cell.count} soru`}
                        className={`h-[10px] w-[10px] rounded-[2.5px] border transition-all ${bgClass} ${
                          cell.isToday
                            ? 'ring-1.5 ring-amber-400 ring-offset-1 ring-offset-slate-900'
                            : ''
                        } ${
                          isSelected
                            ? 'scale-125 ring-2 ring-white ring-offset-1 z-10'
                            : ''
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alt Bilgi: Lejant & Seçili Gün Detayı */}
      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        {/* Seçili/Hover Gün Durumu */}
        <div className="flex items-center gap-2 min-h-[22px]">
          {activeDayForInfo ? (
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <span className="font-semibold text-emerald-500 dark:text-emerald-400">
                {formatTrDate(activeDayForInfo.date)}:
              </span>
              <span className="font-bold">
                {activeDayForInfo.count > 0 ? (
                  <>
                    {activeDayForInfo.count} soru çözüldü
                    {activeDayForInfo.count >= target ? ' 🎯 (Hedef Tamamlandı)' : ''}
                  </>
                ) : (
                  'Bu gün soru çözümü kaydedilmedi'
                )}
              </span>
            </div>
          ) : (
            <span className="text-slate-600 dark:text-slate-300 italic">
              Detayları görmek için gün kutularının üzerine gelin veya dokunun
            </span>
          )}
        </div>

        {/* 5 Kademeli Renk Lejantı */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
          <span>Daha Az</span>
          <span className="h-[10px] w-[10px] rounded-[2px] bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10" title="0 Soru" />
          <span className="h-[10px] w-[10px] rounded-[2px] bg-emerald-200 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/60" title="1-9 Soru" />
          <span className="h-[10px] w-[10px] rounded-[2px] bg-emerald-400 dark:bg-emerald-700 border border-emerald-500" title="10-19 Soru" />
          <span className="h-[10px] w-[10px] rounded-[2px] bg-emerald-600 dark:bg-emerald-500 border border-emerald-400" title="20-34 Soru" />
          <span className="h-[10px] w-[10px] rounded-[2px] bg-teal-600 dark:bg-teal-400 border border-teal-300" title="35+ Soru" />
          <span>Daha Çok</span>
        </div>
      </div>
    </div>
  );
}
