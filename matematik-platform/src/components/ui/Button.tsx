'use client';

import { forwardRef, useCallback, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'xp'
  | 'playful-green'
  | 'playful-blue'
  | 'playful-yellow'
  | 'playful-white'
  | 'playful-purple';

export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  ripple?: boolean;
};

const BASE =
  'inline-flex items-center justify-center gap-2 font-display font-bold rounded-2xl transition-all duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary disabled:opacity-60 disabled:cursor-not-allowed select-none ripple-container active:translate-y-1';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-[0_5px_0_#46a302] active:shadow-[0_1px_0_#46a302]',
  secondary:
    'bg-brand-secondary hover:bg-brand-secondary-soft text-slate-950 dark:text-slate-950 shadow-[0_5px_0_#1899d6] active:shadow-[0_1px_0_#1899d6]',
  ghost:
    'bg-transparent text-current hover:bg-slate-100 dark:hover:bg-white/5 active:translate-y-0.5',
  outline:
    'bg-transparent border-2 border-default text-primary hover:bg-surface-2 active:translate-y-0.5',
  destructive:
    'bg-brand-danger hover:bg-brand-danger/90 text-slate-950 dark:text-slate-950 shadow-[0_5px_0_#ea2b2b] active:shadow-[0_1px_0_#ea2b2b]',
  success:
    'bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-[0_5px_0_#46a302] active:shadow-[0_1px_0_#46a302]',
  xp:
    'bg-brand-accent hover:bg-brand-accent-soft text-amber-950 shadow-[0_5px_0_#e5b400] active:shadow-[0_1px_0_#e5b400]',
  'playful-green':
    'bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-[0_5px_0_#46a302] active:shadow-[0_1px_0_#46a302]',
  'playful-blue':
    'bg-brand-secondary hover:bg-brand-secondary-soft text-slate-950 dark:text-slate-950 shadow-[0_5px_0_#1899d6] active:shadow-[0_1px_0_#1899d6]',
  'playful-yellow':
    'bg-brand-accent hover:bg-brand-accent-soft text-amber-950 shadow-[0_5px_0_#e5b400] active:shadow-[0_1px_0_#e5b400]',
  'playful-white':
    'bg-white text-slate-900 border-2 border-slate-200 shadow-[0_4px_0_#cbd5e1] hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:shadow-[0_4px_0_#0f172a] active:shadow-[0_1px_0_#cbd5e1] dark:active:shadow-[0_1px_0_#0f172a]',
  'playful-purple':
    'bg-brand-pink hover:bg-brand-pink/90 text-slate-950 dark:text-slate-950 shadow-[0_5px_0_#a545e8] active:shadow-[0_1px_0_#a545e8]',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm min-w-[2.75rem]',
  md: 'h-11 px-5 text-sm sm:text-base min-w-[2.75rem]',
  lg: 'h-13 px-7 font-display text-lg min-w-[2.75rem]',
};

function createRipple(event: MouseEvent<HTMLButtonElement>) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement('span');
  ripple.className = 'ripple-span';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    ripple = true,
    onClick,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const [rippling, setRippling] = useState(false);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        createRipple(event);
        setRippling(true);
        setTimeout(() => setRippling(false), 220);
      }
      onClick?.(event);
    },
    [disabled, loading, onClick, ripple],
  );

  return (
    <button
      ref={ref}
      type={type}
      onClick={handleClick}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        rippling && 'animate-pop',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        leadingIcon
      )}
      <span className="truncate">{children}</span>
      {!loading && trailingIcon}
    </button>
  );
});
