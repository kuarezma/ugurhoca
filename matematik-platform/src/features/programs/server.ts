import 'server-only';
import { unstable_cache } from 'next/cache';

import {
  MINIMUM_FULL_LGS_ROW_COUNT,
  MINIMUM_FULL_YKS_ROW_COUNT,
} from '@/features/programs/constants';
import type {
  LgsSchoolPageData,
  LgsSchoolTarget,
  LgsSchoolWithHistory,
  YksProgramTarget,
} from '@/features/programs/types';
import {
  createServiceRoleClient,
  createServerSupabaseClient,
} from '@/lib/supabase/server';

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

const LGS_PAGE_BATCH_SIZE = 4;

async function fetchLgsPage(
  offset: number,
): Promise<{ rows: LgsSchoolTarget[]; count: number | null }> {
  const supabase = createServiceRoleClient();
  const { data, error, count } = await supabase
    .from('lgs_school_targets')
    .select('*', { count: 'exact' })
    .order('year', { ascending: false })
    .order('base_score', { ascending: false })
    .order('id', { ascending: true })
    .range(offset, offset + PROGRAM_QUERY_PAGE_SIZE - 1);

  if (error || count === null)
    throw new Error('LGS school page could not be loaded');
  return { rows: (data ?? []) as LgsSchoolTarget[], count };
}

// Each page is well below the data cache's item size limit. Errors must not be cached.
const getCachedLgsPage = unstable_cache(fetchLgsPage, ['lgs-school-page-v2'], {
  revalidate: 3600,
  tags: ['lgs-school-targets'],
});

async function fetchLgsSchoolPageDataInternal(
  preferredYear = 2026,
): Promise<LgsSchoolPageData> {
  const loadPage =
    process.env.NODE_ENV === 'test' ? fetchLgsPage : getCachedLgsPage;
  let allRows: LgsSchoolTarget[];
  try {
    const first = await loadPage(0);
    const offsets = Array.from(
      {
        length: Math.max(
          0,
          Math.ceil((first.count ?? 0) / PROGRAM_QUERY_PAGE_SIZE) - 1,
        ),
      },
      (_, index) => (index + 1) * PROGRAM_QUERY_PAGE_SIZE,
    );
    allRows = [...first.rows];
    for (let i = 0; i < offsets.length; i += LGS_PAGE_BATCH_SIZE) {
      const pages = await Promise.all(
        offsets.slice(i, i + LGS_PAGE_BATCH_SIZE).map(loadPage),
      );
      for (const page of pages) {
        if (page.count !== first.count)
          throw new Error('LGS catalog changed during loading');
        allRows.push(...page.rows);
      }
    }
    if (
      allRows.length !== first.count ||
      new Set(allRows.map((row) => row.id)).size !== allRows.length
    ) {
      throw new Error('LGS catalog pages are inconsistent');
    }
  } catch {
    return {
      dataYear: preferredYear,
      error: 'LGS okul verileri okunamadı. Lütfen daha sonra tekrar dene.',
      historyYears: [],
      schools: [],
    };
  }

  const counts = new Map<number, number>();
  for (const row of allRows)
    counts.set(row.year, (counts.get(row.year) ?? 0) + 1);
  const availableYears = [...counts.keys()].sort((a, b) => b - a);

  if (!availableYears.length) {
    return {
      dataYear: preferredYear,
      error:
        'LGS hedef okul verisi bulunamadı. Supabase tablosuna resmi veriler yüklenmeli.',
      historyYears: [],
      schools: [],
    };
  }

  const preferredCount = counts.get(preferredYear) ?? 0;
  const selectedYear =
    preferredCount >= MINIMUM_FULL_LGS_ROW_COUNT
      ? preferredYear
      : (availableYears.find(
          (year) => (counts.get(year) ?? 0) >= MINIMUM_FULL_LGS_ROW_COUNT,
        ) ?? availableYears[0]);

  const historyYears = availableYears
    .filter((year) => year <= selectedYear)
    .slice(0, 5);

  const grouped = new Map<string, LgsSchoolTarget[]>();

  for (const row of allRows) {
    if (!historyYears.includes(row.year)) continue;
    const key = `${row.school_name}::${row.province}::${row.district}`;
    const current = grouped.get(key) || [];
    current.push(row);
    grouped.set(key, current);
  }

  const schools = [...grouped.values()]
    .map((rows) => {
      const sortedRows = [...rows].sort((a, b) => b.year - a.year);
      const latestRow =
        sortedRows.find((row) => row.year === selectedYear) || sortedRows[0];

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
      : 'LGS hedef okul verisi bulunamadı. Supabase tablosuna resmi veriler yüklenmeli.',
    historyYears: [...historyYears].sort((a, b) => a - b),
    schools,
  };
}

export async function loadLgsSchoolPageData(
  preferredYear = 2026,
): Promise<LgsSchoolPageData> {
  return fetchLgsSchoolPageDataInternal(preferredYear);
}

async function fetchYksProgramPageDataInternal(
  preferredYear = 2026,
): Promise<{ dataYear: number; error: string; rows: YksProgramTarget[] }> {
  const supabase = createServerSupabaseClient();
  const yearListQuery = await fetchAllProgramRows<{ year: number }>(
    (from, to) =>
      supabase.from('yks_program_targets').select('year').range(from, to),
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
      : (availableYears.find(
          (year) => (counts.get(year) ?? 0) >= MINIMUM_FULL_YKS_ROW_COUNT,
        ) ?? availableYears[0]);

  const selectedRowsQuery = await fetchAllProgramRows<YksProgramTarget>(
    (from, to) =>
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

const getCachedYksData = unstable_cache(
  async (year: number) => fetchYksProgramPageDataInternal(year),
  ['yks-program-page-data'],
  { revalidate: 3600, tags: ['yks-program-targets'] },
);

export async function loadYksProgramPageData(
  preferredYear = 2026,
): Promise<{ dataYear: number; error: string; rows: YksProgramTarget[] }> {
  if (process.env.NODE_ENV === 'test') {
    return fetchYksProgramPageDataInternal(preferredYear);
  }
  return getCachedYksData(preferredYear);
}
