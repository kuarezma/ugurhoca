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
  | 'xp';

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
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] select-none ripple-container';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange text-white shadow-brand-glow hover:shadow-brand-glow-lg hover:-translate-y-0.5',
  secondary:
    'bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/40 hover:bg-brand-secondary/25',
  ghost:
    'bg-transparent text-current hover:bg-white/10 dark:hover:bg-white/5',
  outline:
    'bg-transparent border border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10',
  destructive:
    'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg hover:shadow-rose-500/40 hover:-translate-y-0.5',
  success:
    'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5',
  xp:
    'bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-slate-900 shadow-accent-glow hover:-translate-y-0.5',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm min-w-[2.75rem]',
  md: 'h-11 px-5 text-sm sm:text-base min-w-[2.75rem]',
  lg: 'h-13 px-7 text-base font-display text-lg min-w-[2.75rem]',
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
