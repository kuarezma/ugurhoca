import { describe, expect, it, vi, beforeEach } from 'vitest';

const {
  mockEnforceRateLimit,
  mockGetClientIp,
  mockGetAccessToken,
  mockCreateServerClient,
  mockCreateServiceRoleClient,
} = vi.hoisted(() => ({
  mockEnforceRateLimit: vi.fn(),
  mockGetClientIp: vi.fn(),
  mockGetAccessToken: vi.fn(),
  mockCreateServerClient: vi.fn(),
  mockCreateServiceRoleClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: mockEnforceRateLimit,
  getClientIp: mockGetClientIp,
}));

vi.mock('@/lib/api-auth', () => ({
  getBearerOrCookieAccessToken: mockGetAccessToken,
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: mockCreateServiceRoleClient,
  createServerSupabaseClient: mockCreateServerClient,
}));

import { PATCH } from '@/app/api/content-documents/route';

const DOC_ID = '0b6c7d1e-2f3a-4b5c-8d9e-0f1a2b3c4d5e';

const patchRequest = (body: unknown) =>
  new Request('http://localhost/api/content-documents', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// Service-role istemcisi yalnız sayaç RPC'sine erişir; `from` çağrılırsa
// rota başka tabloya tam yetkiyle dokunuyor demektir.
const makeServiceClient = (
  rpcResult = { data: 15, error: null } as { data: unknown; error: unknown },
) => ({
  from: vi.fn(() => {
    throw new Error('service-role ile tablo erişimi yasak');
  }),
  rpc: vi.fn().mockResolvedValue(rpcResult),
});

const makeAuthClient = (user = null as { id: string } | null) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user },
      error: user ? null : { message: 'invalid' },
    }),
  },
  rpc: vi.fn(),
});

describe('PATCH /api/content-documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetClientIp.mockReturnValue('203.0.113.7');
    mockEnforceRateLimit.mockResolvedValue(null);
    mockGetAccessToken.mockResolvedValue('');
  });

  it('views sayacını yalnız RPC üzerinden, service-role ile artırır', async () => {
    const service = makeServiceClient();
    mockCreateServiceRoleClient.mockReturnValue(service);

    const response = await PATCH(patchRequest({ document_id: DOC_ID, metric: 'views' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: { document_id: DOC_ID, views: 15 },
    });
    expect(service.rpc).toHaveBeenCalledWith('increment_document_counter', {
      counter: 'views',
      doc_id: DOC_ID,
    });
    expect(service.from).not.toHaveBeenCalled();
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });

  it('IP + belge anahtarıyla rate limit uygular ve aşımda 429 döner', async () => {
    const service = makeServiceClient();
    mockCreateServiceRoleClient.mockReturnValue(service);
    mockEnforceRateLimit.mockResolvedValue(new Response(null, { status: 429 }));

    const response = await PATCH(patchRequest({ document_id: DOC_ID, metric: 'downloads' }));

    expect(response.status).toBe(429);
    expect(mockEnforceRateLimit).toHaveBeenCalledWith(
      'content-document-metric',
      `203.0.113.7:${DOC_ID}`,
      expect.objectContaining({ limit: expect.any(Number), windowSeconds: expect.any(Number) }),
    );
    expect(service.rpc).not.toHaveBeenCalled();
  });

  it('likes için oturum yoksa 401 döner ve sayaç artmaz', async () => {
    const service = makeServiceClient();
    mockCreateServiceRoleClient.mockReturnValue(service);

    const response = await PATCH(patchRequest({ document_id: DOC_ID, metric: 'likes' }));

    expect(response.status).toBe(401);
    expect(service.rpc).not.toHaveBeenCalled();
  });

  it('likes için geçersiz token ile 401 döner ve sayaç artmaz', async () => {
    const service = makeServiceClient();
    mockCreateServiceRoleClient.mockReturnValue(service);
    mockCreateServerClient.mockReturnValue(makeAuthClient(null));
    mockGetAccessToken.mockResolvedValue('expired-token');

    const response = await PATCH(patchRequest({ document_id: DOC_ID, metric: 'likes' }));

    expect(response.status).toBe(401);
    expect(service.rpc).not.toHaveBeenCalled();
  });

  it('likes token doğrulandıktan sonra RPC’yi service-role ile çağırır', async () => {
    const service = makeServiceClient({ data: 3, error: null });
    const auth = makeAuthClient({ id: 'user-1' });
    mockCreateServiceRoleClient.mockReturnValue(service);
    mockCreateServerClient.mockReturnValue(auth);
    mockGetAccessToken.mockResolvedValue('valid-token');

    const response = await PATCH(patchRequest({ document_id: DOC_ID, metric: 'likes' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { document_id: DOC_ID, likes: 3 } });
    expect(mockCreateServerClient).toHaveBeenCalledWith('valid-token');
    expect(auth.auth.getUser).toHaveBeenCalledWith('valid-token');
    expect(auth.rpc).not.toHaveBeenCalled();
    expect(service.rpc).toHaveBeenCalledWith('increment_document_counter', {
      counter: 'likes',
      doc_id: DOC_ID,
    });
    expect(service.from).not.toHaveBeenCalled();
  });

  it('belge yoksa (RPC null) 404 döner', async () => {
    mockCreateServiceRoleClient.mockReturnValue(makeServiceClient({ data: null, error: null }));

    const response = await PATCH(patchRequest({ document_id: DOC_ID, metric: 'views' }));

    expect(response.status).toBe(404);
  });

  it('RPC hatasında ham hatayı sızdırmadan 500 döner', async () => {
    mockCreateServiceRoleClient.mockReturnValue(
      makeServiceClient({ data: null, error: { message: 'relation secret' } }),
    );

    const response = await PATCH(patchRequest({ document_id: DOC_ID, metric: 'views' }));

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain('relation secret');
  });

  it('geçersiz payload veya uuid olmayan id için 400 döner', async () => {
    const invalidMetric = await PATCH(
      patchRequest({ document_id: DOC_ID, metric: 'comments_count' }),
    );
    const invalidId = await PATCH(patchRequest({ document_id: 'doc-123', metric: 'views' }));

    expect(invalidMetric.status).toBe(400);
    expect(invalidId.status).toBe(400);
    expect(mockEnforceRateLimit).not.toHaveBeenCalled();
    expect(mockCreateServiceRoleClient).not.toHaveBeenCalled();
  });
});
