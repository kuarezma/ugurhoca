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
        invalidAllowedHosts: [],
        invalidSourceUrls: [],
        sourceUrls: [],
      },
    });
  });

  it('returns configured source urls and inferred allowed hosts', async () => {
    process.env.WORKSHEET_CANDIDATE_SOURCE_URLS =
      'https://example.com/testler, https://www.meb.gov.tr/pdfler';

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
        invalidAllowedHosts: [],
        invalidSourceUrls: [],
        sourceUrls: [
          'https://example.com/testler',
          'https://www.meb.gov.tr/pdfler',
        ],
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

  it('returns invalid allowed hosts when host config includes protocol or path', async () => {
    process.env.WORKSHEET_CANDIDATE_SOURCE_URLS =
      'https://example.com/testler';
    process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS =
      'example.com, https://meb.gov.tr, kaynak.com/testler';

    const response = await GET(
      new Request(
        'http://localhost/api/admin-worksheet-candidates/source-status',
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        allowedHosts: ['example.com', 'https://meb.gov.tr', 'kaynak.com/testler'],
        configured: false,
        invalidAllowedHosts: ['https://meb.gov.tr', 'kaynak.com/testler'],
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
