import { updateDocumentMetric } from '@/features/content/queries';
import { getClientSession } from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/auth-client', () => ({
  getClientSession: vi.fn(),
  getCurrentUserProfile: vi.fn(),
}));

const DOC_ID = '0b6c7d1e-2f3a-4b5c-8d9e-0f1a2b3c4d5e';

const okResponse = () =>
  new Response(JSON.stringify({ data: { document_id: DOC_ID } }), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  });

describe('updateDocumentMetric', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('admin olmayan kullanıcının görüntülemesini doğrudan update yerine PATCH rotasına gönderir', async () => {
    // RLS'nin engellediği UPDATE hata değil 0 satır döndürür; eski kod bu
    // yüzden PATCH'e hiç düşmüyordu.
    const update = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }));
    vi.mocked(supabase.from).mockReturnValue({ update } as never);
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await updateDocumentMetric(DOC_ID, { views: 8 });

    expect(supabase.from).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/content-documents');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(String(init.body))).toEqual({ document_id: DOC_ID, metric: 'views' });
  });

  it('beğeniyi oturum token’ıyla PATCH rotasına gönderir', async () => {
    vi.mocked(getClientSession).mockResolvedValue({ access_token: 'tok-1' } as never);
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    await updateDocumentMetric(DOC_ID, { likes: 4 });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ document_id: DOC_ID, metric: 'likes' });
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer tok-1');
  });

  it('rota hatasını yutar; sayaç çağrısı sayfa akışını bozmaz', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    await expect(updateDocumentMetric(DOC_ID, { downloads: 2 })).resolves.toBeUndefined();
  });
});
