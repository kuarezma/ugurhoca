import {
  clearContentDocumentCache,
  loadContentDocuments,
  prefetchContentDocuments,
} from '@/features/content/queries';
import { CONTENT_PAGE_SIZE } from '@/features/content/constants';
import { supabase } from '@/lib/supabase/client';

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
