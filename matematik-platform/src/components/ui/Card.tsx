import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const PADDING = {
  none: '',
  sm: 'p-4 sm:p-5',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, glow = false, interactive = false, padding = 'md', children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl border transition-all duration-200',
        'bg-white/70 dark:bg-slate-900/60 backdrop-blur',
        'border-slate-200/80 dark:border-white/10',
        glow && 'shadow-soft-card hover:shadow-pop-card',
        interactive && 'tilt-on-hover cursor-pointer hover:border-brand-primary/40',
        PADDING[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

type CardPartProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode };

export function CardHeader({ className, children, ...rest }: CardPartProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 mb-4', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: CardPartProps) {
  return (
    <h3 className={cn('font-display text-xl font-bold text-slate-900 dark:text-white', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...rest }: CardPartProps) {
  return (
    <div className={cn('text-slate-700 dark:text-slate-300', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: CardPartProps) {
  return (
    <div className={cn('mt-4 flex items-center gap-3', className)} {...rest}>
      {children}
    </div>
  );
}
