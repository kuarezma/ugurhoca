import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import {
  insertGameScore,
  loadGamesLeaderboard,
  saveGameAlias,
} from '@/features/games/queries';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

vi.mock('@/features/analytics/trackActivity', () => ({
  trackStudentActivityEvent: vi.fn(),
}));

describe('games queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads leaderboard through the alias-only RPC', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [{ alias: 'SayiUstasi', rank: 1, total_score: 420 }],
      error: null,
    } as never);

    await expect(loadGamesLeaderboard('week')).resolves.toEqual([
      { alias: 'SayiUstasi', rank: 1, total_score: 420 },
    ]);

    expect(supabase.rpc).toHaveBeenCalledWith('get_game_leaderboard', {
      p_period: 'week',
    });
  });

  it('saves aliases through the validation RPC', async () => {
    const alias = {
      alias: 'SayiUstasi',
      alias_normalized: 'sayiustasi',
      user_id: 'student-1',
    };
    vi.mocked(supabase.rpc).mockResolvedValue({ data: alias, error: null } as never);

    await expect(saveGameAlias('SayiUstasi')).resolves.toEqual(alias);

    expect(supabase.rpc).toHaveBeenCalledWith('set_game_alias', {
      p_alias: 'SayiUstasi',
    });
  });

  it('inserts game scores without leaking real names', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({ insert } as never);

    await expect(
      insertGameScore({
        gameId: 7,
        score: 35,
        user: { id: 'student-1' },
      }),
    ).resolves.toBe(true);

    expect(supabase.from).toHaveBeenCalledWith('game_scores');
    expect(insert).toHaveBeenCalledWith([
      {
        game_id: 7,
        score: 35,
        user_id: 'student-1',
        user_name: null,
      },
    ]);
    expect(trackStudentActivityEvent).toHaveBeenCalledWith({
      entityId: '7',
      entityType: 'game',
      eventType: 'game_score_saved',
      metadata: {
        score: 35,
      },
      userId: 'student-1',
    });
  });

  it('does not track activity when score insert fails', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { message: 'Rumuz seçmeniz gerekiyor.' },
    });
    vi.mocked(supabase.from).mockReturnValue({ insert } as never);

    await expect(
      insertGameScore({
        gameId: 7,
        score: 35,
        user: { id: 'student-1' },
      }),
    ).resolves.toBe(false);

    expect(trackStudentActivityEvent).not.toHaveBeenCalled();
  });
});
