import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type ChipTone =
  | 'emerald'
  | 'blue'
  | 'yellow'
  | 'violet'
  | 'rose'
  | 'cyan'
  | 'lime'
  | 'orange'
  | 'zinc'
  | 'slate';

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: ChipTone;
};

export function Chip({ className, tone = 'slate', ...rest }: ChipProps) {
  return (
    <span
      data-tone={tone}
      className={cn(
        'ui-chip inline-flex items-center rounded-full border font-bold tracking-wide',
        className,
      )}
      {...rest}
    />
  );
}
