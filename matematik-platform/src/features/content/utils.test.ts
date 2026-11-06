import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatContentDate } from './utils';

afterEach(() => vi.unstubAllEnvs());

describe('formatContentDate', () => {
  it.each(['UTC', 'Europe/Istanbul', 'America/Los_Angeles'])(
    '%s ortamında belge tarihini İstanbul takvimine göre gösterir',
    (timeZone) => {
      vi.stubEnv('TZ', timeZone);

      expect(formatContentDate('2026-11-03T21:00:00.000Z')).toBe('04 Kas 2026');
      expect(formatContentDate('2026-12-31T22:30:00.000Z')).toBe('01 Oca 2027');
    },
  );

  it.each([null, undefined, ''])(
    'boş tarihte yer tutucu gösterir: %s',
    (value) => {
      expect(formatContentDate(value)).toBe('-');
    },
  );
});
