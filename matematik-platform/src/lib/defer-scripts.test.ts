import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadDeferredScript } from './defer-scripts';

describe('loadDeferredScript', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = '';
  });

  it('injects script on user interaction', () => {
    const cleanup = loadDeferredScript('https://example.com/test-script.js', { 'data-test': 'true' });

    window.dispatchEvent(new Event('click'));

    const script = document.querySelector('script[src="https://example.com/test-script.js"]');
    expect(script).not.toBeNull();
    expect(script?.getAttribute('data-test')).toBe('true');
    expect((script as HTMLScriptElement)?.async).toBe(true);

    cleanup();
  });

  it('does not inject duplicate scripts if already present', () => {
    const existing = document.createElement('script');
    existing.src = 'https://example.com/existing.js';
    document.head.appendChild(existing);

    const cleanup = loadDeferredScript('https://example.com/existing.js');
    window.dispatchEvent(new Event('click'));

    const scripts = document.querySelectorAll('script[src="https://example.com/existing.js"]');
    expect(scripts.length).toBe(1);

    cleanup();
  });

  it('cleans up event listeners and timers on cancel', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const cleanup = loadDeferredScript('https://example.com/cleanup-test.js');

    cleanup();
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('injects script via requestIdleCallback and cancels with cancelIdleCallback', () => {
    let idleCb: (() => void) | undefined;
    const cancelIdleMock = vi.fn();
    (window as unknown as { requestIdleCallback?: unknown; cancelIdleCallback?: unknown }).requestIdleCallback = vi.fn((cb: () => void) => {
      idleCb = cb;
      return 42;
    });
    (window as unknown as { cancelIdleCallback?: unknown }).cancelIdleCallback = cancelIdleMock;

    try {
      const cleanup = loadDeferredScript('https://example.com/idle-script.js');

      // Trigger idle callback
      if (idleCb) {
        (idleCb as () => void)();
      }

      const script = document.querySelector('script[src="https://example.com/idle-script.js"]');
      expect(script).not.toBeNull();

      cleanup();
      expect(cancelIdleMock).toHaveBeenCalledWith(42);
    } finally {
      delete (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback;
      delete (window as unknown as { cancelIdleCallback?: unknown }).cancelIdleCallback;
    }
  });

  it('injects script via setTimeout when requestIdleCallback is unavailable', () => {
    vi.useFakeTimers();
    try {
      const cleanup = loadDeferredScript('https://example.com/timeout-script.js');
      expect(document.querySelector('script[src="https://example.com/timeout-script.js"]')).toBeNull();

      vi.advanceTimersByTime(2600);

      expect(document.querySelector('script[src="https://example.com/timeout-script.js"]')).not.toBeNull();
      cleanup();
    } finally {
      vi.useRealTimers();
    }
  });
});
