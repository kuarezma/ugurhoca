import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import type {
  ProgramTargetLevel,
  YksProgramTarget,
} from '@/features/programs/types';
import {
  formatProgramOptionLabel,
  getProgramLevelBadgeLabel,
  getProgramLevelTone,
} from '@/features/programs/utils';
import { formatRank } from '@/lib/examCalculators';
import { buildSourceLinkClassName } from './helpers';

export type EvaluatedYksProgram = YksProgramTarget & {
  targetLevel: ProgramTargetLevel;
};

interface YksProgramCardProps {
  program: EvaluatedYksProgram;
  isLight: boolean;
}

export function YksProgramCard({ program, isLight }: YksProgramCardProps) {
  const tone = getProgramLevelTone(program.targetLevel, isLight);

  return (
    <article className={`rounded-2xl border p-4 ${tone.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-primary sm:text-base">
            {program.university_name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-secondary">
            {program.program_name}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-secondary">
            <MapPin className="h-3.5 w-3.5" />
            {formatProgramOptionLabel(program.city)}
          </p>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[11px] font-bold ${tone.badge}`}
        >
          {getProgramLevelBadgeLabel(program.targetLevel)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
        <div className="rounded-xl border border-default dark:border-slate-400 bg-surface-1 px-3 py-2">
          <div className="text-secondary">Taban Sıralama</div>
          <div className="font-black tabular-nums text-primary">
            {formatRank(program.base_rank)}
          </div>
        </div>
        <div className="rounded-xl border border-default dark:border-slate-400 bg-surface-1 px-3 py-2">
          <div className="text-secondary">Taban Puan</div>
          <div className="font-black tabular-nums text-primary">
            {program.base_score ? program.base_score.toFixed(2) : '-'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-secondary">
        <span className="rounded-full px-2 py-1 border border-default dark:border-slate-400 bg-surface-1 font-semibold text-primary">
          {program.score_type}
        </span>
        <span className="rounded-full px-2 py-1 border border-default dark:border-slate-400 bg-surface-1 font-semibold text-primary">
          {program.level === 'lisans' ? 'Lisans' : 'Ön Lisans'}
        </span>
        <span className="rounded-full px-2 py-1 border border-default dark:border-slate-400 bg-surface-1 font-semibold text-primary">
          {formatProgramOptionLabel(program.university_type)}
        </span>
        <span className="rounded-full px-2 py-1 border border-default dark:border-slate-400 bg-surface-1 font-semibold text-primary">
          Burs: %{program.scholarship_rate || 0}
        </span>
        {program.quota_total ? (
          <span className="rounded-full px-2 py-1 border border-default dark:border-slate-400 bg-surface-1 font-semibold text-primary">
            Kontenjan: {program.quota_total}
          </span>
        ) : null}
      </div>

      {program.source_url_osym || program.source_url_yokatlas ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {program.source_url_osym ? (
            <a
              href={program.source_url_osym}
              target="_blank"
              rel="noopener noreferrer"
              className={buildSourceLinkClassName(isLight)}
            >
              ÖSYM kaynağı
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {program.source_url_yokatlas ? (
            <a
              href={program.source_url_yokatlas}
              target="_blank"
              rel="noopener noreferrer"
              className={buildSourceLinkClassName(isLight)}
            >
              YÖK Atlas
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
