import 'server-only';

import {
  MINIMUM_FULL_LGS_ROW_COUNT,
} from '@/features/programs/constants';
import type {
  LgsSchoolPageData,
  LgsSchoolTarget,
  LgsSchoolWithHistory,
} from '@/features/programs/types';
import { createServiceRoleClient } from '@/lib/supabase/server';

const PROGRAM_QUERY_PAGE_SIZE = 1000;

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

export async function loadLgsSchoolPageData(
  preferredYear = 2026,
): Promise<LgsSchoolPageData> {
  const supabase = createServiceRoleClient();

  const yearListQuery = await fetchAllProgramRows<{ year: number }>((from, to) =>
    supabase.from('lgs_school_targets').select('year').range(from, to),
  );

  if (yearListQuery.error) {
    return {
      dataYear: preferredYear,
      error: 'LGS okul verileri okunamadi. Lutfen veritabani tablosunu kontrol et.',
      historyYears: [],
      schools: [],
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
        'LGS hedef okul verisi bulunamadi. Supabase tablosuna resmi veriler yuklenmeli.',
      historyYears: [],
      schools: [],
    };
  }

  const preferredCount = counts.get(preferredYear) ?? 0;
  const selectedYear =
    preferredCount >= MINIMUM_FULL_LGS_ROW_COUNT
      ? preferredYear
      : availableYears.find(
          (year) => (counts.get(year) ?? 0) >= MINIMUM_FULL_LGS_ROW_COUNT,
        ) ?? availableYears[0];

  const historyYears = availableYears.filter((year) => year <= selectedYear).slice(0, 5);

  const rowsQuery = await fetchAllProgramRows<LgsSchoolTarget>((from, to) =>
    supabase
      .from('lgs_school_targets')
      .select('*')
      .in('year', historyYears)
      .order('year', { ascending: false })
      .order('base_score', { ascending: false })
      .range(from, to),
  );

  if (rowsQuery.error) {
    return {
      dataYear: selectedYear,
      error: 'LGS okul verileri okunamadi. Lutfen veritabani tablosunu kontrol et.',
      historyYears: [...historyYears].sort((a, b) => a - b),
      schools: [],
    };
  }

  const grouped = new Map<string, LgsSchoolTarget[]>();

  for (const row of rowsQuery.data) {
    const key = `${row.school_name}::${row.province}::${row.district}`;
    const current = grouped.get(key) || [];
    current.push(row);
    grouped.set(key, current);
  }

  const schools = [...grouped.values()]
    .map((rows) => {
      const sortedRows = [...rows].sort((a, b) => b.year - a.year);
      const latestRow = sortedRows.find((row) => row.year === selectedYear) || sortedRows[0];

      if (!latestRow || latestRow.placement_mode !== 'central') {
        return null;
      }

      const school: LgsSchoolWithHistory = {
        id: latestRow.id,
        district: latestRow.district,
        province: latestRow.province,
        school_name: latestRow.school_name,
        school_type: latestRow.school_type,
        placement_mode: latestRow.placement_mode,
        instruction_language: latestRow.instruction_language,
        boarding: latestRow.boarding,
        prep_class: latestRow.prep_class,
        latest_year: latestRow.year,
        base_score: latestRow.base_score,
        national_percentile: latestRow.national_percentile,
        quota_total: latestRow.quota_total,
        source_url: latestRow.source_url,
        source_year: latestRow.source_year,
        history: sortedRows
          .map((row) => ({
            year: row.year,
            base_score: row.base_score,
            national_percentile: row.national_percentile,
            quota_total: row.quota_total,
            source_url: row.source_url,
          }))
          .sort((a, b) => a.year - b.year),
      };

      return school;
    })
    .filter((school): school is LgsSchoolWithHistory => school !== null)
    .sort((a, b) => b.base_score - a.base_score);

  return {
    dataYear: selectedYear,
    error: schools.length
      ? ''
      : 'LGS hedef okul verisi bulunamadi. Supabase tablosuna resmi veriler yuklenmeli.',
    historyYears: [...historyYears].sort((a, b) => a - b),
    schools,
  };
}
