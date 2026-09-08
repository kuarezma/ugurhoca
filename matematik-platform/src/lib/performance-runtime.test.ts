import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isDataSaverOrSlowConnection,
  yieldToMain,
  initPerformanceRuntime,
} from './performance-runtime';

describe('performance-runtime', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('detects saveData and slow connections correctly', () => {
    // Normal fast connection
    Object.defineProperty(global, 'navigator', {
      value: {
        connection: { saveData: false, effectiveType: '4g' },
      },
      configurable: true,
    });
    expect(isDataSaverOrSlowConnection()).toBe(false);

    // SaveData enabled
    Object.defineProperty(global, 'navigator', {
      value: {
        connection: { saveData: true, effectiveType: '4g' },
      },
      configurable: true,
    });
    expect(isDataSaverOrSlowConnection()).toBe(true);

    // 2g connection
    Object.defineProperty(global, 'navigator', {
      value: {
        connection: { saveData: false, effectiveType: '2g' },
      },
      configurable: true,
    });
    expect(isDataSaverOrSlowConnection()).toBe(true);
  });

  it('yieldToMain resolves cleanly', async () => {
    await expect(yieldToMain()).resolves.toBeUndefined();
  });

  it('initializes runtime and cleans up event listeners properly', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');

    const cleanup = initPerformanceRuntime();
    expect(addEventSpy).toHaveBeenCalledWith('pageshow', expect.any(Function), { passive: true });
    expect(addEventSpy).toHaveBeenCalledWith('pagehide', expect.any(Function), { passive: true });

    cleanup();
    expect(removeEventSpy).toHaveBeenCalledWith('pageshow', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('pagehide', expect.any(Function));
  });
});
