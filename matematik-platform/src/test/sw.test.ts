import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
// Faz 0 middleware.ts → proxy.ts yeniden adlandırması; hangisi varsa matcher oradan okunur.
const routeGuardModules = import.meta.glob('../{proxy,middleware}.ts', {
  eager: true,
}) as unknown as Record<string, { config: { matcher: string[] } }>;
const middlewareConfig = Object.values(routeGuardModules)[0].config;

const require = createRequire(import.meta.url);

type ServiceWorkerModule = {
  CACHE_NAME: string;
  OFFLINE_URL: string;
  CORE_ASSETS: string[];
  AUTH_ROUTES: string[];
  isAuthRoute: (pathname: string) => boolean;
  isStaticAsset: (request: { destination?: string }, pathname: string) => boolean;
};

const swPath = path.resolve(__dirname, '../../public/sw.js');
const swCode = fs.readFileSync(swPath, 'utf-8');
const swModule = require('../../public/sw.js') as ServiceWorkerModule;

interface MockInstallEvent {
  waitUntil: (p: Promise<unknown>) => void;
}

interface MockActivateEvent {
  waitUntil: (p: Promise<unknown>) => void;
}

interface MockFetchEvent {
  request: {
    url: string;
    method: string;
    mode: string;
    destination: string;
  };
  respondWith: (p: Promise<unknown>) => void;
}

