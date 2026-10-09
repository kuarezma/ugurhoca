import { afterEach, describe, expect, it, vi } from 'vitest';
import { runContentRead } from './read-timeout';

afterEach(() => vi.useRealTimers());

describe('content read timeout', () => {
  it('yanıt gelmezse isteği iptal eder ve UI beklemesini sonlandırır', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const pending = runContentRead((readSignal) => {
      signal = readSignal;
      return new Promise(() => {});
    });
    const result = expect(pending).rejects.toThrow(
      'İçerik kaynağı yanıt vermedi',
    );
    await vi.advanceTimersByTimeAsync(10_000);
    await result;
    expect(signal?.aborted).toBe(true);
    expect(signal?.reason.name).toBe('AbortError');
  });

  it('başarılı sorgunun zamanlayıcısını temizler', async () => {
    vi.useFakeTimers();
    await expect(runContentRead(() => Promise.resolve('ready'))).resolves.toBe(
      'ready',
    );
    expect(vi.getTimerCount()).toBe(0);
  });
});
