import { Sparkles } from 'lucide-react';

type ProgramWizardHeaderProps = {
  badgeClassName: string;
  badgeLabel: string;
  dataYear: number;
  description: string;
  isLight: boolean;
  title: string;
};

export function ProgramWizardHeader({
  badgeClassName,
  badgeLabel,
  dataYear,
  description,
  isLight,
  title,
}: ProgramWizardHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div
          className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white ${badgeClassName}`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {badgeLabel}
        </div>
        <h1
          className={`text-2xl font-black sm:text-4xl ${
            isLight ? 'light-text-strong' : 'text-white'
          }`}
        >
          {title}
        </h1>
        <p
          className={`mt-3 max-w-3xl text-sm sm:text-base ${
            isLight ? 'light-text-muted' : 'text-slate-300'
          }`}
        >
          {description}
        </p>
      </div>

      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-white/5 border-white/10 text-slate-200'
        }`}
      >
        Veri Yili: <span className="font-bold">{dataYear}</span>
      </div>
    </div>
  );
}
