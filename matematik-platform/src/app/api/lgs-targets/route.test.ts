import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('server-only', () => ({}));

const { mockEnforceRateLimit, mockGetClientIp, mockLoadLgsSchoolPageData } =
  vi.hoisted(() => ({
    mockEnforceRateLimit: vi.fn(),
    mockGetClientIp: vi.fn(
      (req: Request) => req.headers.get('x-forwarded-for') || '127.0.0.1',
    ),
    mockLoadLgsSchoolPageData: vi.fn(),
  }));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: mockEnforceRateLimit,
  getClientIp: mockGetClientIp,
}));

vi.mock('@/features/programs/server', () => ({
  loadLgsSchoolPageData: mockLoadLgsSchoolPageData,
}));

import { GET } from './route';

describe('GET /api/lgs-targets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockResolvedValue(null);
  });

  it('rate limit aşıldığında rate limit yanıtı döner', async () => {
    mockEnforceRateLimit.mockResolvedValue(
      NextResponse.json({ error: 'Çok fazla istek.' }, { status: 429 }),
    );

    const request = new Request('https://ugurhoca.com/api/lgs-targets');
    const response = await GET(request);

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toBe('Çok fazla istek.');
  });

  it('başarılı okul kataloğu verisinde 200 ve önbellek başlığı döner', async () => {
    const mockData = {
      schools: [
        { id: 'school-1', name: 'Galatasaray Lisesi', baseScore: 494.5 },
      ],
      year: 2026,
    };
    mockLoadLgsSchoolPageData.mockResolvedValue(mockData);

    const request = new Request('https://ugurhoca.com/api/lgs-targets');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=300, s-maxage=3600',
    );
    const body = await response.json();
    expect(body).toEqual({ data: mockData });
    expect(mockLoadLgsSchoolPageData).toHaveBeenCalledWith(2026);
  });

  it('katalog yüklemesinde hata oluştuğunda önbelleğe almayı engeller (no-store)', async () => {
    const mockErrorData = {
      schools: [],
      error: 'Okul verisi yüklenemedi',
    };
    mockLoadLgsSchoolPageData.mockResolvedValue(mockErrorData);

    const request = new Request('https://ugurhoca.com/api/lgs-targets');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const body = await response.json();
    expect(body.data.error).toBe('Okul verisi yüklenemedi');
  });

  it('request nesnesi verilmediğinde unknown IP ile sorunsuz çalışır', async () => {
    mockLoadLgsSchoolPageData.mockResolvedValue({ schools: [] });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockEnforceRateLimit).toHaveBeenCalledWith(
      'lgs-targets',
      'unknown',
      expect.objectContaining({ limit: 60, windowSeconds: 60 }),
    );
  });
});
