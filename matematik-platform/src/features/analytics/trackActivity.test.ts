import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

const mockedSupabase = vi.mocked(supabase);
const getUserMock = mockedSupabase.auth.getUser as unknown as ReturnType<
  typeof vi.fn
>;

describe('trackStudentActivityEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores uuid entity ids in the entity_id column', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockedSupabase.from.mockReturnValue({ insert } as never);

    await trackStudentActivityEvent({
      entityId: '11111111-1111-4111-8111-111111111111',
      entityType: 'content',
      eventType: 'content_opened',
      metadata: { source: 'test' },
      userId: 'student-1',
    });

    expect(mockedSupabase.from).toHaveBeenCalledWith('student_activity_events');
    expect(insert).toHaveBeenCalledWith({
      entity_id: '11111111-1111-4111-8111-111111111111',
      entity_type: 'content',
      event_type: 'content_opened',
      metadata: { source: 'test' },
      user_id: 'student-1',
    });
  });

  it('moves non-uuid entity ids into metadata', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockedSupabase.from.mockReturnValue({ insert } as never);

    await trackStudentActivityEvent({
      entityId: 'game-7',
      entityType: 'game',
      eventType: 'game_score_saved',
      metadata: { score: 120 },
      userId: 'student-1',
    });

    expect(insert).toHaveBeenCalledWith({
      entity_id: null,
      entity_type: 'game',
      event_type: 'game_score_saved',
      metadata: { entity_id: 'game-7', score: 120 },
      user_id: 'student-1',
    });
  });

  it('resolves the current auth user and skips missing users', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockedSupabase.from.mockReturnValue({ insert } as never);
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: 'auth-user-1' } },
    } as never);

    await trackStudentActivityEvent({
      eventType: 'dashboard_opened',
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'auth-user-1' }),
    );

    getUserMock.mockResolvedValueOnce({
      data: { user: null },
    } as never);

    await trackStudentActivityEvent({
      eventType: 'dashboard_opened',
    });

    expect(insert).toHaveBeenCalledTimes(1);
  });
});
