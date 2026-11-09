// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/api-auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock('@/lib/worksheet-candidate-discovery', () => ({
  parseSourceUrls: vi.fn(),
  isPublicWorksheetSourceUrl: vi.fn(),
  parseAllowedHosts: vi.fn(),
  discoverWorksheetCandidatesFromSources: vi.fn(),
}));

import { requireAdmin } from '@/lib/api-auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import {
  parseSourceUrls,
  isPublicWorksheetSourceUrl,
  parseAllowedHosts,
  discoverWorksheetCandidatesFromSources,
} from '@/lib/worksheet-candidate-discovery';
import { POST } from './route';

describe('POST /api/admin-worksheet-candidates/discover', () => {
  const mockAdminUser = { id: 'admin-1', email: 'admin@ugurhoca.com' };
  const mockFrom = vi.fn();
  const mockPlanSingle = vi.fn();
  const mockCandidateUpsertSelect = vi.fn();

  const mockServiceRole = {
    from: mockFrom,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimit).mockResolvedValue(null);
    vi.mocked(requireAdmin).mockResolvedValue({
      user: mockAdminUser,
      serviceRole: mockServiceRole,
    } as unknown as Awaited<ReturnType<typeof requireAdmin>>);

    vi.mocked(parseSourceUrls).mockReturnValue([
      'https://kaynak.example.com/calisma-kagitlari',
    ]);
    vi.mocked(isPublicWorksheetSourceUrl).mockReturnValue(true);
    vi.mocked(parseAllowedHosts).mockReturnValue(['kaynak.example.com']);

    mockFrom.mockImplementation((table: string) => {
      if (table === 'annual_plan_items') {
        return {
          select: () => ({
            eq: () => ({
              single: mockPlanSingle,
            }),
          }),
        };
      }
      if (table === 'worksheet_candidates') {
        return {
          upsert: () => ({
            select: mockCandidateUpsertSelect,
          }),
        };
      }
      return {};
    });
  });

  it('admin yetkisi yoksa auth.error döndürür', async () => {
    vi.mocked(requireAdmin).mockResolvedValueOnce({
      error: NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 }),
    } as unknown as Awaited<ReturnType<typeof requireAdmin>>);

    const req = new Request(
      'https://ugurhoca.com/api/admin-worksheet-candidates/discover',
      {
        method: 'POST',
        body: JSON.stringify({
          annual_plan_item_id: 'a0000000-0000-4000-8000-000000000001',
        }),
      },
    );

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(401);
  });

  it('rate limit aşıldığında 429 döndürür', async () => {
    vi.mocked(enforceRateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 }),
    );

    const req = new Request(
      'https://ugurhoca.com/api/admin-worksheet-candidates/discover',
      {
        method: 'POST',
        body: JSON.stringify({
          annual_plan_item_id: 'a0000000-0000-4000-8000-000000000001',
        }),
      },
    );

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(429);
  });

  it('geçersiz veya eksik UUID gönderildiğinde 400 invalid_worksheet_candidate_discover döner', async () => {
    const req = new Request(
      'https://ugurhoca.com/api/admin-worksheet-candidates/discover',
      {
        method: 'POST',
        body: JSON.stringify({ annual_plan_item_id: 'not-a-uuid' }),
      },
    );

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('invalid_worksheet_candidate_discover');
  });

  it('izinli kaynak listesi boşsa 400 missing_worksheet_sources döner', async () => {
    vi.mocked(parseSourceUrls).mockReturnValueOnce([]);
    vi.mocked(parseAllowedHosts).mockReturnValueOnce([]);

    const req = new Request(
      'https://ugurhoca.com/api/admin-worksheet-candidates/discover',
      {
        method: 'POST',
        body: JSON.stringify({
          annual_plan_item_id: 'a0000000-0000-4000-8000-000000000001',
        }),
      },
    );

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('missing_worksheet_sources');
  });

  it('yıllık plan kaydı bulunamadığında 404 annual_plan_item_not_found döner', async () => {
    mockPlanSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Row not found' },
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-worksheet-candidates/discover',
      {
        method: 'POST',
        body: JSON.stringify({
          annual_plan_item_id: 'a0000000-0000-4000-8000-000000000001',
        }),
      },
    );

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('annual_plan_item_not_found');
  });

  it('kaynaklarda aday bulunamadığında inserted: 0 ile 200 döner', async () => {
    mockPlanSingle.mockResolvedValueOnce({
      data: { id: 'plan-1', grade: 5, learning_outcome: 'M.5.1.1.1' },
      error: null,
    });

    vi.mocked(discoverWorksheetCandidatesFromSources).mockResolvedValueOnce({
      candidates: [],
      searchedSources: 1,
      skippedSources: 0,
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-worksheet-candidates/discover',
      {
        method: 'POST',
        body: JSON.stringify({
          annual_plan_item_id: 'a0000000-0000-4000-8000-000000000001',
        }),
      },
    );

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: { inserted: number; items: unknown[] };
    };
    expect(body.data.inserted).toBe(0);
    expect(body.data.items).toEqual([]);
  });

  it('adaylar veritabanına eklenirken hata verirse 500 worksheet_candidate_insert_failed döner', async () => {
    mockPlanSingle.mockResolvedValueOnce({
      data: { id: 'plan-1', grade: 5, learning_outcome: 'M.5.1.1.1' },
      error: null,
    });

    vi.mocked(discoverWorksheetCandidatesFromSources).mockResolvedValueOnce({
      candidates: [
        {
          grade: 5,
          learning_outcome: 'M.5.1.1.1',
          file_url: 'https://kaynak.example.com/test1.pdf',
          title: 'Çalışma Kağıdı 1',
        } as never,
      ],
      searchedSources: 1,
      skippedSources: 0,
    });

    mockCandidateUpsertSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database insert failure' },
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-worksheet-candidates/discover',
      {
        method: 'POST',
        body: JSON.stringify({
          annual_plan_item_id: 'a0000000-0000-4000-8000-000000000001',
        }),
      },
    );

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('worksheet_candidate_insert_failed');
  });

  it('başarılı aday keşfinde ve kaydında 200 döner ve kaydedilen adayları iletir', async () => {
    mockPlanSingle.mockResolvedValueOnce({
      data: { id: 'plan-1', grade: 5, learning_outcome: 'M.5.1.1.1' },
      error: null,
    });

    const mockCandidate = {
      id: 'candidate-1',
      grade: 5,
      learning_outcome: 'M.5.1.1.1',
      file_url: 'https://kaynak.example.com/test1.pdf',
      title: 'Çalışma Kağıdı 1',
    };

    vi.mocked(discoverWorksheetCandidatesFromSources).mockResolvedValueOnce({
      candidates: [mockCandidate as never],
      searchedSources: 1,
      skippedSources: 0,
    });

    mockCandidateUpsertSelect.mockResolvedValueOnce({
      data: [mockCandidate],
      error: null,
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-worksheet-candidates/discover',
      {
        method: 'POST',
        body: JSON.stringify({
          annual_plan_item_id: 'a0000000-0000-4000-8000-000000000001',
        }),
      },
    );

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: { inserted: number; total: number };
    };
    expect(body.data.inserted).toBe(1);
    expect(body.data.total).toBe(1);
  });
});
