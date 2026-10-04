// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { AUTH_ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth-snapshot';

const mockGetUser = vi.fn();
const mockEnforceRateLimit = vi.fn();

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: (...args: unknown[]) => mockEnforceRateLimit(...args),
  getClientIp: () => '203.0.113.7',
}));

const mockLogError = vi.hoisted(() => vi.fn());

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: mockLogError }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({ auth: { getUser: mockGetUser } }),
}));

import { DELETE, POST } from './route';

const ORIGIN = 'https://ugurhoca.com';
const URL_ = `${ORIGIN}/api/auth/session`;

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request(URL_, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: ORIGIN,
      'sec-fetch-site': 'same-origin',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const del = (headers: Record<string, string> = {}) =>
  new Request(URL_, {
    method: 'DELETE',
    headers: { origin: ORIGIN, 'sec-fetch-site': 'same-origin', ...headers },
  });

const tokenCookie = (res: Response) =>
  res.headers
    .getSetCookie()
    .find((entry) => entry.startsWith(`${AUTH_ACCESS_TOKEN_COOKIE_NAME}=`));

describe('/api/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    mockEnforceRateLimit.mockResolvedValue(null);
  });

  it('geçersiz/süresi dolmuş token için 401 döner ve çerez yazmaz', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('invalid JWT'),
    });

    const res = await POST(post({ access_token: 'forged.jwt.value' }));

    expect(res.status).toBe(401);
    expect(mockGetUser).toHaveBeenCalledWith('forged.jwt.value');
    expect(tokenCookie(res)).toBeUndefined();
  });

  it('gövdede token yoksa veya biçim bozuksa 400 döner, Supabase çağrılmaz', async () => {
    for (const body of [{}, { access_token: '' }, { access_token: 42 }, 'not-json', { access_token: 'x'.repeat(5000) }]) {
      const res = await POST(post(body));
      expect(res.status).toBe(400);
      expect(tokenCookie(res)).toBeUndefined();
    }
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('geçerli token için HttpOnly + SameSite=Lax + Path=/ çerezi yazar', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    const res = await POST(post({ access_token: 'valid.jwt.token' }));

    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    const cookie = tokenCookie(res);
    expect(cookie).toBeDefined();
    expect(cookie).toContain(`${AUTH_ACCESS_TOKEN_COOKIE_NAME}=valid.jwt.token`);
    expect(cookie).toMatch(/;\s*HttpOnly/i);
    expect(cookie).toMatch(/;\s*SameSite=Lax/i);
    expect(cookie).toMatch(/;\s*Path=\//i);
    expect(cookie).toMatch(/;\s*Max-Age=2592000/i);
  });

  it('production ortamında çereze Secure bayrağı ekler', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    const res = await POST(post({ access_token: 'valid.jwt.token' }));

    expect(tokenCookie(res)).toMatch(/;\s*Secure/i);
  });

  it('production dışında Secure bayrağı eklemez (http://localhost geliştirme)', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    const res = await POST(post({ access_token: 'valid.jwt.token' }));

    expect(tokenCookie(res)).not.toMatch(/;\s*Secure/i);
  });

  it.each([
    ['yabancı Origin', { origin: 'https://evil.example' }],
    ['Origin başlığı yok', { origin: '' }],
    ['Sec-Fetch-Site cross-site', { 'sec-fetch-site': 'cross-site' }],
    ['Sec-Fetch-Site same-site (alt alan adı)', { 'sec-fetch-site': 'same-site' }],
  ] as Array<[string, Record<string, string>]>)('çapraz kaynaklı POST isteğini reddeder: %s', async (_label, headers) => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    const request = post({ access_token: 'valid.jwt.token' }, headers);
    if (headers.origin === '') request.headers.delete('origin');

    const res = await POST(request);

    expect(res.status).toBe(403);
    expect(tokenCookie(res)).toBeUndefined();
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('rate limit aşılınca 429 döner ve token doğrulanmaz', async () => {
    mockEnforceRateLimit.mockResolvedValue(
      NextResponse.json({ error: 'limit' }, { status: 429 }),
    );

    const res = await POST(post({ access_token: 'valid.jwt.token' }));

    expect(res.status).toBe(429);
    expect(mockEnforceRateLimit).toHaveBeenCalledWith(
      'auth-session',
      '203.0.113.7',
      expect.objectContaining({ limit: expect.any(Number), windowSeconds: expect.any(Number) }),
    );
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(tokenCookie(res)).toBeUndefined();
  });

  it('Supabase doğrulaması hata fırlatırsa 503 döner ve çerez yazmaz', async () => {
    mockGetUser.mockRejectedValue(new Error('network down'));

    const res = await POST(post({ access_token: 'valid.jwt.token' }));

    expect(res.status).toBe(503);
    expect(tokenCookie(res)).toBeUndefined();
  });

  it('istisnayı loglarken token veya hata metnini hiçbir alana koymaz', async () => {
    mockGetUser.mockRejectedValue(new Error('rejected token valid.jwt.token'));

    await POST(post({ access_token: 'valid.jwt.token' }));

    expect(mockLogError).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(mockLogError.mock.calls[0], (_key, value: unknown) =>
      value instanceof Error ? { message: value.message, stack: value.stack } : value,
    );
    expect(logged).not.toContain('valid.jwt.token');
  });

  it('DELETE çerezi aynı bayraklarla siler', async () => {
    const res = await DELETE(del());

    expect(res.status).toBe(200);
    const cookie = tokenCookie(res);
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(new RegExp(`^${AUTH_ACCESS_TOKEN_COOKIE_NAME}=;`));
    expect(cookie).toMatch(/;\s*Max-Age=0/i);
    expect(cookie).toMatch(/;\s*HttpOnly/i);
    expect(cookie).toMatch(/;\s*Path=\//i);
  });

  it('çapraz kaynaklı DELETE isteğini reddeder', async () => {
    const res = await DELETE(del({ origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' }));

    expect(res.status).toBe(403);
    expect(tokenCookie(res)).toBeUndefined();
  });
});
