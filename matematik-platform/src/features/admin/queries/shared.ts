import { createLogger } from '@/lib/logger';
import type { Session } from '@supabase/supabase-js';
import type { AdminUser } from '@/features/admin/types';

export const ADMIN_QUERY_LIMIT = 2000;
export const ADMIN_USERS_QUERY_LIMIT = 5000;
export const log = createLogger('admin-queries');

// Keep the dashboard API unchanged while reading every page of activity rows.
export const loadAllAdminRows = async <TRow>(
  queryPage: (
    from: number,
    to: number,
  ) => PromiseLike<{
    data: TRow[] | null;
    error: unknown;
  }>,
) => {
  const pageSize = 500;
  const rows: TRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await queryPage(from, from + pageSize - 1);
    if (error) {
      log.warn('Admin kayıtları tam yüklenemedi; kısmi sonuç kullanılmadı.', {
        error,
      });
      return { data: null, error };
    }
    rows.push(...(data || []));
    if (!data || data.length < pageSize) return { data: rows, error: null };
  }
};

export type ResolveAdminAuthResult =
  | { status: 'ok'; session: Session; user: AdminUser }
  | { status: 'unauthenticated' | 'unauthorized' };

export type RouteErrorLike = {
  message: string;
};
