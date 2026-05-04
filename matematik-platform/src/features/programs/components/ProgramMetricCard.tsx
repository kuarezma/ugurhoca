'use client';

type ProgramMetricCardProps = {
  isLight: boolean;
  label: string;
  value: string | number;
  tone?: 'cyan' | 'fuchsia' | 'indigo' | 'emerald';
};

const toneClassNames = {
  cyan: {
    light: 'border-cyan-100 bg-cyan-50 text-cyan-700',
    dark: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
  },
  fuchsia: {
    light: 'border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700',
    dark: 'border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100',
  },
  indigo: {
    light: 'border-indigo-100 bg-indigo-50 text-indigo-700',
    dark: 'border-indigo-300/20 bg-indigo-300/10 text-indigo-100',
  },
  emerald: {
    light: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    dark: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  },
};

export function ProgramMetricCard({
  isLight,
  label,
  tone = 'cyan',
  value,
}: ProgramMetricCardProps) {
  const toneClassName = isLight
    ? toneClassNames[tone].light
    : toneClassNames[tone].dark;

  return (
    <div className={`rounded-2xl border p-4 ${toneClassName}`}>
      <div className="text-[11px] font-black uppercase tracking-[0.16em] opacity-75">
        {label}
      </div>
      <div className="mt-1 text-3xl font-black tracking-normal tabular-nums">
        {value}
      </div>
    </div>
  );
}
