import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
};

const ROUNDED = {
  sm: 'rounded-md',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({ className, rounded = 'md', ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('shimmer-bg animate-pulse', ROUNDED[rounded], className)}
      {...rest}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={cn('h-3', index === lines - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  );
}
