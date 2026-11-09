import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/env.server', () => ({
  getResendApiKey: vi.fn().mockReturnValue(null),
}));

const mockResetPasswordForEmail = vi.fn();
const mockProfilesSelect = vi.fn();
const mockProfilesEq = vi.fn();
const mockProfilesMaybeSingle = vi.fn();
const mockRpc = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: mockProfilesSelect.mockReturnValue({
            eq: mockProfilesEq.mockReturnValue({
              maybeSingle: mockProfilesMaybeSingle,
            }),
          }),
        };
      }
      return {};
    },
    rpc: mockRpc,
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

import { enforceRateLimit } from '@/lib/rate-limit';

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rate limit aşıldığında rate limit yanıtı döner', async () => {
    const rateLimitResponse = new Response(
      JSON.stringify({ error: 'Çok fazla istek.' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    );
    vi.mocked(enforceRateLimit).mockResolvedValueOnce(rateLimitResponse as never);

    const req = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'test@example.com' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('enforceRateLimit çağrısını failClosed: true opsiyonuyla yapar', async () => {
    const req = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'test@example.com' }),
    });

    await POST(req);
    expect(enforceRateLimit).toHaveBeenCalledWith(
      'forgot-password',
      expect.any(String),
      expect.objectContaining({
        limit: 5,
        windowSeconds: 60,
        failClosed: true,
      }),
    );
  });

  it('geçersiz gövde için 400 döner', async () => {
    const req = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('resetPasswordForEmail hata döndüğünde iç hata mesajını sızdırmaz ve jenerik 500 döner', async () => {
    mockProfilesMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 'student-uuid',
        name: 'Ali Yılmaz',
        email: 'ali@example.com',
      },
      error: null,
    });

    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: { message: 'SMTP internal secret error' },
    });

    const req = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'ali@example.com' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).not.toContain('SMTP internal secret error');
    expect(data.error).toBe(
      'Şifre sıfırlama bağlantısı gönderilemedi. Lütfen daha sonra tekrar deneyin.',
    );
  });

  it('başarılı sıfırlamada jenerik başarı mesajı döner', async () => {
    mockProfilesMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 'student-uuid',
        name: 'Ali Yılmaz',
        email: 'ali@example.com',
      },
      error: null,
    });

    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: null,
    });

    const req = new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'ali@example.com' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Talebiniz alındı');
  });
});
