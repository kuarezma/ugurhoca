import {
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
