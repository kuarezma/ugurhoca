import { Sparkles } from 'lucide-react';

type ProgramWizardHeaderProps = {
  badgeClassName: string;
  badgeLabel: string;
  dataYear: number;
  dataYearNote?: string;
  description: string;
  isLight: boolean;
  title: string;
};

export function ProgramWizardHeader({
  badgeClassName,
  badgeLabel,
  dataYear,
  dataYearNote,
  description,
  isLight: _isLight,
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
        <h1 className="text-2xl font-black text-primary sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm sm:text-base text-secondary">
          {description}
        </p>
      </div>

      <div className="rounded-2xl border border-default dark:border-slate-500 bg-surface-1 px-4 py-3 text-sm text-primary shadow-xs">
        Veri Yılı: <span className="font-bold">{dataYear}</span>
        {dataYearNote ? (
          <div className="mt-1 text-[11px] text-secondary">
            {dataYearNote}
          </div>
        ) : null}
      </div>
    </div>
  );
}
