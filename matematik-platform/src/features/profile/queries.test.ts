import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import { completeWeeklyPlanItem } from '@/features/profile/queries';
import { supabase } from '@/lib/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock('@/features/analytics/trackActivity', () => ({
  trackStudentActivityEvent: vi.fn(),
}));

const successResponse = (data: unknown) => ({
  count: null,
  data,
  error: null,
  status: 200,
  statusText: 'OK',
});

const postgrestError = (message: string): PostgrestError => ({
  code: 'P0001',
  details: '',
  hint: '',
  message,
  name: 'PostgrestError',
});

describe('profile weekly plan queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes a weekly plan item through the scoped RPC', async () => {
    const item = {
      completed_at: '2026-04-30T10:00:00Z',
      id: 'item-1',
      plan_id: 'plan-1',
      title: 'Problemler testi',
    };
    vi.mocked(supabase.rpc).mockResolvedValue(successResponse(item));

    await expect(completeWeeklyPlanItem('item-1', true)).resolves.toEqual(item);

    expect(supabase.rpc).toHaveBeenCalledWith('complete_weekly_plan_item', {
      p_completed: true,
      p_item_id: 'item-1',
    });
    expect(trackStudentActivityEvent).toHaveBeenCalledWith({
      entityId: 'item-1',
      entityType: 'weekly_plan_item',
      eventType: 'weekly_plan_item_completed',
    });
  });

  it('tracks reopened weekly plan items distinctly', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue(
      successResponse({
        completed_at: null,
        id: 'item-1',
        plan_id: 'plan-1',
        title: 'Problemler testi',
      }),
    );

    await completeWeeklyPlanItem('item-1', false);

    expect(trackStudentActivityEvent).toHaveBeenCalledWith({
      entityId: 'item-1',
      entityType: 'weekly_plan_item',
      eventType: 'weekly_plan_item_reopened',
    });
  });

  it('surfaces RPC errors without writing activity events', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      count: null,
      data: null,
      error: postgrestError('Plan maddesi bulunamadı.'),
      status: 400,
      statusText: 'Bad Request',
    });

    await expect(completeWeeklyPlanItem('item-404', true)).rejects.toThrow(
      'Plan maddesi bulunamadı.',
    );
    expect(trackStudentActivityEvent).not.toHaveBeenCalled();
  });
});
