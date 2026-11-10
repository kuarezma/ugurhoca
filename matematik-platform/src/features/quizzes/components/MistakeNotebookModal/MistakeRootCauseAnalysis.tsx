import { Activity } from 'lucide-react';
import type { ReasonBreakdown } from './types';

type MistakeRootCauseAnalysisProps = {
  reasonBreakdown: ReasonBreakdown;
};

export function MistakeRootCauseAnalysis({
  reasonBreakdown,
}: MistakeRootCauseAnalysisProps) {
  return (
    <div className="no-print border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 px-5 py-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Activity className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Kök Neden Analiz Çubuğu</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {reasonBreakdown.total} kayıtlı hatanın dağılımı
          </span>
        </div>

        {/* Segmented Progress Bar */}
        <div
          role="progressbar"
          aria-label="Hata Kök Neden Dağılımı"
          className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10 p-0.5 gap-0.5"
        >
          {reasonBreakdown.carelessPct > 0 && (
            <div
              style={{ width: `${reasonBreakdown.carelessPct}%` }}
              className="h-full rounded-full bg-rose-500 transition-all"
              title={`İşlem Hatası: %${reasonBreakdown.carelessPct} (${reasonBreakdown.careless} soru)`}
            />
          )}
          {reasonBreakdown.conceptPct > 0 && (
            <div
              style={{ width: `${reasonBreakdown.conceptPct}%` }}
              className="h-full rounded-full bg-amber-500 transition-all"
              title={`Kural / Konu Eksikliği: %${reasonBreakdown.conceptPct} (${reasonBreakdown.concept} soru)`}
            />
          )}
          {reasonBreakdown.readingPct > 0 && (
            <div
              style={{ width: `${reasonBreakdown.readingPct}%` }}
              className="h-full rounded-full bg-sky-500 transition-all"
              title={`Soru Kökünü Yanlış Okuma: %${reasonBreakdown.readingPct} (${reasonBreakdown.reading} soru)`}
            />
          )}
          {reasonBreakdown.timePct > 0 && (
            <div
              style={{ width: `${reasonBreakdown.timePct}%` }}
              className="h-full rounded-full bg-purple-500 transition-all"
              title={`Süre Baskısı: %${reasonBreakdown.timePct} (${reasonBreakdown.time} soru)`}
            />
          )}
          {reasonBreakdown.untaggedPct > 0 && (
            <div
              style={{ width: `${reasonBreakdown.untaggedPct}%` }}
              className="h-full rounded-full bg-slate-400/40 transition-all"
              title={`Etiketsiz: %${reasonBreakdown.untaggedPct} (${reasonBreakdown.untagged} soru)`}
            />
          )}
        </div>

        {/* Etiket Dağılım Rozetleri */}
        <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            İşlem (%{reasonBreakdown.carelessPct})
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Konu/Kural (%{reasonBreakdown.conceptPct})
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Okuma (%{reasonBreakdown.readingPct})
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Süre (%{reasonBreakdown.timePct})
          </span>
          {reasonBreakdown.untagged > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-400/40" />
              Etiketsiz ({reasonBreakdown.untagged})
            </span>
          )}
        </div>

        {/* Pedagojik Reçete Kartı */}
        {reasonBreakdown.advice && (
          <div className="mt-1 flex items-start gap-2.5 rounded-xl border border-indigo-200/80 dark:border-indigo-500/20 bg-indigo-50/80 dark:bg-indigo-950/30 p-2.5 text-xs">
            <span className="text-base shrink-0 select-none">
              {reasonBreakdown.advice.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-indigo-950 dark:text-indigo-200">
                {reasonBreakdown.advice.title}
              </p>
              <p className="mt-0.5 text-indigo-900/80 dark:text-indigo-300/80 text-[11px] leading-relaxed">
                {reasonBreakdown.advice.desc}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
