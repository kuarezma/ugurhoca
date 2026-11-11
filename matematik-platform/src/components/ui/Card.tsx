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
        'relative rounded-3xl border border-subtle crystal-panel text-primary transition-all duration-300',
        isBento && 'bento-card',
        glow &&
          'shadow-[0_0_24px_rgba(56,189,248,0.22)] dark:shadow-[0_0_28px_rgba(56,189,248,0.28)] border-sky-400/40',
        interactive &&
          'cursor-pointer crystal-card-interactive hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_14px_32px_-8px_rgba(56,189,248,0.25)] active:translate-y-0 active:scale-[0.99]',
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
    <div
      className={cn('flex items-start justify-between gap-3 mb-4', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: CardPartProps) {
  return (
    <h3
      className={cn('font-display text-xl font-bold text-primary', className)}
      {...rest}
    >
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
