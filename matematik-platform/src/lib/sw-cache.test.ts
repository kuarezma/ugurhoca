import { describe, expect, it, vi } from 'vitest';

// public/sw.js CommonJS export sağladığı için require ile yüklenir
import sw from '../../public/sw.js';

describe('Service Worker Cache Yönetimi ve Sürüm Geçişi', () => {
  it('CACHE_NAME ugurhoca-core-v4 ve STATIC_CACHE_NAME ugurhoca-core-v4-static olmalıdır', () => {
    expect(sw.CACHE_NAME).toBe('ugurhoca-core-v4');
    expect(sw.STATIC_CACHE_NAME).toBe('ugurhoca-core-v4-static');
  });

  describe('cleanOldCaches', () => {
    it('önceki sürüm önbelleklerini (ugurhoca-core-v3 vb.) siler ve aktif sürümleri korur', async () => {
      const deletedKeys: string[] = [];
      const mockCaches = {
        keys: vi
          .fn()
          .mockResolvedValue([
            'ugurhoca-core-v2',
            'ugurhoca-core-v3',
            'ugurhoca-core-v3-static',
            'ugurhoca-core-v4',
            'ugurhoca-core-v4-static',
            'unrelated-cache-v1',
          ]),
        delete: vi.fn().mockImplementation((key: string) => {
          deletedKeys.push(key);
          return Promise.resolve(true);
        }),
      };

      await sw.cleanOldCaches(mockCaches as unknown as CacheStorage, [
        sw.CACHE_NAME,
        sw.STATIC_CACHE_NAME,
      ]);

      expect(deletedKeys).toContain('ugurhoca-core-v2');
      expect(deletedKeys).toContain('ugurhoca-core-v3');
      expect(deletedKeys).toContain('ugurhoca-core-v3-static');
      expect(deletedKeys).toContain('unrelated-cache-v1');
      expect(deletedKeys).not.toContain('ugurhoca-core-v4');
      expect(deletedKeys).not.toContain('ugurhoca-core-v4-static');
    });
  });

  describe('handleStaticAssetRequest (Network-First with 404 Purge & Offline Fallback)', () => {
    const mockRequest = {
      url: 'https://ugurhoca.com/_next/static/chunks/app-12345.js',
      destination: 'script',
      method: 'GET',
    } as unknown as Request;

    it('ağ yanıtı 200 olduğunda önbelleği günceller ve ağ yanıtını döndürür', async () => {
      const mockPut = vi.fn().mockResolvedValue(undefined);
      const mockCache = {
        put: mockPut,
        delete: vi.fn(),
      };
      const mockCaches = {
        open: vi.fn().mockResolvedValue(mockCache),
        match: vi.fn(),
      };

      const mockResponse = {
        status: 200,
        clone: vi.fn().mockReturnValue({ status: 200 }),
      };
      const mockFetch = vi
        .fn()
        .mockResolvedValue(mockResponse as unknown as Response);

      const result = await sw.handleStaticAssetRequest(
        mockRequest,
        mockCaches as unknown as CacheStorage,
        mockFetch,
      );

      expect(mockFetch).toHaveBeenCalledWith(mockRequest);
      expect(mockCaches.open).toHaveBeenCalledWith(sw.STATIC_CACHE_NAME);
      expect(mockPut).toHaveBeenCalledWith(mockRequest, expect.any(Object));
      expect(result).toBe(mockResponse);
    });

    it('ağ yanıtı 404 döndüğünde bayat chunkı önbellekten temizler ve 404 döndürür', async () => {
      const mockDelete = vi.fn().mockResolvedValue(true);
      const mockCache = {
        put: vi.fn(),
        delete: mockDelete,
      };
      const mockCaches = {
        open: vi.fn().mockResolvedValue(mockCache),
        match: vi.fn(),
      };

      const mock404Response = {
        status: 404,
      };
      const mockFetch = vi
        .fn()
        .mockResolvedValue(mock404Response as unknown as Response);

      const result = await sw.handleStaticAssetRequest(
        mockRequest,
        mockCaches as unknown as CacheStorage,
        mockFetch,
      );

      expect(mockFetch).toHaveBeenCalledWith(mockRequest);
      expect(mockCaches.open).toHaveBeenCalledWith(sw.STATIC_CACHE_NAME);
      expect(mockDelete).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mock404Response);
    });

    it('ağ hatası durumunda önbellekteki kaydı fallback olarak döndürür', async () => {
      const cachedResponse = { status: 200, body: 'cached-js' };
      const mockCaches = {
        open: vi.fn(),
        match: vi.fn().mockResolvedValue(cachedResponse),
      };

      const mockFetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      const result = await sw.handleStaticAssetRequest(
        mockRequest,
        mockCaches as unknown as CacheStorage,
        mockFetch,
      );

      expect(mockFetch).toHaveBeenCalledWith(mockRequest);
      expect(mockCaches.match).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(cachedResponse);
    });
  });
});
