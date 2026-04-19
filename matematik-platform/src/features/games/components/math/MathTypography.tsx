import type { ReactNode } from 'react';

/** Sayılar ve denklemler için okunaklı serif + tabüler rakam */
export const mathClass =
  "font-[ui-serif,Georgia,Cambria,'Times_New_Roman',Times,serif] [font-feature-settings:'tnum','lnum']";

/** Dikey kesir: pay / payda çizgisi ile */
export function FractionBlock({
  num,
  den,
  size = 'lg',
}: {
  den: number;
  num: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const scale =
    size === 'sm'
      ? 'text-lg min-w-[2.5rem]'
      : size === 'md'
        ? 'text-2xl min-w-[3rem]'
        : 'text-4xl min-w-[3.5rem]';

  return (
    <span
      className={`inline-flex flex-col items-center align-middle font-semibold tabular-nums leading-none ${mathClass} ${scale}`}
      aria-label={`${num} bölü ${den}`}
    >
      <span>{num}</span>
      <span
        className="my-1 h-[2px] w-full min-w-[2rem] rounded-full bg-current opacity-90"
        aria-hidden
      />
      <span>{den}</span>
    </span>
  );
}

export function MathVar({ children }: { children: ReactNode }) {
  return (
    <span className={`italic text-white ${mathClass}`}>{children}</span>
  );
}

export function MathNum({ children }: { children: ReactNode }) {
  return (
    <span className={`tabular-nums font-semibold text-white ${mathClass}`}>
      {children}
    </span>
  );
}

/** Satır içi denklem parçaları arasında boşluk */
export function MathRow({ children }: { children: ReactNode }) {
  return (
    <span
      className={`flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 ${mathClass}`}
    >
      {children}
    </span>
  );
}
