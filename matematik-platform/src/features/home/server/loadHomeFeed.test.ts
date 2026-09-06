import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadInitialHomeFeed } from './loadHomeFeed';

const mockFrom = vi.fn();
const mockSelect = vi.fn();

vi.mock('@/lib/env.server', () => ({
  hasSupabasePublicEnv: () => true,
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
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

describe('loadInitialHomeFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockImplementation((table: string) => ({
      select: (...args: unknown[]) => {
        mockSelect(table, ...args);
        return {
          order: () => ({
            limit: () =>
              Promise.resolve({
                data: table === 'announcements' ? announcementRows : [],
                error: null,
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
    vi.doMock('@/lib/env.server', () => ({ hasSupabasePublicEnv: () => false }));

    const { loadInitialHomeFeed: loadWithoutEnv } = await import('./loadHomeFeed');
    await expect(loadWithoutEnv()).resolves.toEqual({ announcements: [] });

    vi.doUnmock('@/lib/env.server');
    vi.resetModules();
  });
});