describe('Service Worker (public/sw.js) Birim ve Entegrasyon Testleri', () => {
  describe('Statik Dosya Varlığı ve Doğrulama (Madde 3)', () => {
    it('CORE_ASSETS içindeki tüm dosyalar public/ dizininde fiziksel olarak bulunmalıdır', () => {
      expect(swModule.CORE_ASSETS.length).toBeGreaterThan(0);
      const publicDir = path.resolve(__dirname, '../../public');

      for (const assetPath of swModule.CORE_ASSETS) {
        const relativePath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
        const fullPath = path.join(publicDir, relativePath);
        expect(
          fs.existsSync(fullPath),
          `CORE_ASSET diskte bulunamadı: ${assetPath} (aradığı yer: ${fullPath})`
        ).toBe(true);
      }
    });

    it('CORE_ASSETS içinde var olmayan /icon.svg bulunmamalıdır', () => {
      expect(swModule.CORE_ASSETS).not.toContain('/icon.svg');
    });

    it('CORE_ASSETS içinde /offline.html bulunmalıdır', () => {
      expect(swModule.CORE_ASSETS).toContain('/offline.html');
      expect(fs.existsSync(path.resolve(__dirname, '../../public/offline.html'))).toBe(true);
    });
  });

  describe('Oturum Rotaları Senkronizasyonu (Madde 1)', () => {
    it('sw.js AUTH_ROUTES listesi src/proxy.ts (eski adı middleware.ts) matcher içindeki tüm korumalı rotaları kapsamalıdır', () => {
      const middlewareProtectedRoutes = middlewareConfig.matcher
        .filter((pattern) => pattern.startsWith('/') && !pattern.includes('%5'))
        .map((pattern) => pattern.replace('/:path*', ''));

      for (const route of middlewareProtectedRoutes) {
        expect(
          swModule.AUTH_ROUTES,
          `AUTH_ROUTES '${route}' rotasını içermelidir (middleware.ts ile senkron)`
        ).toContain(route);
      }
    });

    it('isAuthRoute doğru rota eşleşmelerini ve alt yolları tespit etmelidir', () => {
      expect(swModule.isAuthRoute('/profil')).toBe(true);
      expect(swModule.isAuthRoute('/profil/ayarlar')).toBe(true);
      expect(swModule.isAuthRoute('/odevler')).toBe(true);
      expect(swModule.isAuthRoute('/odevler/123')).toBe(true);
      expect(swModule.isAuthRoute('/testler')).toBe(true);
      expect(swModule.isAuthRoute('/testler/lgs-deneme')).toBe(true);
      expect(swModule.isAuthRoute('/admin')).toBe(true);
      expect(swModule.isAuthRoute('/admin/sorular')).toBe(true);
      expect(swModule.isAuthRoute('/canli-ders')).toBe(true);
      expect(swModule.isAuthRoute('/canli-ders/d/oda-1')).toBe(true);

      // Oturumsuz / halka açık rotalar
      expect(swModule.isAuthRoute('/')).toBe(false);
      expect(swModule.isAuthRoute('/icerikler')).toBe(false);
      expect(swModule.isAuthRoute('/araclar')).toBe(false);
      expect(swModule.isAuthRoute('/programlar')).toBe(false);
      expect(swModule.isAuthRoute('/giris')).toBe(false);
      expect(swModule.isAuthRoute('/kayit')).toBe(false);
      // Yanıltıcı benzer prefix'ler auth rotası sayılmamalıdır
      expect(swModule.isAuthRoute('/profil-avatar.png')).toBe(false);
      expect(swModule.isAuthRoute('/admin-logo.png')).toBe(false);
    });
  });

  describe('Service Worker Global Çevre ve Fetch Handler Davranışı', () => {
    let installListener: ((event: MockInstallEvent) => void) | undefined;
    let activateListener: ((event: MockActivateEvent) => void) | undefined;
    let fetchListener: ((event: MockFetchEvent) => void) | undefined;

    let mockCaches: {
      open: ReturnType<typeof vi.fn>;
      match: ReturnType<typeof vi.fn>;
      keys: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    let mockCacheInstance: {
      addAll: ReturnType<typeof vi.fn>;
      put: ReturnType<typeof vi.fn>;
      match: ReturnType<typeof vi.fn>;
    };
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      installListener = undefined;
      activateListener = undefined;
      fetchListener = undefined;

      mockCacheInstance = {
        addAll: vi.fn().mockResolvedValue(undefined),
        put: vi.fn().mockResolvedValue(undefined),
        match: vi.fn().mockResolvedValue(null),
      };
      mockCaches = {
        open: vi.fn().mockResolvedValue(mockCacheInstance),
        match: vi.fn().mockResolvedValue(null),
        keys: vi.fn().mockResolvedValue(['ugurhoca-core-v2', 'ugurhoca-core-v3']),
        delete: vi.fn().mockResolvedValue(true),
      };
      mockFetch = vi.fn();

      const mockSelf = {
        location: { origin: 'https://matematik.local' },
        addEventListener: vi.fn((event: string, handler: unknown) => {
          if (event === 'install') {
            installListener = handler as (e: MockInstallEvent) => void;
          } else if (event === 'activate') {
            activateListener = handler as (e: MockActivateEvent) => void;
          } else if (event === 'fetch') {
            fetchListener = handler as (e: MockFetchEvent) => void;
          }
        }),
        skipWaiting: vi.fn(),
        clients: {
          claim: vi.fn(),
        },
      };

      // Service worker betiğini mock global ortamında çalıştır
      const runSW = new Function('self', 'caches', 'fetch', swCode);
      runSW(mockSelf, mockCaches, mockFetch);
    });

    it('install olayı CORE_ASSETS önbelleğe almalı ve skipWaiting çağırmalıdır', async () => {
      expect(installListener).toBeDefined();
      let waitUntilPromise: Promise<unknown> | null = null;
      installListener?.({
        waitUntil: (p: Promise<unknown>) => {
          waitUntilPromise = p;
        },
      });

      await waitUntilPromise;
      expect(mockCaches.open).toHaveBeenCalledWith(swModule.CACHE_NAME);
      expect(mockCacheInstance.addAll).toHaveBeenCalledWith(swModule.CORE_ASSETS);
    });

    it('activate olayı eski önbellekleri silmeli ve güncel sürümü korumalıdır', async () => {
      expect(activateListener).toBeDefined();
      let waitUntilPromise: Promise<unknown> | null = null;
      activateListener?.({
        waitUntil: (p: Promise<unknown>) => {
          waitUntilPromise = p;
        },
      });

      await waitUntilPromise;
      expect(mockCaches.keys).toHaveBeenCalled();
      // Eski v2 silinmeli, güncel v3 silinmemeli
      expect(mockCaches.delete).toHaveBeenCalledWith('ugurhoca-core-v2');
      expect(mockCaches.delete).not.toHaveBeenCalledWith(swModule.CACHE_NAME);
    });

    it('oturum gerektiren rotalarda (örn. /profil) HTML isteği ASLA önbelleğe yazılmamalı ve okunmamalıdır', async () => {
      const mockNetworkResponse = {
        status: 200,
        clone: vi.fn().mockReturnValue({}),
      };
      mockFetch.mockResolvedValueOnce(mockNetworkResponse);

      let respondWithPromise: Promise<unknown> | null = null;
      const event: MockFetchEvent = {
        request: {
          url: 'https://matematik.local/profil',
          method: 'GET',
          mode: 'navigate',
          destination: 'document',
        },
        respondWith: vi.fn((p: Promise<unknown>) => {
          respondWithPromise = p;
        }),
      };

      fetchListener?.(event);

      expect(event.respondWith).toHaveBeenCalled();
      const response = await respondWithPromise;
      expect(response).toBe(mockNetworkResponse);
      expect(mockFetch).toHaveBeenCalledWith(event.request);
      // ASLA cache.put veya caches.match (request için) çağrılmamalıdır!
      expect(mockCacheInstance.put).not.toHaveBeenCalled();
      expect(mockCaches.match).not.toHaveBeenCalledWith(event.request);
    });

    it('oturum gerektiren rota ağ hatasında offline.html döndürmelidir', async () => {
      const offlineHtmlResponse = { status: 200, text: () => Promise.resolve('Offline') };
      mockFetch.mockRejectedValueOnce(new Error('Ağ bağlantısı yok'));
      mockCaches.match.mockResolvedValueOnce(offlineHtmlResponse);

      let respondWithPromise: Promise<unknown> | null = null;
      const event: MockFetchEvent = {
        request: {
          url: 'https://matematik.local/odevler',
          method: 'GET',
          mode: 'navigate',
          destination: 'document',
        },
        respondWith: vi.fn((p: Promise<unknown>) => {
          respondWithPromise = p;
        }),
      };

      fetchListener?.(event);
      const response = await respondWithPromise;

      expect(response).toBe(offlineHtmlResponse);
      expect(mockCaches.match).toHaveBeenCalledWith('/offline.html');
      expect(mockCacheInstance.put).not.toHaveBeenCalled();
    });

    it('/api/ rotaları hiç önbelleklenmemeli ve respondWith çağrılmamalıdır (doğrudan ağa devir)', () => {
      const event: MockFetchEvent = {
        request: {
          url: 'https://matematik.local/api/auth-session',
          method: 'GET',
          mode: 'cors',
          destination: '',
        },
        respondWith: vi.fn(),
      };

      fetchListener?.(event);
      expect(event.respondWith).not.toHaveBeenCalled();
    });

    it('statik varlıklar (/_next/static/...) Cache-First stratejisi kullanmalıdır', async () => {
      const cachedAsset = { status: 200 };
      mockCaches.match.mockResolvedValueOnce(cachedAsset);

      let respondWithPromise: Promise<unknown> | null = null;
      const event: MockFetchEvent = {
        request: {
          url: 'https://matematik.local/_next/static/chunks/main.js',
          method: 'GET',
          mode: 'cors',
          destination: 'script',
        },
        respondWith: vi.fn((p: Promise<unknown>) => {
          respondWithPromise = p;
        }),
      };

      fetchListener?.(event);
      const response = await respondWithPromise;

      expect(response).toBe(cachedAsset);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('halka açık HTML sayfaları önbelleğe yazılmamalı, ağ hatasında offline.html sayfasına düşmelidir', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      mockCaches.match.mockResolvedValueOnce({ status: 200, isOfflinePage: true });

      let respondWithPromise: Promise<unknown> | null = null;
      const event: MockFetchEvent = {
        request: {
          url: 'https://matematik.local/icerikler',
          method: 'GET',
          mode: 'navigate',
          destination: 'document',
        },
        respondWith: vi.fn((p: Promise<unknown>) => {
          respondWithPromise = p;
        }),
      };

      fetchListener?.(event);
      const response = await respondWithPromise;

      expect(response).toEqual({ status: 200, isOfflinePage: true });
      expect(mockCaches.match).toHaveBeenCalledWith('/offline.html');
      expect(mockCaches.match).toHaveBeenCalledTimes(1);
      expect(mockCacheInstance.put).not.toHaveBeenCalled();
    });

    it('halka açık HTML sayfası ağdan başarıyla gelse bile önbelleğe yazılmamalıdır', async () => {
      mockFetch.mockResolvedValueOnce({ status: 200, clone: vi.fn() });

      let respondWithPromise: Promise<unknown> | null = null;
      const event: MockFetchEvent = {
        request: {
          url: 'https://matematik.local/icerikler',
          method: 'GET',
          mode: 'navigate',
          destination: 'document',
        },
        respondWith: vi.fn((p: Promise<unknown>) => {
          respondWithPromise = p;
        }),
      };

      fetchListener?.(event);
      await respondWithPromise;

      expect(mockCacheInstance.put).not.toHaveBeenCalled();
    });
  });
});
