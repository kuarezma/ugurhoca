import { GET } from '@/app/api/admin-worksheet-candidates/source-status/route';
import { getServerAccessToken } from '@/lib/auth-snapshot.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

vi.mock('@/lib/auth-snapshot.server', () => ({
  getServerAccessToken: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

const originalSourceUrls = process.env.WORKSHEET_CANDIDATE_SOURCE_URLS;
const originalAllowedHosts = process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS;

const mockAdminAuth = () => {
  vi.mocked(getServerAccessToken).mockResolvedValue('admin-token');
  vi.mocked(createServerSupabaseClient).mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            email: 'admin@ugurhoca.com',
            id: 'admin-1',
          },
        },
        error: null,
      }),
    },
  } as never);
};

describe('GET /api/admin-worksheet-candidates/source-status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    delete process.env.WORKSHEET_CANDIDATE_SOURCE_URLS;
    delete process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS;
    mockAdminAuth();
  });

  afterAll(() => {
    process.env.WORKSHEET_CANDIDATE_SOURCE_URLS = originalSourceUrls;
    process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS = originalAllowedHosts;
  });

  it('returns not configured when source urls are empty', async () => {
    const response = await GET(
      new Request(
        'http://localhost/api/admin-worksheet-candidates/source-status',
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        allowedHosts: [],
        configured: false,
        health: {
          allowedHosts: 0,
          invalidSources: 0,
          totalSources: 0,
          validSources: 0,
        },
        invalidAllowedHosts: [],
        invalidSourceUrls: [],
        sourceUrls: [],
      },
    });
  });

  it('returns configured source urls and inferred allowed hosts', async () => {
    process.env.WORKSHEET_CANDIDATE_SOURCE_URLS =
      'https://example.com/testler,\n https://www.meb.gov.tr/pdfler';

    const response = await GET(
      new Request(
        'http://localhost/api/admin-worksheet-candidates/source-status',
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        allowedHosts: ['example.com', 'www.meb.gov.tr'],
        configured: true,
        health: {
          allowedHosts: 2,
          invalidSources: 0,
          totalSources: 2,
          validSources: 2,
        },
        invalidAllowedHosts: [],
        invalidSourceUrls: [],
        sourceUrls: [
          'https://example.com/testler',
          'https://www.meb.gov.tr/pdfler',
        ],
      },
    });
  });

  it('checks live source reachability when requested', async () => {
    process.env.WORKSHEET_CANDIDATE_SOURCE_URLS =
      'https://example.com/testler,\n https://www.meb.gov.tr/kayip';
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

    const response = await GET(
      new Request(
        'http://localhost/api/admin-worksheet-candidates/source-status?live=1',
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        allowedHosts: ['example.com', 'www.meb.gov.tr'],
        configured: true,
        health: {
          allowedHosts: 2,
          invalidSources: 0,
          reachableSources: 1,
          totalSources: 2,
          unreachableSources: 1,
          validSources: 2,
        },
        invalidAllowedHosts: [],
        invalidSourceUrls: [],
        sourceChecks: [
          {
            ok: true,
            statusCode: 200,
            url: 'https://example.com/testler',
          },
          {
            ok: false,
            statusCode: 404,
            url: 'https://www.meb.gov.tr/kayip',
          },
        ],
        sourceUrls: [
          'https://example.com/testler',
          'https://www.meb.gov.tr/kayip',
        ],
        unreachableSourceUrls: ['https://www.meb.gov.tr/kayip'],
      },
    });
  });

  it('returns invalid source urls when source config has malformed urls', async () => {
    process.env.WORKSHEET_CANDIDATE_SOURCE_URLS =
      'https://example.com/testler, ftp://example.com/file.pdf, not-a-url';

    const response = await GET(
      new Request(
        'http://localhost/api/admin-worksheet-candidates/source-status',
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        allowedHosts: ['example.com'],
        configured: false,
        health: {
          allowedHosts: 1,
          invalidSources: 2,
          totalSources: 3,
          validSources: 1,
        },
        invalidAllowedHosts: [],
        invalidSourceUrls: ['ftp://example.com/file.pdf', 'not-a-url'],
        sourceUrls: [
          'https://example.com/testler',
          'ftp://example.com/file.pdf',
          'not-a-url',
        ],
      },
    });
  });

  it('returns invalid source urls for local or private network addresses', async () => {
    process.env.WORKSHEET_CANDIDATE_SOURCE_URLS =
      'http://localhost/testler, http://192.168.1.10/testler, https://example.com/testler';

    const response = await GET(
      new Request(
        'http://localhost/api/admin-worksheet-candidates/source-status',
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        allowedHosts: ['example.com'],
        configured: false,
        health: {
          allowedHosts: 1,
          invalidSources: 2,
          totalSources: 3,
          validSources: 1,
        },
        invalidAllowedHosts: [],
        invalidSourceUrls: [
          'http://localhost/testler',
          'http://192.168.1.10/testler',
        ],
        sourceUrls: [
          'http://localhost/testler',
          'http://192.168.1.10/testler',
          'https://example.com/testler',
        ],
      },
    });
  });

  it('returns invalid allowed hosts when host config includes protocol or path', async () => {
    process.env.WORKSHEET_CANDIDATE_SOURCE_URLS =
      'https://example.com/testler';
    process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS =
      'example.com,\n https://meb.gov.tr, kaynak.com/testler, 192.168.1.10';

    const response = await GET(
      new Request(
        'http://localhost/api/admin-worksheet-candidates/source-status',
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        allowedHosts: [
          'example.com',
          'https://meb.gov.tr',
          'kaynak.com/testler',
          '192.168.1.10',
        ],
        configured: false,
        health: {
          allowedHosts: 4,
          invalidSources: 0,
          totalSources: 1,
          validSources: 1,
        },
        invalidAllowedHosts: [
          'https://meb.gov.tr',
          'kaynak.com/testler',
          '192.168.1.10',
        ],
        invalidSourceUrls: [],
        sourceUrls: ['https://example.com/testler'],
      },
    });
  });

  it('rejects non-admin users', async () => {
    vi.mocked(createServerSupabaseClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              email: 'ogrenci@example.com',
              id: 'student-1',
            },
          },
          error: null,
        }),
      },
    } as never);

    const response = await GET(
      new Request(
        'http://localhost/api/admin-worksheet-candidates/source-status',
      ),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'not_admin',
        message: 'Bu işlem için yetkiniz yok.',
      },
    });
  });
});
