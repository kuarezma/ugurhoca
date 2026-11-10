import type {
  ProgramStep,
  ProgramTargetLevel,
} from '@/features/programs/types';
import { clampProgramValue } from '@/features/programs/utils';

export const levelSectionLabels: Record<ProgramTargetLevel, string> = {
  iddiali: 'İddialı Hedefler',
  dengeli: 'Dengeli Hedefler',
  guvenli: 'Güvenli Hedefler',
};

export const buildSourceLinkClassName = (_isLight: boolean) =>
  'inline-flex items-center gap-1.5 rounded-xl border border-default dark:border-slate-400 bg-surface-1 px-3 py-2 text-xs font-bold text-primary hover:border-accent transition-colors';

export const parseObpInput = (value: string) => {
  const normalized = value.replace(',', '.').trim();
  if (!normalized) return Number.NaN;
  return Number.parseFloat(normalized);
};

export const normalizeObp = (obpInput: string): number => {
  const parsed = parseObpInput(obpInput);
  return Number.isNaN(parsed) ? 50 : clampProgramValue(parsed, 50, 100);
};

export const steps: ProgramStep[] = [
  { id: 1 as const, title: 'Puan Hesapla' },
  { id: 2 as const, title: 'Tercih Filtreleri' },
  { id: 3 as const, title: 'Program Önerileri' },
];
