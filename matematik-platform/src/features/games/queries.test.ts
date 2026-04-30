import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import {
  getGameAliasErrorMessage,
  insertGameScore,
  loadGameAlias,
  loadGamesLeaderboard,
  saveGameAlias,
} from '@/features/games/queries';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
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
    window.localStorage.clear();
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

  it('falls back to local alias storage when alias migration is not deployed yet', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: {
        code: 'PGRST202',
        message: 'Could not find the function public.set_game_alias(p_alias)',
      },
    } as never);
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'student-1' } },
      error: null,
    } as never);

    await expect(saveGameAlias('SayiUstasi')).resolves.toEqual({
      alias: 'SayiUstasi',
      alias_normalized: 'sayiustasi',
      user_id: 'student-1',
    });
    expect(window.localStorage.getItem('ugur-hoca-game-alias:student-1')).toBe(
      'SayiUstasi',
    );
  });

  it('loads locally stored aliases while the game_aliases table is missing', async () => {
    window.localStorage.setItem('ugur-hoca-game-alias:student-1', 'SayiUstasi');
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: 'PGRST205',
        message: "Could not find the table 'public.game_aliases'",
      },
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    vi.mocked(supabase.from).mockReturnValue({ select } as never);

    await expect(loadGameAlias('student-1')).resolves.toEqual({
      alias: 'SayiUstasi',
      alias_normalized: 'sayiustasi',
      user_id: 'student-1',
    });
  });

  it('uses stored aliases for legacy score inserts while alias migration is missing', async () => {
    window.localStorage.setItem('ugur-hoca-game-alias:student-1', 'SayiUstasi');
    await loadGameAlias('student-1');

    const insert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({ insert } as never);

    await insertGameScore({
      gameId: 7,
      score: 35,
      user: { id: 'student-1' },
    });

    expect(insert).toHaveBeenCalledWith([
      {
        game_id: 7,
        score: 35,
        user_id: 'student-1',
        user_name: 'SayiUstasi',
      },
    ]);
  });

  it('extracts Supabase object error messages for alias failures', () => {
    expect(
      getGameAliasErrorMessage({
        message: 'Rumuz gerçek adınızla aynı veya çok benzer olamaz.',
      }),
    ).toBe('Rumuz gerçek adınızla aynı veya çok benzer olamaz.');
  });
});
