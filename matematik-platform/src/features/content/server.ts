import 'server-only';

import { getServerAuthSnapshot } from '@/lib/auth-snapshot.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ContentDocument } from '@/types';
import type {
  ContentDocumentsPayload,
  ContentGradeFilter,
} from '@/features/content/types';
import {
  CONTENT_TYPE_MAPPING,
  getContentTypeQueryTypes,
} from '@/features/content/constants';
import {
  normalizeContentGrade,
  sortContentDocumentsByNewest,
} from '@/features/content/utils';

const CONTENT_SERVER_CACHE_TTL_MS = 60_000;

type ContentServerCacheEntry = {
  payload: ContentDocumentsPayload;
  timestamp: number;
};

const contentServerCache = new Map<string, ContentServerCacheEntry>();
const inFlightContentPromises = new Map<
  string,
  Promise<ContentDocumentsPayload>
>();

const getServerContentCacheKey = (
  page: number,
  pageSize: number,
  gradeFilter: ContentGradeFilter,
  typeFilter: string,
) => `${page}:${pageSize}:${String(gradeFilter)}:${typeFilter}`;

export const getInitialContentGradeFilter = async (): Promise<ContentGradeFilter> => {
  const snapshot = await getServerAuthSnapshot();

  if (!snapshot || snapshot.isAdmin) {
    return 'all';
  }

  return normalizeContentGrade(snapshot.grade);
};

export const loadInitialContentDocuments = async (
  page: number,
  pageSize: number,
  gradeFilter: ContentGradeFilter,
  typeFilter: string,
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const serverSupabase = createServerSupabaseClient();
  const normalizedTypeFilter = CONTENT_TYPE_MAPPING[typeFilter] || typeFilter;
  const queryTypes = getContentTypeQueryTypes(normalizedTypeFilter);
  const cacheKey = getServerContentCacheKey(
    page,
    pageSize,
    gradeFilter,
    normalizedTypeFilter,
  );
  const useCache = page === 1;

  if (useCache) {
    const cached = contentServerCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CONTENT_SERVER_CACHE_TTL_MS) {
      return cached.payload;
    }

    const inFlight = inFlightContentPromises.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }
  }

  const fetchPromise = (async () => {
    try {
      let countQuery = serverSupabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (gradeFilter !== 'all') {
        countQuery = countQuery.contains('grade', [gradeFilter]);
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
        dataQuery = dataQuery.contains('grade', [gradeFilter]);
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
        console.warn(
          '[loadInitialContentDocuments] Supabase query error:',
          countError || dataError,
        );
        const staleCached = contentServerCache.get(cacheKey);
        if (staleCached) {
          return staleCached.payload;
        }
        return { count: 0, documents: [] };
      }

      const payload = {
        count: count || 0,
        documents: sortContentDocumentsByNewest(
          (data || []) as ContentDocument[],
        ),
      };

      if (useCache) {
        contentServerCache.set(cacheKey, {
          payload,
          timestamp: Date.now(),
        });
      }

      return payload;
    } catch (err) {
      console.warn('[loadInitialContentDocuments] Unexpected error:', err);
      const staleCached = contentServerCache.get(cacheKey);
      if (staleCached) {
        return staleCached.payload;
      }
      return { count: 0, documents: [] };
    }
  })();

  if (useCache) {
    inFlightContentPromises.set(cacheKey, fetchPromise);
  }

  try {
    return await fetchPromise;
  } finally {
    if (useCache) {
      inFlightContentPromises.delete(cacheKey);
    }
  }
};
