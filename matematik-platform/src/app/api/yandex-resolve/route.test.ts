import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('server-only', () => ({}));

const {
  mockEnforceRateLimit,
  mockGetClientIp,
  mockResolveYandexPublicDownloadUrl,
} = vi.hoisted(() => ({
  mockEnforceRateLimit: vi.fn(),
  mockGetClientIp: vi.fn(
    (req: Request) => req.headers.get('x-forwarded-for') || '127.0.0.1',
  ),
  mockResolveYandexPublicDownloadUrl: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: mockEnforceRateLimit,
  getClientIp: mockGetClientIp,
}));

vi.mock('@/lib/yandex-public-download', () => ({
  resolveYandexPublicDownloadUrl: mockResolveYandexPublicDownloadUrl,
}));

import { GET } from './route';

describe('GET /api/yandex-resolve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(null);
  });

  it('rate limit aşıldığında rate limit yanıtı döner', async () => {
    mockEnforceRateLimit.mockResolvedValue(
      NextResponse.json({ error: 'Çok fazla istek.' }, { status: 429 }),
    );

    const request = new Request(
      'https://ugurhoca.com/api/yandex-resolve?url=https://disk.yandex.com.tr/d/test',
    );
    const response = await GET(request);

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toBe('Çok fazla istek.');
  });

  it('url parametresi eksik olduğunda 400 döner', async () => {
    const request = new Request('https://ugurhoca.com/api/yandex-resolve');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing url');
  });

  it('url parametresi boş olduğunda 400 döner', async () => {
    const request = new Request('https://ugurhoca.com/api/yandex-resolve?url=');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing url');
  });

  it('geçerli Yandex bağlantısı verildiğinde indirme URL sini çözer ve 200 döner', async () => {
    const yandexUrl = 'https://disk.yandex.com.tr/d/abcdef123';
    const downloadHref = 'https://downloader.disk.yandex.ru/disk/test-file.pdf';
    mockResolveYandexPublicDownloadUrl.mockResolvedValue(downloadHref);

    const request = new Request(
      `https://ugurhoca.com/api/yandex-resolve?url=${encodeURIComponent(yandexUrl)}`,
      {
        headers: { 'x-forwarded-for': '198.51.100.1' },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ href: downloadHref });
    expect(mockResolveYandexPublicDownloadUrl).toHaveBeenCalledWith(yandexUrl);
    expect(mockEnforceRateLimit).toHaveBeenCalledWith(
      'yandex-resolve',
      '198.51.100.1',
      expect.objectContaining({ limit: 20, windowSeconds: 60 }),
    );
  });

  it('indirme bağlantısı çözülemezse null href döner', async () => {
    mockResolveYandexPublicDownloadUrl.mockResolvedValue(null);

    const request = new Request(
      'https://ugurhoca.com/api/yandex-resolve?url=https://disk.yandex.com.tr/d/notfound',
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ href: null });
  });
});
