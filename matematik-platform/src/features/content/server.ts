import 'server-only';

import { hasSupabasePublicEnv } from '@/lib/env.server';
import { createCachedPublicSupabaseClient } from '@/lib/supabase/server';
import type { ContentDocument } from '@/types';
import type { ContentGradeFilter } from '@/features/content/types';
import {
  CONTENT_TYPE_MAPPING,
  getContentTypeQueryTypes,
} from '@/features/content/constants';
import { sortWorksheetDocuments } from '@/features/content/worksheet-display';
import {
  getContentDatabaseGrade,
  sortContentDocumentsByNewest,
} from '@/features/content/utils';
import { createLogger } from '@/lib/logger';
import { runContentRead } from './read-timeout';

const log = createLogger('content:server');

export const getInitialContentGradeFilter =
  async (): Promise<ContentGradeFilter> => {
    // Tüm içerikler sınıflar arası kısıtlama olmaksızın herkese açıktır.
    return 'all';
  };

export const loadInitialContentDocuments = async (
  page: number,
  pageSize: number,
  gradeFilter: ContentGradeFilter,
  typeFilter: string,
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  if (!hasSupabasePublicEnv()) {
    return { count: 0, documents: [], isHydrated: false };
  }

  const serverSupabase = createCachedPublicSupabaseClient('content-documents');
  const normalizedTypeFilter = CONTENT_TYPE_MAPPING[typeFilter] || typeFilter;
  const queryTypes = getContentTypeQueryTypes(normalizedTypeFilter);
  try {
    let countQuery = serverSupabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    if (gradeFilter !== 'all') {
      countQuery = countQuery.contains('grade', [
        getContentDatabaseGrade(gradeFilter),
      ]);
    }

    if (typeFilter !== 'all') {
      countQuery =
        queryTypes.length === 1
          ? countQuery.eq('type', queryTypes[0])
          : countQuery.in('type', queryTypes);
    }

    let dataQuery = serverSupabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (gradeFilter !== 'all') {
      dataQuery = dataQuery.contains('grade', [
        getContentDatabaseGrade(gradeFilter),
      ]);
    }

    if (typeFilter !== 'all') {
      dataQuery =
        queryTypes.length === 1
          ? dataQuery.eq('type', queryTypes[0])
          : dataQuery.in('type', queryTypes);
    }

    const [{ count, error: countError }, { data, error: dataError }] =
      await Promise.all([countQuery, dataQuery.range(from, to)]);

    if (countError || dataError) {
      log.warn('Supabase query error', { error: countError || dataError });
      return { count: 0, documents: [], isHydrated: false };
    }

    const payload = {
      count: count || 0,
      documents: sortContentDocumentsByNewest(
        (data || []) as ContentDocument[],
      ),
      isHydrated: true,
    };

    return payload;
  } catch (err) {
    log.warn('Unexpected error loading initial content documents', {
      error: err,
    });
    return { count: 0, documents: [], isHydrated: false };
  }
};

// Kazanım grupları tam sınıf listesini gerektirir; istekler ortak süre sınırını paylaşır.
export async function loadInitialWorksheetDocuments(grade: ContentGradeFilter) {
  const empty = {
    count: 0,
    documents: [] as ContentDocument[],
    isHydrated: false,
  };
  if (grade === 'all' || !hasSupabasePublicEnv()) return empty;
  const client = createCachedPublicSupabaseClient('content-documents');
  const pageSize = 250;
  try {
    const documents = await runContentRead(async (signal) => {
      const result: ContentDocument[] = [];
      for (let from = 0; ; from += pageSize) {
        const { data, error } = await client
          .from('documents')
          .select('*')
          .abortSignal(signal)
          .contains('grade', [getContentDatabaseGrade(grade)])
          .in(
            'type',
            Object.keys(CONTENT_TYPE_MAPPING).filter(
              (type) => CONTENT_TYPE_MAPPING[type] === 'yaprak-test',
            ),
          )
          .order('id', { ascending: true })
          .range(from, from + pageSize - 1);
        if (error || !data) throw new Error('Yaprak testler yüklenemedi.');
        result.push(...(data as ContentDocument[]));
        if (data.length < pageSize) return result;
      }
    });
    return {
      count: documents.length,
      documents: sortWorksheetDocuments(documents),
      isHydrated: true,
    };
  } catch (error) {
    log.warn('Initial worksheet query failed', { error });
    return empty;
  }
}
