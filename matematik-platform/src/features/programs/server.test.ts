import { describe, expect, it, vi } from 'vitest';
import { loadLgsSchoolPageData, loadYksProgramPageData } from './server';
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from '@/lib/supabase/server';

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

describe('LGS server catalog', () => {
  it('loads every page once and keeps the selected year and school history', async () => {
    const rows = Array.from({ length: 2001 }, (_, index) => ({
      id: String(index),
      year: index < 1000 ? 2025 : 2024,
      school_name: `Okul ${index % 1000}`,
      province: 'Ankara',
      district: 'Çankaya',
      placement_mode: 'central',
      base_score: 400,
      school_type: 'Fen',
      national_percentile: 5,
      quota_total: 100,
      source_url: null,
    }));
    const pages: number[] = [];
    const query = {
      select: () => query,
      order: () => query,
      range: (start: number, end: number) => {
        pages.push(start);
        return Promise.resolve({
          data: rows.slice(start, end + 1),
          count: rows.length,
          error: null,
        });
      },
    };
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: () => query,
    } as unknown as ReturnType<typeof createServiceRoleClient>);
    const result = await loadLgsSchoolPageData(2026);
    expect(pages).toEqual([0, 1000, 2000]);
    expect(result.dataYear).toBe(2025);
    expect(result.historyYears).toEqual([2024, 2025]);
    expect(result.schools).toHaveLength(1000);
    expect(
      result.schools
        .find((school) => school.school_name === 'Okul 1')
        ?.history.map((item) => item.year),
    ).toEqual([2024, 2025]);
  });

  it('returns an error when a page fails instead of publishing incomplete results', async () => {
    const query = {
      select: () => query,
      order: () => query,
      range: (start: number) =>
        Promise.resolve(
          start === 0
            ? {
                data: Array.from({ length: 1000 }, (_, id) => ({
                  id: String(id),
                })),
                count: 1001,
                error: null,
              }
            : { data: null, count: null, error: { message: 'unavailable' } },
        ),
    };
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: () => query,
    } as unknown as ReturnType<typeof createServiceRoleClient>);
    const result = await loadLgsSchoolPageData();
    expect(result.schools).toEqual([]);
    expect(result.error).toBeTruthy();
  });
});
