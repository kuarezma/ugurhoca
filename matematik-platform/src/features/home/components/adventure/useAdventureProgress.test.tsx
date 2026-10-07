import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdventureProgress } from './useAdventureProgress';
import { loadAdventureProgress } from './adventure-queries';

vi.mock('./adventure-queries', () => ({ loadAdventureProgress: vi.fn() }));
const data = { currentStreak: 2, quizCount: 3, badgeCount: 1, topics: [] };

describe('useAdventureProgress', () => {
  beforeEach(() => vi.clearAllMocks());
  it('does not query without login, clears previous counts and ignores a stale response', async () => {
    let resolveOld!: (value: typeof data) => void;
    vi.mocked(loadAdventureProgress)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValueOnce({ ...data, quizCount: 8 });
    const { result, rerender } = renderHook(
      ({ id }: { id?: string }) => useAdventureProgress(id),
      { initialProps: { id: undefined as string | undefined } },
    );
    expect(loadAdventureProgress).not.toHaveBeenCalled();
    rerender({ id: 'old' });
    rerender({ id: 'new' });
    expect(result.current.data).toBeNull();
    await waitFor(() => expect(result.current.data?.quizCount).toBe(8));
    await act(async () => resolveOld(data));
    expect(result.current.data?.quizCount).toBe(8);
    rerender({ id: undefined });
    expect(result.current.data).toBeNull();
  });
  it('shows a failure without fabricated counts and retries', async () => {
    vi.mocked(loadAdventureProgress)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(data);
    const { result } = renderHook(() => useAdventureProgress('student'));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.data).toBeNull();
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.data).toEqual(data));
  });
});
