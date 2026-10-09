import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadInitialContentDocuments } from './server';

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
});
