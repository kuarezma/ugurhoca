import 'server-only';

import { getServerAuthSnapshot } from '@/lib/auth-snapshot.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ContentDocument } from '@/types';
import type { ContentGradeFilter } from '@/features/content/types';
import { CONTENT_TYPE_MAPPING } from '@/features/content/constants';
import { normalizeContentGrade } from '@/features/content/utils';

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

  return {
    count: count || 0,
    documents: (data || []) as ContentDocument[],
  };
};
