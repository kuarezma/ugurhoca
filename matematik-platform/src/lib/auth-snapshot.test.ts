import { describe, expect, it } from 'vitest';
import {
  parseAuthSnapshot,
  serializeAuthSnapshot,
  type AuthSnapshot,
} from '@/lib/auth-snapshot';

describe('auth snapshot helpers', () => {
  it('serializes and parses a valid snapshot', () => {
    const snapshot: AuthSnapshot = {
      email: 'ogrenci@example.com',
      grade: 7,
      id: 'user-1',
      isAdmin: false,
      name: 'Öğrenci',
    };

    expect(parseAuthSnapshot(serializeAuthSnapshot(snapshot))).toEqual(snapshot);
  });

  it('returns null for invalid payloads', () => {
    expect(parseAuthSnapshot(undefined)).toBeNull();
    expect(parseAuthSnapshot(encodeURIComponent('{"id":1}'))).toBeNull();
  });

  it('fills a fallback name for legacy snapshots', () => {
    const legacy = encodeURIComponent(
      JSON.stringify({
        email: 'ogrenci@example.com',
        grade: 7,
        id: 'user-1',
        isAdmin: false,
      }),
    );

    expect(parseAuthSnapshot(legacy)).toEqual({
      email: 'ogrenci@example.com',
      grade: 7,
      id: 'user-1',
      isAdmin: false,
      name: 'Öğrenci',
    });
  });
});
