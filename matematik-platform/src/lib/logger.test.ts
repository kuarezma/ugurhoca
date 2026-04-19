import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLogger } from './logger';

describe('createLogger', () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefixes messages with the provided scope', () => {
    const log = createLogger('unit-test');
    log.info('hello');
    expect(infoSpy).toHaveBeenCalledTimes(1);
    const firstArg = infoSpy.mock.calls[0][0] as string;
    expect(firstArg).toContain('[ugur-hoca:unit-test]');
    expect(firstArg).toContain('hello');
  });

  it('passes context object when provided', () => {
    const log = createLogger('unit-test');
    log.info('with context', { userId: 1 });
    expect(infoSpy.mock.calls[0][1]).toEqual({ userId: 1 });
  });

  it('routes warn messages to console.warn', () => {
    const log = createLogger('x');
    log.warn('careful');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('serializes Error objects on error()', () => {
    const log = createLogger('x');
    const err = new Error('boom');
    log.error('failed', err, { id: 42 });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const ctx = errorSpy.mock.calls[0][1] as Record<string, unknown>;
    expect(ctx.id).toBe(42);
    const loggedError = ctx.error as { name: string; message: string };
    expect(loggedError.name).toBe('Error');
    expect(loggedError.message).toBe('boom');
  });

  it('keeps raw non-Error values on error()', () => {
    const log = createLogger('x');
    log.error('failed', { code: 'E_BAD' });
    const ctx = errorSpy.mock.calls[0][1] as Record<string, unknown>;
    expect(ctx.error).toEqual({ code: 'E_BAD' });
  });
});
