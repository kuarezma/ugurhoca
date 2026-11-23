import type { ReactNode } from 'react';
import type { AdminUser } from '@/features/admin/types';

export type RiskFilter = 'all' | 'high' | 'medium' | 'low';
export type ActivityFilter = 'all' | 'today' | 'week' | 'inactive';
export type FavoriteFilter = 'all' | 'favorites';

export const getCurrentWeekStart = () => {
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const formatGrade = (grade: AdminUser['grade']) =>
  grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`;

export function Select({
  'aria-label': ariaLabel,
  children,
  onChange,
  value,
}: {
  'aria-label'?: string;
  children: ReactNode;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-border-default bg-surface-1 px-3 py-2.5 text-sm text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 lg:w-40"
    >
      {children}
    </select>
  );
}

export function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-2 px-4 py-3">
      <p className="text-2xl font-black text-primary">{value}</p>
      <p className="text-xs font-semibold text-secondary">{label}</p>
    </div>
  );
}

export function MiniSignal({
  icon,
  label,
  meta,
  value,
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-2 px-3 py-3">
      <div className="mb-2 flex items-center gap-2 text-secondary">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="text-base font-bold text-primary">{value}</p>
      {meta ? <p className="text-xs text-tertiary">{meta}</p> : null}
    </div>
  );
}
