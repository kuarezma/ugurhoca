import { supabase } from '@/lib/supabase/client';
import {
  MINIMUM_FULL_LGS_ROW_COUNT,
  MINIMUM_FULL_YKS_ROW_COUNT,
} from '@/features/programs/constants';
import type {
  LgsSchoolTarget,
  YksProgramTarget,
} from '@/features/programs/types';

const PROGRAM_QUERY_PAGE_SIZE = 1000;

type ProgramLoadResult<T> = {
  dataYear: number;
  error: string;
  historyYears?: number[];
  rows: T[];
};

type QueryError = {
  message: string;
};

async function fetchAllProgramRows<T>(
  queryFactory: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: QueryError | null }>,
): Promise<{ data: T[]; error: QueryError | null }> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const to = from + PROGRAM_QUERY_PAGE_SIZE - 1;
    const { data, error } = await queryFactory(from, to);

    if (error) {
      return { data: rows, error };
    }

    const page = data ?? [];
    rows.push(...page);

    if (page.length < PROGRAM_QUERY_PAGE_SIZE) {
      return { data: rows, error: null };
    }

    from += PROGRAM_QUERY_PAGE_SIZE;
  }
}

export async function loadYksProgramTargets(
  preferredYear = 2026,
): Promise<ProgramLoadResult<YksProgramTarget>> {
  const yearListQuery = await fetchAllProgramRows<{ year: number }>((from, to) =>
    supabase
      .from('yks_program_targets')
      .select('year')
      .range(from, to),
  );

  if (yearListQuery.error) {
    return {
      dataYear: preferredYear,
      error:
        'YKS program verileri okunamadı. Lütfen veritabanı tablosunu kontrol et.',
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
      error:
        'YKS hedef program verisi bulunamadı. Supabase tablosuna resmi veriler yüklenmeli.',
      rows: [],
    };
  }

  const preferredCount = counts.get(preferredYear) ?? 0;
  const selectedYear =
    preferredCount >= MINIMUM_FULL_YKS_ROW_COUNT
      ? preferredYear
      : availableYears.find(
          (year) => (counts.get(year) ?? 0) >= MINIMUM_FULL_YKS_ROW_COUNT,
        ) ?? availableYears[0];

  const selectedRowsQuery = await fetchAllProgramRows<YksProgramTarget>((from, to) =>
    supabase
      .from('yks_program_targets')
      .select('*')
      .eq('year', selectedYear)
      .order('base_rank', { ascending: true })
      .range(from, to),
  );

  if (selectedRowsQuery.error) {
    return {
      dataYear: selectedYear,
      error:
        'YKS program verileri okunamadı. Lütfen veritabanı tablosunu kontrol et.',
      rows: [],
    };
  }

  const rows = (selectedRowsQuery.data || []) as YksProgramTarget[];

  return {
    dataYear: selectedYear,
    error: rows.length
      ? ''
      : 'YKS hedef program verisi bulunamadı. Supabase tablosuna resmi veriler yüklenmeli.',
    rows,
  };
}

export async function loadLgsSchoolTargets(
  preferredYear = 2026,
): Promise<ProgramLoadResult<LgsSchoolTarget>> {
  const yearListQuery = await fetchAllProgramRows<{ year: number }>((from, to) =>
    supabase
      .from('lgs_school_targets')
      .select('year')
      .range(from, to),
  );

  if (yearListQuery.error) {
    return {
      dataYear: preferredYear,
      error: 'LGS okul verileri okunamadı. Lütfen veritabanı tablosunu kontrol et.',
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
      error: 'LGS hedef okul verisi bulunamadı. Supabase tablosuna resmi veriler yüklenmeli.',
      rows: [],
    };
  }

  const preferredCount = counts.get(preferredYear) ?? 0;
  const selectedYear =
    preferredCount >= MINIMUM_FULL_LGS_ROW_COUNT
      ? preferredYear
      : availableYears.find((year) => (counts.get(year) ?? 0) >= MINIMUM_FULL_LGS_ROW_COUNT) ??
        availableYears[0];

  const historyYears = availableYears
    .filter((year) => year <= selectedYear)
    .slice(0, 5);

  const selectedRowsQuery = await fetchAllProgramRows<LgsSchoolTarget>((from, to) =>
    supabase
      .from('lgs_school_targets')
      .select('*')
      .in('year', historyYears)
      .order('year', { ascending: false })
      .order('base_score', { ascending: false })
      .range(from, to),
  );

  if (selectedRowsQuery.error) {
    return {
      dataYear: selectedYear,
      error: 'LGS okul verileri okunamadı. Lütfen veritabanı tablosunu kontrol et.',
      historyYears,
      rows: [],
    };
  }

  const rows = (selectedRowsQuery.data || []) as LgsSchoolTarget[];

  return {
    dataYear: selectedYear,
    error: rows.length
      ? ''
      : 'LGS hedef okul verisi bulunamadı. Supabase tablosuna resmi veriler yüklenmeli.',
    historyYears,
    rows,
  };
}
