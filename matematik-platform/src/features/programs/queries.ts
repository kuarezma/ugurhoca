import { supabase } from '@/lib/supabase';
import type {
  LgsSchoolTarget,
  YksProgramTarget,
} from '@/features/programs/types';

type ProgramLoadResult<T> = {
  dataYear: number;
  error: string;
  rows: T[];
};

const MINIMUM_FULL_LGS_ROW_COUNT = 200;

export async function loadYksProgramTargets(
  preferredYear = 2026,
): Promise<ProgramLoadResult<YksProgramTarget>> {
  let selectedYear = preferredYear;

  const preferred = await supabase
    .from('yks_program_targets')
    .select('*')
    .eq('year', preferredYear)
    .order('base_rank', { ascending: true });

  if (preferred.error) {
    return {
      dataYear: preferredYear,
      error:
        'YKS program verileri okunamadi. Lutfen veritabani tablosunu kontrol et.',
      rows: [],
    };
  }

  let rows = (preferred.data || []) as YksProgramTarget[];

  if (!rows.length) {
    const latestYearQuery = await supabase
      .from('yks_program_targets')
      .select('year')
      .order('year', { ascending: false })
      .limit(1);

    const latestYear = latestYearQuery.data?.[0]?.year;

    if (latestYear) {
      selectedYear = latestYear;
      const latestRowsQuery = await supabase
        .from('yks_program_targets')
        .select('*')
        .eq('year', latestYear)
        .order('base_rank', { ascending: true });

      rows = (latestRowsQuery.data || []) as YksProgramTarget[];
    }
  }

  return {
    dataYear: selectedYear,
    error: rows.length
      ? ''
      : 'YKS hedef program verisi bulunamadi. Supabase tablosuna resmi veriler yuklenmeli.',
    rows,
  };
}

export async function loadLgsSchoolTargets(
  preferredYear = 2026,
): Promise<ProgramLoadResult<LgsSchoolTarget>> {
  const yearListQuery = await supabase
    .from('lgs_school_targets')
    .select('year');

  if (yearListQuery.error) {
    return {
      dataYear: preferredYear,
      error: 'LGS okul verileri okunamadi. Lutfen veritabani tablosunu kontrol et.',
      rows: [],
    };
  }

  const counts = new Map<number, number>();

  for (const row of yearListQuery.data ?? []) {
    counts.set(row.year, (counts.get(row.year) ?? 0) + 1);
  }

  const availableYears = [...counts.keys()].sort((a, b) => b - a);

  if (!availableYears.length) {
    return {
      dataYear: preferredYear,
      error: 'LGS hedef okul verisi bulunamadi. Supabase tablosuna resmi veriler yuklenmeli.',
      rows: [],
    };
  }

  const preferredCount = counts.get(preferredYear) ?? 0;
  const selectedYear =
    preferredCount >= MINIMUM_FULL_LGS_ROW_COUNT
      ? preferredYear
      : availableYears.find((year) => (counts.get(year) ?? 0) >= MINIMUM_FULL_LGS_ROW_COUNT) ??
        availableYears[0];

  const selectedRowsQuery = await supabase
    .from('lgs_school_targets')
    .select('*')
    .eq('year', selectedYear)
    .order('base_score', { ascending: false });

  if (selectedRowsQuery.error) {
    return {
      dataYear: selectedYear,
      error: 'LGS okul verileri okunamadi. Lutfen veritabani tablosunu kontrol et.',
      rows: [],
    };
  }

  const rows = (selectedRowsQuery.data || []) as LgsSchoolTarget[];

  return {
    dataYear: selectedYear,
    error: rows.length
      ? ''
      : 'LGS hedef okul verisi bulunamadi. Supabase tablosuna resmi veriler yuklenmeli.',
    rows,
  };
}
