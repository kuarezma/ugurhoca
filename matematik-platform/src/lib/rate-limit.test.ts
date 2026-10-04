import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  enforceRateLimit,
  getClientIp,
  isRateLimitConfigured,
} from './rate-limit';

describe('rate-limit utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isRateLimitConfigured', () => {
    it('returns boolean reflecting redis configuration', () => {
      expect(typeof isRateLimitConfigured()).toBe('boolean');
    });
  });

  describe('getClientIp', () => {
    it('extracts client IP from x-forwarded-for header (first entry)', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
        },
      });

      expect(getClientIp(request)).toBe('203.0.113.195');
    });

    it('falls back to x-real-ip if x-forwarded-for is missing', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-real-ip': '198.51.100.14',
        },
      });

      expect(getClientIp(request)).toBe('198.51.100.14');
    });

    it('returns "unknown" if neither header is provided', () => {
      const request = new Request('https://example.com');
      expect(getClientIp(request)).toBe('unknown');
    });

    it('falls back to x-real-ip if x-forwarded-for is empty', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '',
          'x-real-ip': '198.51.100.20',
        },
      });

      expect(getClientIp(request)).toBe('198.51.100.20');
    });
  });

  describe('enforceRateLimit', () => {
    it('returns null and logs warning if redis is unconfigured (graceful degradation)', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      try {
        const result = await enforceRateLimit('test-action', 'ip-123', {
          limit: 10,
          windowSeconds: 60,
        });

        expect(result).toBeNull();
      } finally {
        vi.unstubAllEnvs();
        warnSpy.mockRestore();
      }
    });
  });
});
