/* eslint-disable */
const CACHE_NAME = 'ugurhoca-core-v2';
const CORE_ASSETS = [
  '/',
  '/icon.svg',
  '/icon-512.png',
  '/favicon.ico',
];

// 1. Kurulum: Kritik statik varlıkları önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
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

  // API, admin ve dinamik servis çağrılarını doğrudan ağa yönlendir
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/monitoring')
  ) {
    return;
  }

  // Statik Varlıklar (CSS, JS, Font, Resim): Cache-First
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.startsWith('/_next/static/')
  ) {
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

  // HTML Sayfaları: Network-First (Ağ yoksa son çalışan önbellek)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match('/')))
    );
  }
});
