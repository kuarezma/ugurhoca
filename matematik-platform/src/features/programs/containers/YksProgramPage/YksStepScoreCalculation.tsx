import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ProgramMetricCard } from '@/features/programs/components/ProgramMetricCard';
import { ProgramSubjectInputCard } from '@/features/programs/components/ProgramSubjectInputCard';
import { YksScoreTable } from '@/features/programs/components/YksScoreTable';
import { clampProgramValue } from '@/features/programs/utils';
import {
  aytSubjectKeys,
  calculateYksScore,
  formatRank,
  tytSubjectKeys,
  yksSubjects,
  type YksInputs,
  type YksScoreType,
  type YksSubjectKey,
} from '@/lib/examCalculators';

type YksSubjectMeta = (typeof yksSubjects)[number];

interface YksStepScoreCalculationProps {
  obpInput: string;
  setObpInput: React.Dispatch<React.SetStateAction<string>>;
  scoreType: YksScoreType;
  setScoreType: (type: YksScoreType) => void;
  placedLastYear: boolean;
  setPlacedLastYear: (placed: boolean) => void;
  manualRank: string;
  setManualRank: React.Dispatch<React.SetStateAction<string>>;
  inputs: YksInputs;
  updateSubjectInput: (
    subjectKey: YksSubjectKey,
    field: 'correct' | 'wrong',
    rawValue: string,
  ) => void;
  subjectsByKey: Map<YksSubjectKey, YksSubjectMeta>;
  yksResult: ReturnType<typeof calculateYksScore>;
  activeRank: number | undefined;
  isLight: boolean;
  onNext: () => void;
}

