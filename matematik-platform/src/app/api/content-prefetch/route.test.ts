import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockLogError, mockLoadInitialContentDocuments, mockGetInitialContentGradeFilter } =
  vi.hoisted(() => ({
    mockLogError: vi.fn(),
    mockLoadInitialContentDocuments: vi.fn(),
    mockGetInitialContentGradeFilter: vi.fn(),
  }));

vi.mock('@/features/content/server', () => ({
  loadInitialContentDocuments: mockLoadInitialContentDocuments,
  getInitialContentGradeFilter: mockGetInitialContentGradeFilter,
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    error: mockLogError,
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { GET } from './route';

describe('Content Prefetch Route (/api/content-prefetch)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('başarılı durumda 200 ve içerik listesini döner', async () => {
    mockGetInitialContentGradeFilter.mockResolvedValue('5');
    mockLoadInitialContentDocuments.mockResolvedValue({
      count: 2,
      documents: [{ id: 'doc-1' }, { id: 'doc-2' }],
    });

    const req = new Request('https://ugurhoca.com/api/content-prefetch?type=worksheet');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.count).toBe(2);
    expect(body.data.grade).toBe('5');
  });

  it('hata oluştuğunda ham error.message sızdırılmaz, genel Türkçe mesaj döner ve logger çağrılır', async () => {
    mockGetInitialContentGradeFilter.mockRejectedValue(
      new Error('Internal database connection pool timeout at TCP 5432'),
    );

    const req = new Request('https://ugurhoca.com/api/content-prefetch');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.message).not.toContain('database connection pool');
    expect(body.error.message).not.toContain('TCP 5432');
    expect(body.error.message).toBe('İçerik ön hazırlığı yüklenemedi. Lütfen daha sonra tekrar deneyin.');
    expect(mockLogError).toHaveBeenCalledWith(
      expect.stringContaining('İçerik ön yükleme'),
      expect.any(Error),
    );
  });
});
