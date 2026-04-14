import { GET } from '@/app/api/content-prefetch/route';
import { CONTENT_PAGE_SIZE } from '@/features/content/constants';
import {
  getInitialContentGradeFilter,
  loadInitialContentDocuments,
} from '@/features/content/server';

vi.mock('@/features/content/server', () => ({
  getInitialContentGradeFilter: vi.fn(),
  loadInitialContentDocuments: vi.fn(),
}));

describe('GET /api/content-prefetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns prefetched content using the resolved grade filter', async () => {
    vi.mocked(getInitialContentGradeFilter).mockResolvedValue(7);
    vi.mocked(loadInitialContentDocuments).mockResolvedValue({
      count: 2,
      documents: [
        {
          grade: [7],
          id: 'doc-1',
          title: 'Çarpanlar',
          type: 'yaprak-test',
        },
      ],
    });

    const response = await GET(
      new Request('http://localhost/api/content-prefetch?type=yaprak-test'),
    );

    expect(response.status).toBe(200);
    expect(loadInitialContentDocuments).toHaveBeenCalledWith(
      1,
      CONTENT_PAGE_SIZE,
      7,
      'yaprak-test',
    );
    await expect(response.json()).resolves.toEqual({
      data: {
        count: 2,
        documents: [
          {
            grade: [7],
            id: 'doc-1',
            title: 'Çarpanlar',
            type: 'yaprak-test',
          },
        ],
        grade: 7,
        type: 'yaprak-test',
      },
    });
  });

  it('returns a standardized error payload when prefetch fails', async () => {
    vi.mocked(getInitialContentGradeFilter).mockRejectedValue(
      new Error('snapshot failed'),
    );

    const response = await GET(
      new Request('http://localhost/api/content-prefetch?type=deneme'),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'content_prefetch_failed',
        message: 'snapshot failed',
      },
    });
  });
});
