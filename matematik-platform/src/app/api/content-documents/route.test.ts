import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PATCH } from '@/app/api/content-documents/route';
import { createServiceRoleClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(),
  createServerSupabaseClient: vi.fn(),
}));

describe('PATCH /api/content-documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('increments views metric successfully', async () => {
    const singleMock = vi.fn().mockResolvedValue({
      data: { views: 14 },
      error: null,
    });
    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: singleMock,
      }),
    });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({
      eq: updateEqMock,
    });

    const mockAdminClient = {
      from: vi.fn((table: string) => {
        if (table === 'documents') {
          return {
            select: selectMock,
            update: updateMock,
          };
        }
        return {};
      }),
    };

    vi.mocked(createServiceRoleClient).mockReturnValue(
      mockAdminClient as unknown as ReturnType<typeof createServiceRoleClient>,
    );

    const response = await PATCH(
      new Request('http://localhost/api/content-documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: 'doc-123',
          metric: 'views',
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      data: {
        document_id: 'doc-123',
        views: 15,
      },
    });
    expect(updateMock).toHaveBeenCalledWith({ views: 15 });
  });

  it('returns 400 for invalid payload', async () => {
    const response = await PATCH(
      new Request('http://localhost/api/content-documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: '',
          metric: 'invalid_metric',
        }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
