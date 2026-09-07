'use client';

import type { LgsSubjectInput } from '@/lib/examCalculators';

type ProgramSubjectInputCardProps = {
  accentClassName: string;
  helperText: string;
  idPrefix: string;
  isLight: boolean;
  onChange: (field: 'correct' | 'wrong', value: string) => void;
  subjectKey: string;
  title: string;
  value: LgsSubjectInput;
  net?: number;
  maxQuestions: number;
};

export function ProgramSubjectInputCard({
  accentClassName,
  helperText,
  idPrefix,
  isLight: _isLight,
  maxQuestions,
  net,
  onChange,
  subjectKey,
  title,
  value,
}: ProgramSubjectInputCardProps) {
  const fieldClassName =
    'w-full rounded-xl border border-default dark:border-slate-500 bg-surface-0 px-3 py-2 text-right text-sm font-semibold tabular-nums text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20';

  return (
    <div className="overflow-hidden rounded-2xl border border-default bg-surface-1 shadow-sm">
      <div className={`h-1.5 ${accentClassName}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-black text-primary">{title}</div>
            <div className="mt-1 text-xs text-secondary">{helperText}</div>
          </div>
          <div className="min-w-16 rounded-xl border border-cyan-200 dark:border-cyan-300/20 bg-cyan-50 dark:bg-cyan-300/10 text-cyan-800 dark:text-cyan-100 px-3 py-2 text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em]">
              Net
            </div>
            <div className="text-base font-black tabular-nums">{net ?? 0}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor={`${idPrefix}-${subjectKey}-correct`}
              className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary"
            >
              Doğru
            </label>
            <input
              id={`${idPrefix}-${subjectKey}-correct`}
              type="number"
              min={0}
              max={maxQuestions}
              value={value.correct}
              onChange={(event) => onChange('correct', event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <label
              htmlFor={`${idPrefix}-${subjectKey}-wrong`}
              className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary"
            >
              Yanlış
            </label>
            <input
              id={`${idPrefix}-${subjectKey}-wrong`}
              type="number"
              min={0}
              max={maxQuestions - value.correct}
              value={value.wrong}
              onChange={(event) => onChange('wrong', event.target.value)}
              className={fieldClassName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
