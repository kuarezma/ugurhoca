import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLgsSchoolTargets } from './useLgsSchoolTargets';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useLgsSchoolTargets', () => {
  it('reports a timeout and retries the request', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url: string, options: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result, unmount } = renderHook(() => useLgsSchoolTargets());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('zamanında yüklenemedi');
    act(() => result.current.retry());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(true);
    unmount();
  });
});
