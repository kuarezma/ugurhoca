// Uğur Hoca Matematik Platformu - Service Worker (Offline & PWA Support)
const CACHE_NAME = 'ugurhoca-v1';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/apple-icon.png',
  '/araclar',
  '/araclar/ebob-ekok-hesaplayici',
  '/araclar/pisagor-hesaplayici',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('Precache failed for some assets:', err);
      }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Sadece GET isteklerini işle
  if (request.method !== 'GET') return;

  // API, Supabase, LiveKit, Google Drive ve yetkilendirme isteklerini önbelleğe alma (Network Only)
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('livekit.cloud') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('googleusercontent.com')
  ) {
    return;
  }

  // Statik varlıklar (JS, CSS, Fontlar, Görseller) -> Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        }),
      ),
    );
    return;
  }

  // HTML Sayfaları -> Network First, çevrimdışıyken Cache Fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match('/');
          }),
        ),
    );
  }
});
