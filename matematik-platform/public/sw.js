/* eslint-disable */
/**
 * Service Worker Sürüm Artırma Prosedürü:
 * 1. CACHE_NAME değerini artırın (örn: 'ugurhoca-core-v3' -> 'ugurhoca-core-v4').
 * 2. STATIC_CACHE_NAME otomatik olarak `${CACHE_NAME}-static` olur.
 * 3. 'activate' dinleyicisi CACHE_NAME ve STATIC_CACHE_NAME dışındaki tüm eski önbellekleri siler.
 * 4. CORE_ASSETS içindeki tüm yolların public/ altında fiziksel olarak var olduğunu doğrulayın
 *    (eksik bir dosya install anında cache.addAll işlemini başarısız kılar).
 */
const CACHE_NAME = 'ugurhoca-core-v4';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const OFFLINE_URL = '/offline.html';

const CORE_ASSETS = [OFFLINE_URL, '/favicon.ico', '/icon-512.png'];

// src/proxy.ts (eski adı middleware.ts) matcher'ı ile birebir uyumlu korumalı rotalar listesi
const AUTH_ROUTES = [
  '/profil',
  '/odevler',
  '/ilerleme',
  '/canli-ders',
  '/testler',
  '/oyunlar',
  '/meydan-okuma',
  '/odak-pomodoro',
  '/admin',
];

function isAuthRoute(pathname) {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );
}

function isStaticAsset(request, pathname) {
  return (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    pathname.startsWith('/_next/static/')
  );
}

async function cleanOldCaches(
  cacheStorage = caches,
  currentCaches = [CACHE_NAME, STATIC_CACHE_NAME],
) {
  const keys = await cacheStorage.keys();
  const deletes = keys
    .filter((key) => !currentCaches.includes(key))
    .map((key) => cacheStorage.delete(key));
  return Promise.all(deletes);
}

async function handleStaticAssetRequest(
  request,
  cacheStorage = caches,
  fetchFn = fetch,
) {
  try {
    const networkResponse = await fetchFn(request);
    if (networkResponse && networkResponse.status === 200) {
      const clone = networkResponse.clone();
      try {
        const cache = await cacheStorage.open(STATIC_CACHE_NAME);
        await cache.put(request, clone);
      } catch (_) {}
      return networkResponse;
    }
    if (networkResponse && networkResponse.status === 404) {
      // Eski deploy'dan silinmiş bayat chunk; önbellekten de temizle
      try {
        const cache = await cacheStorage.open(STATIC_CACHE_NAME);
        await cache.delete(request);
      } catch (_) {}
      return networkResponse;
    }
    const cached = await cacheStorage.match(request);
    return cached || networkResponse;
  } catch (netErr) {
    // Ağ bağlantısı yoksa önbellekten sun
    const cached = await cacheStorage.match(request);
    if (cached) return cached;
    throw netErr;
  }
}

// Tarayıcı / Service Worker ortamında event dinleyicilerini bağla
if (typeof self !== 'undefined' && 'addEventListener' in self) {
  // 1. Kurulum: Kritik statik varlıkları ve offline sayfasını önbelleğe al
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(CORE_ASSETS))
        .catch((err) => {
          console.error('[SW] Cache addAll hatası:', err);
        }),
    );
    self.skipWaiting();
  });

  // 2. Etkinleştirme: Eski önbellek sürümlerini temizle
  self.addEventListener('activate', (event) => {
    event.waitUntil(cleanOldCaches(caches, [CACHE_NAME, STATIC_CACHE_NAME]));
    if (self.clients && self.clients.claim) {
      self.clients.claim();
    }
  });

  // 3. Mesaj Dinleyicisi (SKIP_WAITING desteği)
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  // 4. İstek Yakalama & Akıllı Önbellek Stratejisi
  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Sadece aynı kökenli (same-origin) GET isteklerini işle
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    // API ve dinamik servis çağrılarını doğrudan ağa yönlendir (hiç önbelleklenmez)
    if (
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/monitoring')
    ) {
      return;
    }

    // Statik Varlıklar (CSS, JS, Font, Resim, /_next/static/): Network-First with Cache Fallback & 404 Purge
    if (isStaticAsset(request, url.pathname)) {
      event.respondWith(handleStaticAssetRequest(request));
      return;
    }

    // Navigasyon / HTML Sayfa İstekleri (her zaman ağ öncelikli, çevrimdışında offline.html)
    if (request.mode === 'navigate' || request.destination === 'document') {
      event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    }
  });
}

// Test ortamı (Node/Vitest) için dışa aktarma (tarayıcıda etkisizdir)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_NAME,
    STATIC_CACHE_NAME,
    OFFLINE_URL,
    CORE_ASSETS,
    AUTH_ROUTES,
    isAuthRoute,
    isStaticAsset,
    cleanOldCaches,
    handleStaticAssetRequest,
  };
}
