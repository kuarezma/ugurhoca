import type { ProgramTargetLevel, ProgramLevelTone } from '@/features/programs/types';

export const MINIMUM_FULL_LGS_ROW_COUNT = 200;
export const MINIMUM_FULL_YKS_ROW_COUNT = 1000;

export const PROGRAM_LEVEL_TONES: Record<ProgramTargetLevel, ProgramLevelTone> = {
  iddiali: {
    darkBadge: 'bg-rose-500/20 text-rose-200',
    darkCard: 'border-rose-500/30 bg-rose-500/10',
    lightBadge: 'bg-rose-500/20 text-rose-700',
    lightCard: 'border-rose-300/70 bg-rose-50/60',
  },
  dengeli: {
    darkBadge: 'bg-amber-500/20 text-amber-200',
    darkCard: 'border-amber-500/30 bg-amber-500/10',
    lightBadge: 'bg-amber-500/20 text-amber-700',
    lightCard: 'border-amber-300/70 bg-amber-50/60',
  },
  guvenli: {
    darkBadge: 'bg-emerald-500/20 text-emerald-200',
    darkCard: 'border-emerald-500/30 bg-emerald-500/10',
    lightBadge: 'bg-emerald-500/20 text-emerald-700',
    lightCard: 'border-emerald-300/70 bg-emerald-50/60',
  },
};

export const PROGRAM_LEVEL_BADGE_LABELS: Record<ProgramTargetLevel, string> = {
  iddiali: 'Iddiali',
  dengeli: 'Dengeli',
  guvenli: 'Guvenli',
};
