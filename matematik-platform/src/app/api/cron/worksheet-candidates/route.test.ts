import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockIsAuthorizedCronRequest, mockScanCurrentWeek, mockLogError } = vi.hoisted(() => ({
  mockIsAuthorizedCronRequest: vi.fn(),
  mockScanCurrentWeek: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/cron-auth', () => ({
  isAuthorizedCronRequest: mockIsAuthorizedCronRequest,
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn().mockReturnValue({}),
}));

vi.mock('@/lib/worksheet-candidate-scan', () => ({
  scanCurrentWeekWorksheetCandidates: mockScanCurrentWeek,
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    error: mockLogError,
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { GET } from './route';

describe('Cron Worksheet Candidates Route (/api/cron/worksheet-candidates)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('yetkisiz istekte 401 döner', async () => {
    mockIsAuthorizedCronRequest.mockReturnValue(false);

    const req = new Request('https://ugurhoca.com/api/cron/worksheet-candidates');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('hata oluştuğunda ham error.message sızdırılmaz, genel Türkçe mesaj döner ve logger.error çağrılır', async () => {
    mockIsAuthorizedCronRequest.mockReturnValue(true);
    mockScanCurrentWeek.mockRejectedValue(
      new Error('SSL connection error: decryption failed or bad record mac'),
    );

    const req = new Request('https://ugurhoca.com/api/cron/worksheet-candidates');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).not.toContain('SSL');
    expect(body.error).not.toContain('decryption failed');
    expect(body.error).toBe('Haftalık test adayı taraması yapılamadı. Lütfen daha sonra tekrar deneyin.');
    expect(mockLogError).toHaveBeenCalledWith(
      expect.stringContaining('Haftalık test adayı taraması'),
      expect.any(Error),
    );
  });
});
