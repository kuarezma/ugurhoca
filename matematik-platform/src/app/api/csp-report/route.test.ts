import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockEnforceRateLimit, mockGetClientIp } = vi.hoisted(() => ({
  mockEnforceRateLimit: vi.fn(),
  mockGetClientIp: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: mockEnforceRateLimit,
  getClientIp: mockGetClientIp,
}));

import { POST } from './route';

describe('CSP Report Route (/api/csp-report)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normal istekte rate limit kontrolü yapılır ve 204 döner', async () => {
    mockGetClientIp.mockReturnValue('192.168.1.1');
    mockEnforceRateLimit.mockResolvedValue(null);

    const req = new Request('https://ugurhoca.com/api/csp-report', {
      method: 'POST',
      body: JSON.stringify({ 'csp-report': { 'blocked-uri': 'eval' } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(204);
    expect(mockGetClientIp).toHaveBeenCalledWith(req);
    expect(mockEnforceRateLimit).toHaveBeenCalledWith(
      'csp-report',
      '192.168.1.1',
      { limit: 30, windowSeconds: 60 },
    );
  });

  it('rate limit aşıldığında 429 döner ve yanıt gövdesi boştur', async () => {
    mockGetClientIp.mockReturnValue('192.168.1.100');
    const mockRateLimitResponse = new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Retry-After': '45' },
    });
    mockEnforceRateLimit.mockResolvedValue(mockRateLimitResponse);

    const req = new Request('https://ugurhoca.com/api/csp-report', {
      method: 'POST',
      body: JSON.stringify({ 'csp-report': { 'blocked-uri': 'eval' } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    const bodyText = await res.text();
    expect(bodyText).toBe(''); // Gövdesiz 429
    expect(res.headers.get('Retry-After')).toBe('45');
  });
});
