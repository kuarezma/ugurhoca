import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PerformanceRuntimeProvider } from './PerformanceRuntimeProvider';
import * as runtime from '@/lib/performance-runtime';

describe('PerformanceRuntimeProvider', () => {
  it('calls initPerformanceRuntime on mount and cleans up on unmount', () => {
    const cleanupMock = vi.fn();
    const initSpy = vi.spyOn(runtime, 'initPerformanceRuntime').mockReturnValue(cleanupMock);

    const { unmount } = render(<PerformanceRuntimeProvider />);
    expect(initSpy).toHaveBeenCalledTimes(1);

    unmount();
    expect(cleanupMock).toHaveBeenCalledTimes(1);
  });
});
