import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bento';
};

const PADDING = {
  none: '',
  sm: 'p-4 sm:p-5',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    className,
    glow = false,
    interactive = false,
    padding = 'md',
    variant = 'default',
    children,
    ...rest
  },
  ref,
) {
  const isBento = variant === 'bento';

  return (
    <div
      ref={ref}
      className={cn(
        'relative transition-all duration-200',
        'rounded-3xl border-3 border-default bg-surface-1 shadow-[0_6px_0_var(--border-default)]',
        isBento && 'bento-card',
        glow && 'shadow-[0_8px_0_var(--border-default)]',
        interactive &&
          'cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_0_var(--border-default)] active:translate-y-0.5 active:shadow-[0_2px_0_var(--border-default)]',
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
    <h3 className={cn('font-display text-xl font-bold text-primary', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...rest }: CardPartProps) {
  return (
    <div className={cn('text-secondary', className)} {...rest}>
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
