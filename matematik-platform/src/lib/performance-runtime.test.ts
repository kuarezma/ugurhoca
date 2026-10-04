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

  it('handles BFCache pageshow and pagehide events when persisted', () => {
    const cleanup = initPerformanceRuntime();
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    document.documentElement.setAttribute('data-page-frozen', 'true');

    // Trigger pageshow with persisted: true
    const pageShowEvent = new Event('pageshow') as PageTransitionEvent;
    Object.defineProperty(pageShowEvent, 'persisted', { value: true });
    window.dispatchEvent(pageShowEvent);

    expect(document.documentElement.hasAttribute('data-page-frozen')).toBe(false);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'app:bfcache-restore' }),
    );

    // Trigger pagehide with persisted: true
    const pageHideEvent = new Event('pagehide') as PageTransitionEvent;
    Object.defineProperty(pageHideEvent, 'persisted', { value: true });
    window.dispatchEvent(pageHideEvent);

    expect(document.documentElement.getAttribute('data-page-frozen')).toBe('true');

    cleanup();
  });

  it('uses scheduler.yield when available', async () => {
    const yieldMock = vi.fn().mockResolvedValue(undefined);
    (window as unknown as { scheduler?: { yield: () => Promise<void> } }).scheduler = {
      yield: yieldMock,
    };

    try {
      await yieldToMain();
      expect(yieldMock).toHaveBeenCalledTimes(1);
    } finally {
      delete (window as unknown as { scheduler?: unknown }).scheduler;
    }
  });

  it('uses setTimeout fallback when MessageChannel is undefined', async () => {
    const origMessageChannel = global.MessageChannel;
    // @ts-expect-error test override
    delete global.MessageChannel;

    try {
      await expect(yieldToMain()).resolves.toBeUndefined();
    } finally {
      global.MessageChannel = origMessageChannel;
    }
  });

  it('handles slow-2g and undefined connection object', () => {
    Object.defineProperty(global, 'navigator', {
      value: { connection: { effectiveType: 'slow-2g' } },
      configurable: true,
    });
    expect(isDataSaverOrSlowConnection()).toBe(true);

    Object.defineProperty(global, 'navigator', {
      value: {},
      configurable: true,
    });
    expect(isDataSaverOrSlowConnection()).toBe(false);
  });
});
