import React from 'react';
import { Info, Target } from 'lucide-react';
import type { ProgramTargetLevel } from '@/features/programs/types';
import { getProgramLevelTone } from '@/features/programs/utils';
import { formatRank } from '@/lib/examCalculators';
import { levelSectionLabels } from './helpers';
import { type EvaluatedYksProgram, YksProgramCard } from './YksProgramCard';

interface YksStepProgramRecommendationsProps {
  estimatedScore: number;
  activeRank: number | undefined;
  evaluatedPrograms: EvaluatedYksProgram[];
  loading: boolean;
  error: string | null;
  preferredLevel: 'all' | ProgramTargetLevel;
  grouped: Record<ProgramTargetLevel, EvaluatedYksProgram[]>;
  isLight: boolean;
  onEditFilters: () => void;
  onUpdateNets: () => void;
}

export function YksStepProgramRecommendations({
  estimatedScore,
  activeRank,
  evaluatedPrograms,
  loading,
  error,
  preferredLevel,
  grouped,
  isLight,
  onEditFilters,
  onUpdateNets,
}: YksStepProgramRecommendationsProps) {
  const targetLevels =
    preferredLevel === 'all'
      ? (['iddiali', 'dengeli', 'guvenli'] as ProgramTargetLevel[])
      : [preferredLevel];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-default bg-surface-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
              Tahmini Puan / Sıralama
            </div>
            <div className="text-2xl font-black tabular-nums text-primary">
              {estimatedScore.toFixed(2)} / {formatRank(activeRank)}
            </div>
          </div>
          <div className="text-sm text-secondary">
            Filtreye uygun toplam program:{' '}
            <span className="font-bold text-primary">
              {evaluatedPrograms.length}
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-default bg-surface-1 p-5 text-sm text-secondary">
          Program verileri yükleniyor...
        </div>
      )}
      {!loading && error && (
        <div className="rounded-3xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-5 text-sm text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && !evaluatedPrograms.length && (
        <div className="rounded-3xl border border-default bg-surface-1 p-6">
          <p className="text-secondary">
            Seçilen filtrelere uygun program bulunamadı.
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        evaluatedPrograms.length > 0 &&
        targetLevels.map((targetLevel) => {
          const items = grouped[targetLevel];
          if (!items?.length) return null;

          const levelTone = getProgramLevelTone(targetLevel, isLight);

          return (
            <section key={targetLevel} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-primary">
                  {levelSectionLabels[targetLevel]}
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${levelTone.badge}`}
                >
                  {items.length} program
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {items.map((program) => (
                  <YksProgramCard
                    key={program.id}
                    program={program}
                    isLight={isLight}
                  />
                ))}
              </div>
            </section>
          );
        })}

      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 p-3 text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Bu araç sonuç kaydetmez. Öneriler anlık puan/sıralama ve filtrelere
            göre üretilir. Resmi tercih öncesi mutlaka ÖSYM kılavuzu ve YÖK
            Atlas verilerini tekrar kontrol et.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEditFilters}
          className="rounded-xl border border-default dark:border-slate-400 bg-surface-1 px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-2 transition"
        >
          Filtreleri Düzenle
        </button>
        <button
          type="button"
          onClick={onUpdateNets}
          className="inline-flex items-center gap-2 rounded-xl border border-purple-600/80 dark:border-purple-300/80 px-4 py-2 text-sm font-bold transition hover:scale-[1.01] active:scale-[0.99] bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
        >
          Netleri Güncelle
          <Target className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
