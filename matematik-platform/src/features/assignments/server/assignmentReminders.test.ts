import { describe, expect, it, vi, beforeEach } from 'vitest';
import { sendDueAssignmentReminders } from './assignmentReminders';

const _mockInsert = vi.fn().mockResolvedValue({ error: null });
const _mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({
    from: mockFrom,
  }),
}));

describe('sendDueAssignmentReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns zero count when no assignments are upcoming', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    const result = await sendDueAssignmentReminders();
    expect(result.assignmentCount).toBe(0);
    expect(result.sentCount).toBe(0);
  });
});
