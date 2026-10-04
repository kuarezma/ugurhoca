import { describe, expect, it } from 'vitest';
import {
  isGraduateGrade,
  normalizeGrade,
  toDisplayGrade,
  toStoredGrade,
} from './grade';

describe('kanonik sınıf dönüşümü', () => {
  it.each([0, '0', '00', 'Mezun'])(
    'Mezun %s: depolama 0 ve görüntü Mezun',
    (value) => {
      expect(toStoredGrade(value)).toBe(0);
      expect(toDisplayGrade(value)).toBe('Mezun');
      expect(normalizeGrade(value)).toBe('Mezun');
      expect(isGraduateGrade(value)).toBe(true);
    },
  );
  it.each([5, 8, 12, '07'])('sayısal sınıfı korur: %s', (value) => {
    expect(toStoredGrade(value)).toBe(Number(value));
    expect(toDisplayGrade(value)).toBe(Number(value));
    expect(isGraduateGrade(value)).toBe(false);
  });
  it.each([
    null,
    undefined,
    '',
    'mezun',
    ' 0',
    true,
    [],
    -1,
    7.5,
    NaN,
    '9007199254740992',
  ])('geçersiz depolama girdisini reddeder: %s', (value) => {
    expect(() => toStoredGrade(value)).toThrow('Geçersiz sınıf düzeyi.');
    expect(toDisplayGrade(value)).toBe(5);
  });
});
