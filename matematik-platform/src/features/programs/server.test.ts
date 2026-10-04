import { describe, expect, it, vi } from 'vitest';
import { loadYksProgramPageData } from './server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

describe('YKS server catalog', () => {
  it('yıl ve kayıt sayfalamasını korur, eksik tercih yılı yerine tam yılı seçer', async () => {
    const pages: [string, number, number][] = [];
    const eq = vi.fn();
    const order = vi.fn();
    const from = vi.fn(() => {
      let columns = '';
      const query = {
        select: (value: string) => {
          columns = value;
          return query;
        },
        eq: (column: string, value: number) => {
          eq(column, value);
          return query;
        },
        order: (column: string, options: unknown) => {
          order(column, options);
          return query;
        },
        range: (start: number, end: number) => {
          pages.push([columns, start, end]);
          const data =
            columns === 'year'
              ? start === 0
                ? Array.from({ length: 1000 }, () => ({ year: 2025 }))
                : [{ year: 2026 }]
              : start === 0
                ? Array.from({ length: 1000 }, (_, id) => ({
                    id: String(id),
                    year: 2025,
                  }))
                : [{ id: 'last', year: 2025 }];
          return Promise.resolve({ data, error: null });
        },
      };
      return query;
    });
    vi.mocked(createServerSupabaseClient).mockReturnValue({
      from,
    } as unknown as ReturnType<typeof createServerSupabaseClient>);
    const data = await loadYksProgramPageData(2026);
    expect(data).toMatchObject({ dataYear: 2025, error: '' });
    expect(data.rows).toHaveLength(1001);
    expect(data.rows.at(-1)?.id).toBe('last');
    expect(pages).toEqual([
      ['year', 0, 999],
      ['year', 1000, 1999],
      ['*', 0, 999],
      ['*', 1000, 1999],
    ]);
    expect(eq).toHaveBeenCalledWith('year', 2025);
    expect(order).toHaveBeenCalledWith('base_rank', { ascending: true });
  });
});
