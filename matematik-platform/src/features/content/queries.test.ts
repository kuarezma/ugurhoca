import {
  clearContentDocumentCache,
  loadContentDocuments,
  prefetchContentDocuments,
} from '@/features/content/queries';
import { CONTENT_PAGE_SIZE } from '@/features/content/constants';
import { supabase } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('content queries', () => {
  beforeEach(() => {
    clearContentDocumentCache();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    ['a,b', '(title.ilike."%a,b%",description.ilike."%a,b%")'],
    [
      'Kesirler (1, 2)',
      '(title.ilike."%Kesirler (1, 2)%",description.ilike."%Kesirler (1, 2)%")',
    ],
    [
      '"kesir" \\ oran',
      '(title.ilike."%\\"kesir\\" \\\\ oran%",description.ilike."%\\"kesir\\" \\\\ oran%")',
    ],
  ])(
    'özel karakterli aramayı tek filtre değeri olarak gönderir: %s',
    async (searchTerm, expectedFilter) => {
      const requests: URL[] = [];
      const client = createClient('https://example.test', 'test-key', {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: async (input, init) => {
            requests.push(new URL(String(input)));
            return new Response(init?.method === 'HEAD' ? null : '[]', {
              headers: {
                'content-type': 'application/json',
                'content-range': '*/0',
              },
            });
          },
        },
      });
      vi.mocked(supabase.from).mockImplementation(
        (table: string) => client.from(table) as never,
      );

      await expect(
        loadContentDocuments(1, 5, 'all', 'all', {
          searchTerm,
          onlySolution: true,
        }),
      ).resolves.toEqual({ count: 0, documents: [] });

      expect(requests).toHaveLength(2);
      for (const request of requests) {
        expect(request.searchParams.getAll('or')).toEqual([
          expectedFilter,
          '(solution_url.neq.,answer_key_text.neq.)',
        ]);
      }
    },
  );

  it('kaynak hatasını boş liste diye önbelleğe almadan yeniden dener', async () => {
    const countQuery = { abortSignal: vi.fn() };
    const dataQuery = { order: vi.fn(), abortSignal: vi.fn(), range: vi.fn() };
    dataQuery.order.mockReturnValue(dataQuery);
    dataQuery.abortSignal.mockReturnValue(dataQuery);
    vi.mocked(supabase.from).mockImplementation(
      () =>
        ({
          select: (_fields: string, options?: { head?: boolean }) =>
            options?.head ? countQuery : dataQuery,
        }) as never,
    );
    countQuery.abortSignal.mockResolvedValueOnce({
      count: null,
      error: { code: '57014' },
    });
    dataQuery.range.mockResolvedValueOnce({
      data: null,
      error: { code: '57014' },
    });
    await expect(loadContentDocuments(1, 5, 'all', 'all')).rejects.toThrow(
      'İçerikler yüklenemedi',
    );
    countQuery.abortSignal.mockResolvedValueOnce({ count: 1, error: null });
    dataQuery.range.mockResolvedValueOnce({
      data: [{ id: 'recovered' }],
      error: null,
    });
    await expect(
      loadContentDocuments(1, 5, 'all', 'all'),
    ).resolves.toMatchObject({ count: 1 });
    expect(supabase.from).toHaveBeenCalledTimes(4);
  });

  it('seeds the first page cache from the prefetch endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              count: 1,
              documents: [
                {
                  grade: [7],
                  id: 'doc-1',
                  title: 'Doğru Orantı',
                  type: 'yaprak-test',
                },
              ],
              grade: 7,
              type: 'yaprak-test',
            },
          }),
          {
            headers: { 'content-type': 'application/json' },
            status: 200,
          },
        ),
      ),
    );

    await prefetchContentDocuments('yaprak-test');

    const result = await loadContentDocuments(
      1,
      CONTENT_PAGE_SIZE,
      7,
      'yaprak-test',
    );

    expect(result).toEqual({
      count: 1,
      documents: [
        {
          grade: [7],
          id: 'doc-1',
          title: 'Doğru Orantı',
          type: 'yaprak-test',
        },
      ],
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
