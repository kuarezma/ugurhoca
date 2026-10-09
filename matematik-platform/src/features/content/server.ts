import 'server-only';

import { getServerAuthSnapshot } from '@/lib/auth-snapshot.server';
import { hasSupabasePublicEnv } from '@/lib/env.server';
import { createCachedPublicSupabaseClient } from '@/lib/supabase/server';
import type { ContentDocument } from '@/types';
import type { ContentGradeFilter } from '@/features/content/types';
import {
  CONTENT_TYPE_MAPPING,
  getContentTypeQueryTypes,
} from '@/features/content/constants';
import {
  normalizeContentGrade,
  sortContentDocumentsByNewest,
} from '@/features/content/utils';

export const getInitialContentGradeFilter =
  async (): Promise<ContentGradeFilter> => {
    // Bilinçli olarak imzasız snapshot: yalnızca herkese açık belgelerin
    // (token'sız, önbellekli istemciyle) varsayılan sınıf filtresini seçen bir
    // UX ipucu. Sahte çerez yalnız başka sınıfın açık içeriğini önce gösterir;
    // kişisel veri çekilmez, bu yüzden istek başına doğrulama maliyeti eklenmez.
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
    console.warn('[loadInitialContentDocuments] Unexpected error:', err);
    return { count: 0, documents: [], isHydrated: false };
  }
};
