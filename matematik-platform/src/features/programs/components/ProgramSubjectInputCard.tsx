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
  isLight,
  maxQuestions,
  net,
  onChange,
  subjectKey,
  title,
  value,
}: ProgramSubjectInputCardProps) {
  const fieldClassName = `w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none transition focus:ring-2 ${
    isLight
      ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-cyan-300 focus:ring-cyan-100'
      : 'border-white/10 bg-slate-950/70 text-white focus:border-cyan-300/70 focus:ring-cyan-300/10'
  }`;

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        isLight
          ? 'border-slate-200 bg-white shadow-sm'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <div className={`h-1.5 ${accentClassName}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}
            >
              {title}
            </div>
            <div
              className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
            >
              {helperText}
            </div>
          </div>
          <div
            className={`min-w-16 rounded-xl border px-3 py-2 text-center ${
              isLight
                ? 'border-cyan-100 bg-cyan-50 text-cyan-700'
                : 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.14em]">
              Net
            </div>
            <div className="text-base font-black">{net ?? 0}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor={`${idPrefix}-${subjectKey}-correct`}
              className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
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
              className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
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
