import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './safe-redirect-path';

describe('safeRedirectPath', () => {
  it.each([
    null,
    undefined,
    '',
    'https://evil.com',
    '//evil.com',
    String.raw`/\evil.com`,
    String.raw`\evil.com`,
    '/%5Cevil.com',
    '/%5cevil.com',
    '/%2Fevil.com',
    '/%255Cevil.com',
    '/%252Fevil.com',
    '/ok?next=%5Cevil.com',
    '/%09/evil.com',
    '/%0a/evil.com',
    '/%00evil.com',
    '/%ZZ',
    '/a/..//evil.com',
    'javascript:alert(1)',
  ])('rejects unsafe target %s', (value) => {
    expect(safeRedirectPath(value)).toBe('/');
  });

  it.each([
    '/profil',
    '/icerikler?grade=8#test',
    '/icerikler?q=%C3%A7arpma',
    '/',
  ])('preserves safe local target %s', (value) => {
    expect(safeRedirectPath(value)).toBe(value);
  });
});