export function YksStepScoreCalculation({
  obpInput,
  setObpInput,
  scoreType,
  setScoreType,
  placedLastYear,
  setPlacedLastYear,
  manualRank,
  setManualRank,
  inputs,
  updateSubjectInput,
  subjectsByKey,
  yksResult,
  activeRank,
  isLight,
  onNext,
}: YksStepScoreCalculationProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-default bg-surface-2 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.2fr]">
          <div>
            <label
              htmlFor="yks-obp"
              className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-secondary"
            >
              Diploma Notu
            </label>
            <input
              id="yks-obp"
              type="number"
              min={50}
              max={100}
              value={obpInput}
              onChange={(event) => setObpInput(event.target.value)}
              onBlur={() => {
                setObpInput((current) => {
                  const parsed = Number.parseFloat(current);
                  if (Number.isNaN(parsed)) return '50';
                  return String(clampProgramValue(parsed, 50, 100));
                });
              }}
              className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary tabular-nums outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label
              htmlFor="yks-score-type"
              className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-secondary"
            >
              Tercih Puan Türü
            </label>
            <select
              id="yks-score-type"
              value={scoreType}
              onChange={(event) =>
                setScoreType(event.target.value as YksScoreType)
              }
              className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="TYT">TYT</option>
              <option value="SAY">SAY</option>
              <option value="EA">EA</option>
              <option value="SOZ">SÖZ</option>
            </select>
          </div>

          <fieldset>
            <legend className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
              Önceki Sene Yerleşme
            </legend>
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-default dark:border-slate-400 text-sm font-bold bg-surface-0">
              <button
                type="button"
                onClick={() => setPlacedLastYear(false)}
                className={`px-3 py-2 transition ${!placedLastYear ? 'bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none' : 'text-secondary hover:text-primary'}`}
              >
                Yerleşmedim
              </button>
              <button
                type="button"
                onClick={() => setPlacedLastYear(true)}
                className={`px-3 py-2 transition ${placedLastYear ? 'bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none' : 'text-secondary hover:text-primary'}`}
              >
                Yerleştim
              </button>
            </div>
          </fieldset>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-black text-primary">
            TYT Puan Hesaplama
          </h2>
          <span className="rounded-full px-3 py-1 text-xs font-bold border border-cyan-200 dark:border-cyan-300/20 bg-cyan-50 dark:bg-cyan-300/10 text-cyan-800 dark:text-cyan-100">
            4 yanlış 1 doğruyu götürür
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tytSubjectKeys.map((subjectKey) => {
            const subject = subjectsByKey.get(subjectKey);
            if (!subject) return null;

            return (
              <ProgramSubjectInputCard
                key={subject.key}
                accentClassName="bg-gradient-to-r from-cyan-600 to-blue-600"
                helperText={`${subject.questions} soru`}
                idPrefix="yks"
                isLight={isLight}
                maxQuestions={subject.questions}
                net={
                  yksResult.tytNets[
                    subject.key as keyof typeof yksResult.tytNets
                  ]
                }
                onChange={(field, value) =>
                  updateSubjectInput(subject.key, field, value)
                }
                subjectKey={subject.key}
                title={subject.label}
                value={inputs[subject.key]}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-black text-primary">
            AYT Puan Hesaplama
          </h2>
          <span className="rounded-full px-3 py-1 text-xs font-bold border border-purple-200 dark:border-purple-300/20 bg-purple-50 dark:bg-purple-300/10 text-purple-800 dark:text-purple-100">
            Puan türüne göre ağırlıklandırılır
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {aytSubjectKeys.map((subjectKey) => {
            const subject = subjectsByKey.get(subjectKey);
            if (!subject) return null;

            return (
              <ProgramSubjectInputCard
                key={subject.key}
                accentClassName="bg-gradient-to-r from-purple-600 to-purple-600"
                helperText={`${subject.questions} soru`}
                idPrefix="yks"
                isLight={isLight}
                maxQuestions={subject.questions}
                net={
                  yksResult.aytNets[
                    subject.key as keyof typeof yksResult.aytNets
                  ]
                }
                onChange={(field, value) =>
                  updateSubjectInput(subject.key, field, value)
                }
                subjectKey={subject.key}
                title={subject.label}
                value={inputs[subject.key]}
              />
            );
          })}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-default dark:border-slate-400 bg-surface-1 p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            OBP Katkısı
          </div>
          <div className="mt-1 text-3xl font-black text-primary">
            {yksResult.obpContribution}
          </div>
          <div className="mt-1 text-xs text-secondary">
            {placedLastYear
              ? 'Önceki yıl yerleştiğin için yarım katkı.'
              : 'Tam OBP katkısı uygulanıyor.'}
          </div>
        </div>

        <div className="rounded-2xl border border-default dark:border-slate-400 bg-surface-1 p-4">
          <label
            htmlFor="yks-manual-rank"
            className="mb-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-secondary"
          >
            Manuel Sıralama (Opsiyonel)
          </label>
          <input
            id="yks-manual-rank"
            type="number"
            min={1}
            value={manualRank}
            onChange={(event) => {
              const digitsOnly = event.target.value.replace(/\D/g, '');
              setManualRank(digitsOnly);
            }}
            onBlur={() => {
              setManualRank((current) => {
                const normalized = current.replace(/\D/g, '');
                if (!normalized) return '';
                const parsed = Number.parseInt(normalized, 10);
                return Number.isNaN(parsed) || parsed < 1 ? '' : String(parsed);
              });
            }}
            placeholder={formatRank(yksResult.estimatedRank)}
            className="w-full rounded-xl border border-default dark:border-slate-400 bg-surface-0 px-3 py-2 text-sm font-semibold text-primary tabular-nums outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <YksScoreTable
        activeScoreType={scoreType}
        isLight={isLight}
        onScoreTypeChange={setScoreType}
        rows={yksResult.rows}
      />

      <div className="rounded-3xl border border-default bg-surface-2 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <ProgramMetricCard
            isLight={isLight}
            label={`Yerleştirme Puanı (${scoreType})`}
            tone="fuchsia"
            value={yksResult.estimatedScore}
          />
          <ProgramMetricCard
            isLight={isLight}
            label="Tercih Sıralaması"
            tone="cyan"
            value={formatRank(activeRank)}
          />
          <ProgramMetricCard
            isLight={isLight}
            label="Ham Puan"
            tone="indigo"
            value={yksResult.rawScore}
          />
        </div>

        <button
          type="button"
          onClick={onNext}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-purple-600/80 dark:border-purple-300/80 px-4 py-2 text-sm font-bold transition hover:scale-[1.01] active:scale-[0.99] bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
        >
          Tercih Filtrelerine Geç
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
