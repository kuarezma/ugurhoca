import 'server-only';

import { formatIstanbulDate } from '@/lib/date-format';
import type { CurriculumCardInput } from '@/features/home/components/HomeWeeklyCurriculumSection';
import curriculumRows from './weeklyCurriculumData.json';

type RawCurriculumEntry = {
  grade: number;
  weekStart: string;
  weekEnd: string;
  topic: string;
  outcomeCode: string;
  outcomeSummary: string;
  unit: string;
};

const entries = curriculumRows as RawCurriculumEntry[];

function toIstanbulIsoDate(now: Date): string {
  const formatted = formatIstanbulDate(now, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatted.split('.');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return '2026-11-10';
}

export function resolveWeeklyCurriculumForDate(now: Date = new Date()): {
  weekLabel: string | null;
  items: CurriculumCardInput[];
} {
  const isoDate = toIstanbulIsoDate(now);
  const grades: Array<5 | 6 | 7 | 8> = [5, 6, 7, 8];
  const resolved: CurriculumCardInput[] = [];
  let matchedRange: { weekStart: string; weekEnd: string } | null = null;

  for (const grade of grades) {
    const gradeEntries = entries
      .filter((item) => item.grade === grade)
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart));

    if (gradeEntries.length === 0) continue;

    // 1) İçinde bulunulan hafta (Pazartesi–Pazar aralığı için weekEnd + 2 gün tolerans)
    let chosen = gradeEntries.find(
      (item) => isoDate >= item.weekStart && isoDate <= item.weekEnd,
    );

    // Hafta sonu veya ara tatildeysek sıradaki ilk haftayı, dönem sonrasındaysak son haftayı seç
    if (!chosen) {
      chosen =
        gradeEntries.find((item) => item.weekStart >= isoDate) ??
        gradeEntries[gradeEntries.length - 1];
    }

    if (chosen) {
      if (!matchedRange) {
        matchedRange = {
          weekStart: chosen.weekStart,
          weekEnd: chosen.weekEnd,
        };
      }
      resolved.push({
        grade,
        unit: chosen.unit,
        topic: chosen.topic,
        outcomeCode: chosen.outcomeCode,
        outcomeSummary: chosen.outcomeSummary,
      });
    }
  }

  let weekLabel: string | null = null;
  if (matchedRange) {
    const startText = formatIstanbulDate(
      `${matchedRange.weekStart}T12:00:00Z`,
      {
        day: 'numeric',
        month: 'long',
      },
    );
    const endText = formatIstanbulDate(`${matchedRange.weekEnd}T12:00:00Z`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    weekLabel = `${startText} – ${endText}`;
  }

  return { weekLabel, items: resolved };
}
