/**
 * Yandex Disk public link → doğrudan indirme URL’si (tarayıcı ve sunucu için).
 * CORS nedeniyle istemci genelde `/api/yandex-resolve` üzerinden çağırır;
 * sunucu tarafında doğrudan bu fonksiyon kullanılabilir.
 */
export async function resolveYandexPublicDownloadUrl(
  url: string,
): Promise<string> {
  if (!url || !/disk\.yandex|yadi\.sk/i.test(url)) {
    return url;
  }

  try {
    const res = await fetch(
      `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(url)}`,
      { cache: 'no-store' },
    );

    const data = (await res.json()) as { href?: string };
    return data?.href || url;
  } catch {
    return url;
  }
}
