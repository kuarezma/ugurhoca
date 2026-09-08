import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PerformanceRuntimeProvider } from './PerformanceRuntimeProvider';
import * as runtime from '@/lib/performance-runtime';
import * as rum from '@/lib/rum';

describe('PerformanceRuntimeProvider', () => {
  it('calls initPerformanceRuntime and initRUM on mount and cleans up on unmount', () => {
    const cleanupRuntimeMock = vi.fn();
    const cleanupRUMMock = vi.fn();
    const initRuntimeSpy = vi.spyOn(runtime, 'initPerformanceRuntime').mockReturnValue(cleanupRuntimeMock);
    const initRUMSpy = vi.spyOn(rum, 'initRUM').mockReturnValue(cleanupRUMMock);

    const { unmount } = render(<PerformanceRuntimeProvider />);
    expect(initRuntimeSpy).toHaveBeenCalledTimes(1);
    expect(initRUMSpy).toHaveBeenCalledTimes(1);

    unmount();
    expect(cleanupRuntimeMock).toHaveBeenCalledTimes(1);
    expect(cleanupRUMMock).toHaveBeenCalledTimes(1);
  });
});
