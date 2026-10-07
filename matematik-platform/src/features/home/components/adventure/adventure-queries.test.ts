import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase/client';
import { loadAdventureProgress } from './adventure-queries';

vi.mock('@/lib/supabase/client', () => ({ supabase: { from: vi.fn() } }));

describe('adventure queries', () => {
  beforeEach(() => vi.clearAllMocks());
  it('scopes every personal query to the user and requests exact test/badge counts', async () => {
    const responses = {
      profiles: { data: { current_streak: 7 }, error: null },
      user_progress: {
        data: [{ topic: 'Olasılık', mastery_level: 85 }],
        error: null,
      },
      quiz_results: { count: 45, error: null },
      user_badges: { count: 3, error: null },
    };
    const builders = Object.fromEntries(
      Object.entries(responses).map(([table, response]) => {
        const builder = {
          select: vi.fn(),
          eq: vi.fn(),
          single: vi.fn().mockResolvedValue(response),
          then: Promise.resolve(response).then.bind(Promise.resolve(response)),
        };
        builder.select.mockReturnValue(builder);
        builder.eq.mockReturnValue(builder);
        return [table, builder];
      }),
    );
    vi.mocked(supabase.from).mockImplementation(
      (table: string) => builders[table] as never,
    );
    expect(await loadAdventureProgress('student')).toEqual({
      currentStreak: 7,
      quizCount: 45,
      badgeCount: 3,
      topics: [{ topic: 'Olasılık', mastery_level: 85 }],
    });
    expect(builders.profiles.eq).toHaveBeenCalledWith('id', 'student');
    for (const table of ['user_progress', 'quiz_results', 'user_badges'])
      expect(builders[table].eq).toHaveBeenCalledWith('user_id', 'student');
    expect(builders.quiz_results.select).toHaveBeenCalledWith('id', {
      count: 'exact',
      head: true,
    });
    expect(builders.user_badges.select).toHaveBeenCalledWith('id', {
      count: 'exact',
      head: true,
    });
  });
  it('rejects an incomplete query instead of returning fabricated zeros', async () => {
    const builder = {
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn().mockResolvedValue({ error: { message: 'denied' } }),
      then: Promise.resolve({ error: { message: 'denied' } }).then.bind(
        Promise.resolve({ error: { message: 'denied' } }),
      ),
    };
    builder.select.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    vi.mocked(supabase.from).mockReturnValue(builder as never);
    await expect(loadAdventureProgress('student')).rejects.toThrow(
      'İlerlemen yüklenemedi',
    );
  });
});
