import type { ReactNode } from 'react';
import type { AdminStudentProfileData } from '@/features/admin/types';
import type { buildAdminStudentProfileSummary } from '@/features/admin/utils/student-profile';
import { formatIstanbulDate } from '@/lib/date-format';

export type AdminStudentProfileSummary = ReturnType<
  typeof buildAdminStudentProfileSummary
>;

export const formatGradeLabel = (grade?: string | number | null) => {
  if (grade === 'Mezun') {
    return 'Mezun';
  }

  return typeof grade === 'number' ? `${grade}. Sınıf` : 'Belirtilmemiş';
};

export const formatShortDate = (dateString?: string | null) => {
  if (!dateString) {
    return 'Bilinmiyor';
  }

  return formatIstanbulDate(dateString, {
    day: 'numeric',
    month: 'short',
  });
};

export const getActivityTypeLabel = (activityType?: string | null) => {
  switch (activityType) {
    case 'test':
      return 'Test Çözümü';
    case 'video':
      return 'Video İzleme';
    case 'kitap':
      return 'Kitap Çalışması';
    case 'not':
      return 'Not Tekrarı';
    default:
      return 'Çalışma';
  }
};

export const buildWeeklyStudyCurve = (
  sessions: AdminStudentProfileData['studySessions'],
  targetMinutes: number,
) => {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const daily = days.map((name) => ({ minutes: 0, name }));

  for (const session of sessions) {
    const sessionDate = new Date(session.date);
    if (sessionDate >= startOfWeek) {
      const index = sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1;
      if (index >= 0 && index < daily.length) {
        daily[index].minutes += session.duration;
      }
    }
  }

  let cumulative = 0;
  return daily.map((day, index) => {
    cumulative += day.minutes;
    return {
      ...day,
      cumulative,
      target: Math.round((targetMinutes / 7) * (index + 1)),
    };
  });
};

export const getTopStudyTopics = (
  sessions: AdminStudentProfileData['studySessions'],
) => {
  const totals = new Map<string, number>();

  for (const session of sessions) {
    for (const topic of session.topics || []) {
      totals.set(topic, (totals.get(topic) || 0) + session.duration);
    }
  }

  return Array.from(totals.entries())
    .map(([topic, minutes]) => ({ minutes, topic }))
    .sort((left, right) => right.minutes - left.minutes)
    .slice(0, 5);
};

export function SummaryCard({
  icon,
  label,
  meta,
  value,
}: {
  icon: ReactNode;
  label: string;
  meta: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-default dark:border-white/10 bg-surface-2/60 dark:bg-white/5 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-3 dark:bg-white/10">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs text-secondary">{meta}</p>
    </div>
  );
}

export function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-default dark:border-white/10 bg-surface-2 dark:bg-slate-900/60 px-3 py-3 text-center">
      <p className="text-xl font-bold text-primary">{value}</p>
      <p className="text-xs text-tertiary">{label}</p>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-default dark:border-white/10 bg-surface-2/40 dark:bg-slate-900/40 px-4 py-6 text-center text-sm text-secondary">
      {text}
    </div>
  );
}
