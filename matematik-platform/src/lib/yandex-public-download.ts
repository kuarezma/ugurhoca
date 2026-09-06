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

export async function resolveYandexPublicDownloadUrl(
  url: string,
): Promise<string> {
  if (!url || !/disk\.yandex|yadi\.sk/i.test(url)) {
    return url;
  }

  try {
    const res = await fetch(
      `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(url)}`,
      { cache: 'no-store', signal: AbortSignal.timeout(RESOLVE_TIMEOUT_MS) },
    );

    const data = (await res.json()) as { href?: string };
    return data?.href || url;
  } catch {
    return url;
  }
}
