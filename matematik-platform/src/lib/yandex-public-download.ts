/**
 * Yandex Disk public link → doğrudan indirme URL’si (tarayıcı ve sunucu için).
 * CORS nedeniyle istemci genelde `/api/yandex-resolve` üzerinden çağırır;
 * sunucu tarafında doğrudan bu fonksiyon kullanılabilir.
 */

// Bu çağrı ana sayfanın sunucu tarafı render'ında (duyuru görselleri için) yapılıyor.
// Zaman aşımı olmadan yavaş/yanıtsız bir Yandex API'si tüm sayfanın HTML'ini
// bekletiyordu. Süre dolarsa orijinal URL'ye düşeriz: görsel yine `/api/image-proxy`
// üzerinden yüklenir, sayfa beklemez.
const RESOLVE_TIMEOUT_MS = 2500;

// Önceden `cache: 'no-store'` ile her ana sayfa isteğinde Yandex'e yeniden
// gidiliyordu — sitenin TTFB'si üçüncü parti bir API'nin yanıt süresine
// bağlıydı. Aynı public link'in çözümlenmiş href'i process ömrü boyunca bir
// süre değişmez; process-içi bir önbellek TTFB'yi Yandex'ten bağımsız hale
// getirir. TTL, Yandex'in imzalı href'inin süresinden belirgin şekilde kısa
// tutulur ki bayat bir bağlantı servis edilmesin.
const CACHE_TTL_MS = 30 * 60 * 1000;

type CacheEntry = { href: string; expiresAt: number };

const resolvedUrlCache = new Map<string, CacheEntry>();
const inFlightResolutions = new Map<string, Promise<string>>();

async function fetchResolvedUrl(url: string): Promise<string> {
  const res = await fetch(
    `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(url)}`,
    { cache: 'no-store', signal: AbortSignal.timeout(RESOLVE_TIMEOUT_MS) },
  );

  const data = (await res.json()) as { href?: string };
  return data?.href || url;
}

export async function resolveYandexPublicDownloadUrl(
  url: string,
): Promise<string> {
  if (!url || !/disk\.yandex|yadi\.sk/i.test(url)) {
    return url;
  }

  const cached = resolvedUrlCache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.href;
  }

  const inFlight = inFlightResolutions.get(url);
  if (inFlight) {
    return inFlight;
  }

  const resolution = (async () => {
    try {
      const href = await fetchResolvedUrl(url);
      resolvedUrlCache.set(url, { expiresAt: Date.now() + CACHE_TTL_MS, href });
      return href;
    } catch {
      // Süre doldu veya Yandex hata verdi: bayat bir önbellek girdisi varsa
      // onu servis etmek, sayfayı bekletmekten veya çözülmemiş linki
      // döndürmekten daha iyidir.
      return cached?.href ?? url;
    } finally {
      inFlightResolutions.delete(url);
    }
  })();

  inFlightResolutions.set(url, resolution);
  return resolution;
}
