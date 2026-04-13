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
  let selectedYear = preferredYear;

  const preferred = await supabase
    .from('lgs_school_targets')
    .select('*')
    .eq('year', preferredYear)
    .order('base_score', { ascending: false });

  if (preferred.error) {
    return {
      dataYear: preferredYear,
      error: 'LGS okul verileri okunamadi. Lutfen veritabani tablosunu kontrol et.',
      rows: [],
    };
  }

  let rows = (preferred.data || []) as LgsSchoolTarget[];

  if (!rows.length) {
    const latestYearQuery = await supabase
      .from('lgs_school_targets')
      .select('year')
      .order('year', { ascending: false })
      .limit(1);

    const latestYear = latestYearQuery.data?.[0]?.year;

    if (latestYear) {
      selectedYear = latestYear;
      const latestRowsQuery = await supabase
        .from('lgs_school_targets')
        .select('*')
        .eq('year', latestYear)
        .order('base_score', { ascending: false });

      rows = (latestRowsQuery.data || []) as LgsSchoolTarget[];
    }
  }

  return {
    dataYear: selectedYear,
    error: rows.length
      ? ''
      : 'LGS hedef okul verisi bulunamadi. Supabase tablosuna resmi veriler yuklenmeli.',
    rows,
  };
}
