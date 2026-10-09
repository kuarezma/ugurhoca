import { describe, it, expect, vi, afterEach } from 'vitest';
import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('modern clipboard API desteklendiğinde başarıyla kopyalar', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    const result = await copyToClipboard('https://ugurhoca.com/icerikler?id=123');
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('https://ugurhoca.com/icerikler?id=123');
  });

  it('clipboard API hata verirse textarea fallback ile kopyalar', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) },
      configurable: true,
      writable: true,
    });

    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    const result = await copyToClipboard('test-text');
    expect(result).toBe(true);
    expect(execCommandMock).toHaveBeenCalledWith('copy');
  });
});
