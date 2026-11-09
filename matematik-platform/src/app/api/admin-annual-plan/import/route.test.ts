// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/api-auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(),
}));

vi.mock('@/lib/annual-plan-import', () => ({
  parseAnnualPlanFile: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

import { requireAdmin } from '@/lib/api-auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { parseAnnualPlanFile } from '@/lib/annual-plan-import';
import { POST } from './route';

describe('POST /api/admin-annual-plan/import', () => {
  const mockAdminUser = { id: 'admin-uuid-1', email: 'admin@ugurhoca.com' };
  const mockUpsertSelect = vi.fn();
  const mockUpsert = vi.fn();
  const mockFrom = vi.fn();

  const mockServiceRole = {
    from: mockFrom,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimit).mockResolvedValue(null);
    mockUpsert.mockReturnValue({ select: mockUpsertSelect });
    mockFrom.mockReturnValue({ upsert: mockUpsert });
    vi.mocked(requireAdmin).mockResolvedValue({
      user: mockAdminUser,
      serviceRole: mockServiceRole,
    } as unknown as Awaited<ReturnType<typeof requireAdmin>>);
  });

  it('admin yetkisi yoksa auth.error yanıtını döndürür (401/403)', async () => {
    vi.mocked(requireAdmin).mockResolvedValueOnce({
      error: NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 }),
    } as unknown as Awaited<ReturnType<typeof requireAdmin>>);

    const req = new Request(
      'https://ugurhoca.com/api/admin-annual-plan/import',
      {
        method: 'POST',
      },
    );

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(401);
  });

  it('rate limit aşıldığında 429 yanıtı döndürür', async () => {
    vi.mocked(enforceRateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 }),
    );

    const req = new Request(
      'https://ugurhoca.com/api/admin-annual-plan/import',
      {
        method: 'POST',
      },
    );

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(429);
    expect(enforceRateLimit).toHaveBeenCalledWith(
      'admin-annual-plan-import',
      mockAdminUser.id,
      { limit: 10, windowSeconds: 60 },
    );
  });

  it('dosya yüklenmediğinde 400 missing_plan_file döner', async () => {
    const formData = new FormData();
    const req = new Request(
      'https://ugurhoca.com/api/admin-annual-plan/import',
      {
        method: 'POST',
        body: formData,
      },
    );
    req.formData = async () => formData;

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { code: string; message: string };
    };
    expect(body.error.code).toBe('missing_plan_file');
  });

  it('dosya 5 MB boyutunu aşıyorsa 400 plan_file_too_large döner', async () => {
    const largeFile = new File([new Uint8Array(6 * 1024 * 1024)], 'plan.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const formData = new FormData();
    formData.append('file', largeFile);

    const req = new Request(
      'https://ugurhoca.com/api/admin-annual-plan/import',
      {
        method: 'POST',
        body: formData,
      },
    );
    req.formData = async () => formData;

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { code: string; message: string };
    };
    expect(body.error.code).toBe('plan_file_too_large');
  });

  it('parseAnnualPlanFile ayrıştırma hatası verirse 400 invalid_annual_plan_file döner', async () => {
    const file = new File(['invalid content'], 'plan.csv', {
      type: 'text/csv',
    });
    const formData = new FormData();
    formData.append('file', file);

    vi.mocked(parseAnnualPlanFile).mockResolvedValueOnce({
      rows: [],
      errors: [{ message: 'Hatalı CSV formatı', row: 1 }],
      skippedDuplicates: 0,
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-annual-plan/import',
      {
        method: 'POST',
        body: formData,
      },
    );
    req.formData = async () => formData;

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { code: string; message: string };
    };
    expect(body.error.code).toBe('invalid_annual_plan_file');
    expect(body.error.message).toBe('Hatalı CSV formatı');
  });

  it('ayrıştırılan dosya hiç satır içermiyorsa 400 empty_annual_plan_file döner', async () => {
    const file = new File([''], 'plan.csv', { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', file);

    vi.mocked(parseAnnualPlanFile).mockResolvedValueOnce({
      rows: [],
      errors: [],
      skippedDuplicates: 0,
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-annual-plan/import',
      {
        method: 'POST',
        body: formData,
      },
    );
    req.formData = async () => formData;

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { code: string; message: string };
    };
    expect(body.error.code).toBe('empty_annual_plan_file');
  });

  it('veritabanı upsert işlemi hata verirse 500 annual_plan_insert_failed döner', async () => {
    const file = new File(['valid'], 'plan.csv', { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', file);

    vi.mocked(parseAnnualPlanFile).mockResolvedValueOnce({
      rows: [
        {
          grade: 5,
          week_start: '2026-09-14',
          learning_outcome: 'M.5.1.1.1',
        } as unknown as Record<string, unknown>,
      ] as never,
      errors: [],
      skippedDuplicates: 0,
    });

    mockUpsertSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'DB connection error' },
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-annual-plan/import',
      {
        method: 'POST',
        body: formData,
      },
    );
    req.formData = async () => formData;

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(500);
    const body = (await res.json()) as {
      error: { code: string; message: string };
    };
    expect(body.error.code).toBe('annual_plan_insert_failed');
  });

  it('başarılı içe aktarımda 200 döner ve sonuç istatistiklerini iletir', async () => {
    const file = new File(['valid content'], 'plan.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const formData = new FormData();
    formData.append('file', file);

    const mockRow = {
      grade: 5,
      week_start: '2026-09-14',
      learning_outcome: 'M.5.1.1.1',
    };

    vi.mocked(parseAnnualPlanFile).mockResolvedValueOnce({
      rows: [mockRow as never],
      errors: [],
      skippedDuplicates: 1,
    });

    mockUpsertSelect.mockResolvedValueOnce({
      data: [mockRow],
      error: null,
    });

    const req = new Request(
      'https://ugurhoca.com/api/admin-annual-plan/import',
      {
        method: 'POST',
        body: formData,
      },
    );
    req.formData = async () => formData;

    const res = (await POST(req)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: { inserted: number; total: number; skipped: number };
    };
    expect(body.data.inserted).toBe(1);
    expect(body.data.total).toBe(2);
    expect(body.data.skipped).toBe(1);
  });
});
