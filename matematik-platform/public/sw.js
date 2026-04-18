const CACHE_PREFIX = "ugur-hoca-v";

async function clearUgurHocaCaches() {
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith(CACHE_PREFIX))
      .map((name) => caches.delete(name)),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await clearUgurHocaCaches();
      await self.clients.claim();
      await self.registration.unregister();

      const clients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: "window",
      });

      for (const client of clients) {
        client.postMessage({ type: "UGUR_HOCA_SW_DISABLED" });
      }
    })(),
  );
});

self.addEventListener("fetch", () => {
  // PWA katmanı geçici olarak kapatıldı. İstekleri tarayıcı ve Next.js yönetsin.
});
