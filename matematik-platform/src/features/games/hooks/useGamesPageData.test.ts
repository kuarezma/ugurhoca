import { act, renderHook, waitFor } from '@testing-library/react';
import { useGamesPageData } from './useGamesPageData';
import { supabase } from '@/lib/supabase/client';
import type { GameDefinition } from '../types';

vi.mock('@/lib/auth-client', () => ({
  getCurrentUserProfile: vi
    .fn()
    .mockResolvedValue({ profile: { id: 'student-1' } }),
}));
vi.mock('@/lib/supabase/client', () => ({
  supabase: { rpc: vi.fn(), from: vi.fn() },
}));
vi.mock('@/features/analytics/trackActivity', () => ({
  trackStudentActivityEvent: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(supabase.from).mockReturnValue({
    select: () => ({
      eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
    }),
  } as never);
  vi.mocked(supabase.rpc).mockImplementation(
    (name: string) =>
      ({
        data:
          name === 'set_game_alias'
            ? {
                user_id: 'student-1',
                alias: 'SayıUstası',
                alias_normalized: 'sayıustası',
              }
            : [],
        error: null,
      }) as never,
  );
});

it('keeps scores earned without an alias and submits them once after a later alias entry', async () => {
  const router = { push: vi.fn() };
  const { result } = renderHook(() => useGamesPageData(router));
  await waitFor(() => expect(result.current.loading).toBe(false));
  const game = { id: 7 } as GameDefinition;
  await act(async () => {
    await result.current.recordScore(35, game);
    await result.current.recordScore(20, game);
  });
  expect(supabase.rpc).not.toHaveBeenCalledWith(
    'submit_game_score',
    expect.anything(),
  );
  await act(async () => {
    expect(await result.current.submitAlias('SayıUstası')).toBe(true);
  });
  expect(supabase.rpc).toHaveBeenCalledWith('submit_game_score', {
    p_game_id: 7,
    p_score: 35,
  });
  expect(supabase.rpc).toHaveBeenCalledWith('submit_game_score', {
    p_game_id: 7,
    p_score: 20,
  });
  expect(result.current.totalScore).toBe(55);
  await act(async () => {
    await result.current.submitAlias('SayıUstası');
  });
  expect(
    vi
      .mocked(supabase.rpc)
      .mock.calls.filter(([name]) => name === 'submit_game_score'),
  ).toHaveLength(2);
});

it('retains failed pending scores for retry without resubmitting already saved scores', async () => {
  const router = { push: vi.fn() };
  const { result } = renderHook(() => useGamesPageData(router));
  await waitFor(() => expect(result.current.loading).toBe(false));
  const game = { id: 7 } as GameDefinition;
  await act(async () => {
    await result.current.recordScore(35, game);
    await result.current.recordScore(20, game);
  });
  const defaultRpc = vi.mocked(supabase.rpc).getMockImplementation()!;
  let fail = true;
  vi.mocked(supabase.rpc).mockImplementation((...args) => {
    if (args[0] === 'submit_game_score' && args[1]?.p_score === 20 && fail) {
      return { data: null, error: { message: 'Geçici hata' } } as never;
    }
    return defaultRpc(...args);
  });
  await act(async () => {
    expect(await result.current.submitAlias('SayıUstası')).toBe(false);
  });
  expect(result.current.aliasError).toContain('Bekleyen skor kaydedilemedi');
  fail = false;
  await act(async () => {
    expect(await result.current.submitAlias('SayıUstası')).toBe(true);
  });
  const calls = vi
    .mocked(supabase.rpc)
    .mock.calls.filter(([name]) => name === 'submit_game_score');
  expect(calls.map(([, params]) => params?.p_score)).toEqual([35, 20, 20]);
  expect(result.current.totalScore).toBe(55);
});
