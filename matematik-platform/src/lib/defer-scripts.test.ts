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
});
