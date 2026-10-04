/* eslint-disable */
/**
 * Service Worker Sürüm Artırma Prosedürü:
 * 1. CACHE_NAME değerini artırın (örn: 'ugurhoca-core-v2' -> 'ugurhoca-core-v3').
 * 2. 'activate' dinleyicisi CACHE_NAME ile eşleşmeyen önceki tüm önbellekleri siler.
 * 3. CORE_ASSETS içindeki tüm yolların public/ altında fiziksel olarak var olduğunu doğrulayın
 *    (eksik bir dosya install anında cache.addAll işlemini başarısız kılar).
 */
const CACHE_NAME = 'ugurhoca-core-v3';
const OFFLINE_URL = '/offline.html';

const CORE_ASSETS = [
  OFFLINE_URL,
  '/favicon.ico',
  '/icon-512.png',
];

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
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
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

// 1. Kurulum: Kritik statik varlıkları ve offline sayfasını önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch((err) => {
        console.error('[SW] Cache addAll hatası:', err);
      })
  );
  self.skipWaiting();
});

// 2. Etkinleştirme: Eski önbellek sürümlerini temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 3. İstek Yakalama & Akıllı Önbellek Stratejisi
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Sadece aynı kökenli (same-origin) GET isteklerini işle
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API ve dinamik servis çağrılarını doğrudan ağa yönlendir (hiç önbelleklenmez)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/monitoring')) {
    return;
  }

  // Statik Varlıklar (CSS, JS, Font, Resim, /_next/static/): Cache-First
  if (isStaticAsset(request, url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Navigasyon / HTML Sayfa İstekleri
  if (request.mode === 'navigate' || request.destination === 'document') {
    // Oturum gerektiren rotalar: ASLA cache'e yazılmaz ve ASLA cache'ten okunmaz
    // Yalnızca ağdan çekilir; ağ yoksa doğrudan offline sayfası döndürülür
    if (isAuthRoute(url.pathname)) {
      event.respondWith(
        fetch(request).catch(() => caches.match(OFFLINE_URL))
      );
      return;
    }

    // Halka açık sayfalar da SSR'da oturum çerezine göre kişiselleşebilir
    // (ör. /icerikler); paylaşılan cihazda önceki kullanıcının HTML'i
    // görünmesin diye hiçbir navigasyon önbelleğe yazılmaz.
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});

// Test ortamı (Node/Vitest) için dışa aktarma (tarayıcıda etkisizdir)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_NAME,
    OFFLINE_URL,
    CORE_ASSETS,
    AUTH_ROUTES,
    isAuthRoute,
    isStaticAsset,
  };
}
