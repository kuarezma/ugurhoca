import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadInitialContentDocuments,
  loadInitialWorksheetDocuments,
} from './server';

const { mockFrom, mockHasEnv } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockHasEnv: vi.fn(() => true),
}));

vi.mock('@/lib/env.server', () => ({ hasSupabasePublicEnv: mockHasEnv }));
vi.mock('@/lib/auth-snapshot.server', () => ({
  getServerAuthSnapshot: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createCachedPublicSupabaseClient: () => ({ from: mockFrom }),
}));

describe('initial content hydration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasEnv.mockReturnValue(true);
  });

  it('başarılı boş sonucu istemci için geçerli seed olarak işaretler', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: () => Promise.resolve({ count: 0, error: null }),
      })
      .mockReturnValueOnce({
        select: () => ({
          order: () => ({
            range: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      });
    await expect(
      loadInitialContentDocuments(1, 5, 'all', 'all'),
    ).resolves.toEqual({
      count: 0,
      documents: [],
      isHydrated: true,
    });
  });

  it('zaman aşımını başarılı boş sonuçtan ayırır', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: () =>
          Promise.resolve({ count: null, error: { code: '57014' } }),
      })
      .mockReturnValueOnce({
        select: () => ({
          order: () => ({
            range: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      });
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await expect(
        loadInitialContentDocuments(1, 5, 'all', 'all'),
      ).resolves.toEqual({
        count: 0,
        documents: [],
        isHydrated: false,
      });
    } finally {
      warning.mockRestore();
    }
  });

  it('sunucuda bağlantı ayarı yoksa isteği istemcide tekrar denemeye bırakır', async () => {
    mockHasEnv.mockReturnValue(false);
    await expect(
      loadInitialContentDocuments(1, 5, 'all', 'all'),
    ).resolves.toEqual({
      count: 0,
      documents: [],
      isHydrated: false,
    });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it.each([
    [5, 5],
    ['Mezun', 12],
  ] as const)(
    'yaprak test sınıfının bütün sayfalarını getirir (%s)',
    async (grade, databaseGrade) => {
      const page = Array.from({ length: 250 }, (_, i) => ({
        id: String(i),
        title: `Test ${i}`,
        type: 'yaprak-test',
        grade: [databaseGrade],
      }));
      const range = vi
        .fn()
        .mockResolvedValueOnce({ data: page, error: null })
        .mockResolvedValueOnce({
          data: [{ ...page[0], id: 'last' }],
          error: null,
        });
      const query = {
        select: vi.fn(),
        abortSignal: vi.fn(),
        contains: vi.fn(),
        in: vi.fn(),
        order: vi.fn(),
        range,
      };
      for (const key of [
        'select',
        'abortSignal',
        'contains',
        'in',
        'order',
      ] as const)
        query[key].mockReturnValue(query);
      mockFrom.mockReturnValue(query);
      const result = await loadInitialWorksheetDocuments(grade);
      expect(result.isHydrated).toBe(true);
      expect(result.documents).toHaveLength(251);
      expect(range.mock.calls).toEqual([
        [0, 249],
        [250, 499],
      ]);
      expect(query.abortSignal).toHaveBeenCalledWith(expect.any(AbortSignal));
      expect(query.contains).toHaveBeenCalledWith('grade', [databaseGrade]);
      expect(query.order).toHaveBeenCalledWith('id', { ascending: true });
    },
  );

  it('yaprak test sınıfındaki başarılı boş seed ile sorgu hatasını ayırır', async () => {
    const range = vi
      .fn()
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('offline') });
    const query = {
      select: vi.fn(),
      abortSignal: vi.fn(),
      contains: vi.fn(),
      in: vi.fn(),
      order: vi.fn(),
      range,
    };
    for (const key of [
      'select',
      'abortSignal',
      'contains',
      'in',
      'order',
    ] as const)
      query[key].mockReturnValue(query);
    mockFrom.mockReturnValue(query);
    expect((await loadInitialWorksheetDocuments(5)).isHydrated).toBe(true);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect((await loadInitialWorksheetDocuments(5)).isHydrated).toBe(false);
    } finally {
      warning.mockRestore();
    }
  });
});
