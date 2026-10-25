import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadInitialHomeFeed, loadRecentHomeDocuments } from './loadHomeFeed';

const mockFrom = vi.fn();
const mockSelect = vi.fn();

vi.mock('@/lib/env.server', () => ({
  hasSupabasePublicEnv: () => true,
}));

vi.mock('@/lib/supabase/server', () => ({
  createCachedPublicSupabaseClient: () => ({
    from: mockFrom,
  }),
}));

const announcementRows = [
  {
    id: 'a-1',
    created_at: '2026-01-02T00:00:00.000Z',
    image_url: null,
    image_urls: null,
  },
  {
    id: 'a-2',
    created_at: '2026-01-01T00:00:00.000Z',
    image_url: null,
    image_urls: null,
  },
];

const documentRows = [
  {
    id: 'doc-older',
    title: 'Eski Test',
    created_at: '2026-10-01T10:00:00.000Z',
    is_admin_only: false,
  },
  {
    id: 'doc-admin',
    title: 'Öğretmen Özel Testi',
    created_at: '2026-10-20T10:00:00.000Z',
    is_admin_only: true,
  },
  {
    id: 'doc-newer',
    title: 'Yeni Test',
    created_at: '2026-10-15T10:00:00.000Z',
    is_admin_only: false,
  },
];

describe('loadInitialHomeFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockImplementation((table: string) => ({
      select: (...args: unknown[]) => {
        mockSelect(table, ...args);
        return {
          order: () => ({
            limit: () => ({
              abortSignal: () =>
                Promise.resolve({
                  data: table === 'announcements' ? announcementRows : [],
                  error: null,
                }),
            }),
          }),
        };
      },
    }));
  });

  it('yalnızca duyuruları çeker; sayım ve doküman sorgusu yapmaz', async () => {
    const feed = await loadInitialHomeFeed();

    expect(feed.announcements).toHaveLength(2);
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('announcements');
  });

  it('exact count sorgusu çalıştırmaz', async () => {
    // Regresyon: students/quizzes/documents/assignments üzerinde dört ayrı
    // `count: 'exact'` sorgusu her ana sayfa isteğinde tam tablo taramasına yol
    // açıyordu ve sonucu hiçbir bileşen render etmiyordu.
    await loadInitialHomeFeed();

    for (const call of mockSelect.mock.calls) {
      const options = call[2] as { count?: string } | undefined;
      expect(options?.count).toBeUndefined();
    }
  });

  it('Supabase env yoksa boş akış döner', async () => {
    vi.resetModules();
    vi.doMock('@/lib/env.server', () => ({
      hasSupabasePublicEnv: () => false,
    }));

    const { loadInitialHomeFeed: loadWithoutEnv } =
      await import('./loadHomeFeed');
    await expect(loadWithoutEnv()).resolves.toEqual({ announcements: [] });

    vi.doUnmock('@/lib/env.server');
    vi.resetModules();
  });

  it('veri kaynağı hata döndürürse ana sayfayı boş duyuru akışıyla üretir', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          limit: () => ({
            abortSignal: () =>
              Promise.resolve({ data: null, error: { code: '57014' } }),
          }),
        }),
      }),
    });
    await expect(loadInitialHomeFeed()).resolves.toEqual({ announcements: [] });
  });

  it('veri kaynağı isteği reddederse ana sayfa üretimi devam eder', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          limit: () => ({
            abortSignal: () => Promise.reject(new Error('Network failure')),
          }),
        }),
      }),
    });
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await expect(loadInitialHomeFeed()).resolves.toEqual({
        announcements: [],
      });
    } finally {
      warning.mockRestore();
    }
  });
});

describe('loadRecentHomeDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockImplementation((table: string) => ({
      select: (...args: unknown[]) => {
        mockSelect(table, ...args);
        return {
          order: () => ({
            limit: () => ({
              abortSignal: () =>
                Promise.resolve({
                  data:
                    table === 'documents'
                      ? documentRows
                      : table === 'announcements'
                        ? announcementRows
                        : [],
                  error: null,
                }),
            }),
          }),
        };
      },
    }));
  });

  it('dokümanları tarihe göre yeniden eskiye sıralar ve is_admin_only: true olanları filtreler', async () => {
    const docs = await loadRecentHomeDocuments();

    expect(mockFrom).toHaveBeenCalledWith('documents');
    expect(docs).toHaveLength(2);
    expect(docs[0].id).toBe('doc-newer'); // 2026-10-15
    expect(docs[1].id).toBe('doc-older'); // 2026-10-01
    expect(docs.some((d) => d.id === 'doc-admin')).toBe(false);
  });

  it('özel limit parametresini veritabanı sorgusuna iletir', async () => {
    let capturedLimit: number | undefined;
    mockFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          limit: (limit: number) => {
            capturedLimit = limit;
            return {
              abortSignal: () =>
                Promise.resolve({ data: documentRows, error: null }),
            };
          },
        }),
      }),
    });

    await loadRecentHomeDocuments(8);
    expect(capturedLimit).toBe(8);
  });

  it('Supabase env yoksa boş dizi döner', async () => {
    vi.resetModules();
    vi.doMock('@/lib/env.server', () => ({
      hasSupabasePublicEnv: () => false,
    }));

    const { loadRecentHomeDocuments: loadWithoutEnv } =
      await import('./loadHomeFeed');
    await expect(loadWithoutEnv()).resolves.toEqual([]);

    vi.doUnmock('@/lib/env.server');
    vi.resetModules();
  });

  it('veri kaynağı hata döndürürse boş dizi döner', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          limit: () => ({
            abortSignal: () =>
              Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      }),
    });

    await expect(loadRecentHomeDocuments()).resolves.toEqual([]);
  });

  it('veri kaynağı isteği reddederse boş dizi döner', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          limit: () => ({
            abortSignal: () => Promise.reject(new Error('Network failure')),
          }),
        }),
      }),
    });

    await expect(loadRecentHomeDocuments()).resolves.toEqual([]);
  });
});
