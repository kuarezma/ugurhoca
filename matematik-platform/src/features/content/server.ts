import 'server-only';

import { getServerAuthSnapshot } from '@/lib/auth-snapshot.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ContentDocument } from '@/types';
import type {
  ContentDocumentsPayload,
  ContentGradeFilter,
} from '@/features/content/types';
import { CONTENT_TYPE_MAPPING } from '@/features/content/constants';
import { normalizeContentGrade } from '@/features/content/utils';

const CONTENT_SERVER_CACHE_TTL_MS = 60_000;

type ContentServerCacheEntry = {
  payload: ContentDocumentsPayload;
  timestamp: number;
};

const contentServerCache = new Map<string, ContentServerCacheEntry>();

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
  }

  let countQuery = serverSupabase
    .from('documents')
    .select('*', { count: 'exact', head: true });

  if (gradeFilter !== 'all') {
    countQuery = countQuery.contains('grade', [gradeFilter]);
  }

  if (typeFilter !== 'all') {
    countQuery = countQuery.eq('type', normalizedTypeFilter);
  }

  let dataQuery = serverSupabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (gradeFilter !== 'all') {
    dataQuery = dataQuery.contains('grade', [gradeFilter]);
  }

  if (typeFilter !== 'all') {
    dataQuery = dataQuery.eq('type', normalizedTypeFilter);
  }

  const [{ count }, { data }] = await Promise.all([
    countQuery,
    dataQuery.range(from, to),
  ]);

  const payload = {
    count: count || 0,
    documents: (data || []) as ContentDocument[],
  };

  if (useCache) {
    contentServerCache.set(cacheKey, {
      payload,
      timestamp: Date.now(),
    });
  }

  return payload;
};
