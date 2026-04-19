import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'xp-gold'
  | 'xp-silver'
  | 'xp-bronze';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  leadingIcon?: ReactNode;
  pill?: boolean;
};

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200',
  primary: 'bg-brand-primary/15 text-brand-primary dark:text-brand-primary-soft',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
  info: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  'xp-gold': 'bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-900 shadow-accent-glow',
  'xp-silver': 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900',
  'xp-bronze': 'bg-gradient-to-r from-orange-300 to-amber-700 text-white',
};

export function Badge({ className, tone = 'neutral', leadingIcon, pill = true, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold text-xs uppercase tracking-wide',
        pill ? 'rounded-full px-2.5 py-1' : 'rounded-md px-2 py-0.5',
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {leadingIcon ? <span className="flex items-center">{leadingIcon}</span> : null}
      <span>{children}</span>
    </span>
  );
}
