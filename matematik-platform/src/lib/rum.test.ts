import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initRUM } from './rum';

type MetricEntry = {
  startTime?: number;
  duration?: number;
  interactionId?: number;
};

type ObserverCallback = (list: { getEntries: () => MetricEntry[] }) => void;

describe('RUM Module', () => {
  let originalObserver: unknown;
  let latestCallback: ObserverCallback | null = null;
  let createdObservers: MockPerformanceObserver[] = [];

  class MockPerformanceObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    constructor(cb: ObserverCallback) {
      latestCallback = cb;
      createdObservers.push(this);
    }
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    createdObservers = [];
    latestCallback = null;
    originalObserver = (window as unknown as { PerformanceObserver?: unknown }).PerformanceObserver;
    (window as unknown as { PerformanceObserver: unknown }).PerformanceObserver = MockPerformanceObserver;
  });

  afterEach(() => {
    (window as unknown as { PerformanceObserver: unknown }).PerformanceObserver = originalObserver;
  });

  it('initializes and cleans up event listeners and observers safely', () => {
    const addEventSpy = vi.spyOn(document, 'addEventListener');
    const removeEventSpy = vi.spyOn(document, 'removeEventListener');

    const cleanup = initRUM();
    expect(addEventSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(createdObservers.length).toBeGreaterThan(0);

    cleanup();
    expect(removeEventSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    for (const obs of createdObservers) {
      expect(obs.disconnect).toHaveBeenCalled();
    }
  });

  it('triggers sendBeacon when page visibility changes to hidden', () => {
    const sendBeaconMock = vi.fn();
    Object.defineProperty(navigator, 'sendBeacon', {
      value: sendBeaconMock,
      configurable: true,
      writable: true,
    });

    const cleanup = initRUM('/api/rum');

    // Simulate metric callback
    if (latestCallback) {
      latestCallback({
        getEntries: () => [{ startTime: 1200, duration: 1200, interactionId: 1 }],
      });
    }

    // Simulate visibilitychange to hidden
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });

    document.dispatchEvent(new Event('visibilitychange'));

    expect(sendBeaconMock).toHaveBeenCalledWith('/api/rum', expect.stringContaining('"inp":1200'));

    cleanup();
  });
});
