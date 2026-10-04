import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequireAdmin, mockScanCurrentWeek, mockLogError } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockScanCurrentWeek: vi.fn(),
  mockLogError: vi.fn(),
}));

vi.mock('@/lib/api-auth', () => ({
  requireAdmin: mockRequireAdmin,
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

import { POST } from './route';

describe('Admin Worksheet Candidates Discover Week Route (/api/admin-worksheet-candidates/discover-week)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('admin yetkisi yoksa auth hatasını döner', async () => {
    const errorResponse = new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
    mockRequireAdmin.mockResolvedValue({ error: errorResponse });

    const req = new Request('https://ugurhoca.com/api/admin-worksheet-candidates/discover-week', {
      method: 'POST',
    });
    const res = await POST(req);
    expect(res).toBeDefined();
    expect(res!.status).toBe(401);
  });

  it('hata oluştuğunda ham error.message sızdırılmaz ve logger.error çağrılır', async () => {
    mockRequireAdmin.mockResolvedValue({
      serviceRole: {},
      user: { id: 'admin-1', email: 'admin@ugurhoca.com' },
    });
    mockScanCurrentWeek.mockRejectedValue(
      new Error('PostgreSQL connection terminated unexpectedly: ECONNRESET'),
    );

    const req = new Request('https://ugurhoca.com/api/admin-worksheet-candidates/discover-week', {
      method: 'POST',
    });
    const res = await POST(req);
    expect(res).toBeDefined();
    expect(res!.status).toBe(500);
    const body = await res!.json();
    expect(body.error.message).not.toContain('PostgreSQL');
    expect(body.error.message).not.toContain('ECONNRESET');
    expect(body.error.message).toBe('Haftalık test adayı taraması yapılamadı. Lütfen daha sonra tekrar deneyin.');
    expect(mockLogError).toHaveBeenCalledWith(
      expect.stringContaining('Haftalık aday tarama hatası'),
      expect.any(Error),
    );
  });
});
