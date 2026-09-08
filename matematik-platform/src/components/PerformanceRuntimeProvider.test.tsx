import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PerformanceRuntimeProvider } from './PerformanceRuntimeProvider';
import * as runtime from '@/lib/performance-runtime';

describe('PerformanceRuntimeProvider', () => {
  it('calls initPerformanceRuntime on mount and cleans it up on unmount', () => {
    const cleanupRuntimeMock = vi.fn();
    const initRuntimeSpy = vi.spyOn(runtime, 'initPerformanceRuntime').mockReturnValue(cleanupRuntimeMock);

    const { unmount } = render(<PerformanceRuntimeProvider />);
    expect(initRuntimeSpy).toHaveBeenCalledTimes(1);

    unmount();
    expect(cleanupRuntimeMock).toHaveBeenCalledTimes(1);
  });
});
