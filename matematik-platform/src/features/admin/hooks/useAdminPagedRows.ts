import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export const ADMIN_LIST_PAGE_SIZE = 40;

export function useAdminPagedRows<TRow extends { id: string }>(
  table: string,
  refreshSource: unknown,
) {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<TRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    void (async () => {
      try {
        const result = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(page * ADMIN_LIST_PAGE_SIZE, (page + 1) * ADMIN_LIST_PAGE_SIZE - 1);

        if (!active) return;
        if (result.error || result.count === null) {
          setError(true);
        } else if (page > 0 && page * ADMIN_LIST_PAGE_SIZE >= result.count) {
          setPage(Math.max(0, Math.ceil(result.count / ADMIN_LIST_PAGE_SIZE) - 1));
        } else {
          setRows((result.data || []) as TRow[]);
          setTotal(result.count);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [page, refreshSource, retryCount, table]);

  return {
    error,
    loading,
    page,
    pageSize: ADMIN_LIST_PAGE_SIZE,
    retry: () => setRetryCount((value) => value + 1),
    rows,
    setPage,
    total,
  };
}
