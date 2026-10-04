import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveYandexPublicDownloadUrl } from './yandex-public-download';

describe('yandex-public-download', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns non-yandex or empty urls untouched', async () => {
    expect(await resolveYandexPublicDownloadUrl('')).toBe('');
    expect(
      await resolveYandexPublicDownloadUrl('https://example.com/test.pdf'),
    ).toBe('https://example.com/test.pdf');
    expect(
      await resolveYandexPublicDownloadUrl('https://drive.google.com/file/d/123'),
    ).toBe('https://drive.google.com/file/d/123');
  });

  it('resolves yandex public url through api and returns direct download href', async () => {
    const yandexUrl = 'https://disk.yandex.com.tr/d/unique-file-123';
    const directHref = 'https://downloader.disk.yandex.net/disk/direct-download-link';

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({ href: directHref }),
      ok: true,
    } as Response);

    const resolved = await resolveYandexPublicDownloadUrl(yandexUrl);
    expect(resolved).toBe(directHref);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(yandexUrl)),
      expect.objectContaining({
        next: { revalidate: 1800 },
      }),
    );

    // Call again to verify cache hit (no additional fetch call)
    const cachedResolved = await resolveYandexPublicDownloadUrl(yandexUrl);
    expect(cachedResolved).toBe(directHref);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent in-flight requests for the same url', async () => {
    const yandexUrl = 'https://yadi.sk/d/concurrent-test-456';
    const directHref = 'https://downloader.disk.yandex.net/disk/concurrent-link';

    let resolvePromise: (value: Response) => void;
    const delayedPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockReturnValue(delayedPromise);

    const call1 = resolveYandexPublicDownloadUrl(yandexUrl);
    const call2 = resolveYandexPublicDownloadUrl(yandexUrl);

    resolvePromise!({
      json: async () => ({ href: directHref }),
      ok: true,
    } as Response);

    const [res1, res2] = await Promise.all([call1, call2]);
    expect(res1).toBe(directHref);
    expect(res2).toBe(directHref);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to original url when fetch throws an error and no cache exists', async () => {
    const yandexUrl = 'https://disk.yandex.com/d/error-file-789';

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('Yandex API timeout'),
    );

    const resolved = await resolveYandexPublicDownloadUrl(yandexUrl);
    expect(resolved).toBe(yandexUrl);
  });

  it('falls back to original url when response json does not contain href', async () => {
    const yandexUrl = 'https://disk.yandex.com/d/missing-href-999';

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({}),
      ok: true,
    } as Response);

    const resolved = await resolveYandexPublicDownloadUrl(yandexUrl);
    expect(resolved).toBe(yandexUrl);
  });
});
