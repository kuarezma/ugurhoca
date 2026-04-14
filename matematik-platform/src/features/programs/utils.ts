import {
  MINIMUM_FULL_LGS_ROW_COUNT,
  MINIMUM_FULL_YKS_ROW_COUNT,
  PROGRAM_LEVEL_BADGE_LABELS,
  PROGRAM_LEVEL_TONES,
} from '@/features/programs/constants';
import type { ProgramTargetLevel } from '@/features/programs/types';

export function clampProgramValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getProgramLevelBadgeLabel(level: ProgramTargetLevel) {
  return PROGRAM_LEVEL_BADGE_LABELS[level];
}

export function getProgramLevelTone(level: ProgramTargetLevel, isLight: boolean) {
  const tone = PROGRAM_LEVEL_TONES[level];

  return {
    badge: isLight ? tone.lightBadge : tone.darkBadge,
    card: isLight ? tone.lightCard : tone.darkCard,
  };
}

function formatProgramToken(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return normalized;
  }

  if (normalized === 'KKTC') {
    return normalized;
  }

  const lower = normalized.toLocaleLowerCase('tr');
  return lower.charAt(0).toLocaleUpperCase('tr') + lower.slice(1);
}

export function formatProgramOptionLabel(value: string) {
  return value
    .split(/(\s+|\/|-)/)
    .map((part) => (/^\s+$|^\/$|^-$/.test(part) ? part : formatProgramToken(part)))
    .join('');
}

export function getMinimumFullProgramRowCount(kind: 'lgs' | 'yks') {
  return kind === 'lgs' ? MINIMUM_FULL_LGS_ROW_COUNT : MINIMUM_FULL_YKS_ROW_COUNT;
}
