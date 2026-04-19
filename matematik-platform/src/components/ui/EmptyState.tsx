import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  tone?: 'default' | 'soft' | 'card';
  className?: string;
};

const TONE = {
  default: 'bg-transparent',
  soft: 'bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/10 rounded-3xl',
  card: 'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 rounded-3xl shadow-soft-card',
};

export function EmptyState({ icon, title, description, action, secondaryAction, tone = 'soft', className }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-10 sm:py-14',
        TONE[tone],
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-primary/20 via-brand-pink/20 to-brand-orange/20 text-brand-primary dark:text-brand-primary-soft">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm sm:text-base text-slate-600 dark:text-slate-400">{description}</p>
      ) : null}
      {(action || secondaryAction) ? (
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
