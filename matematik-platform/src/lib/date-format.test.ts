import { describe, it, expect } from 'vitest';
import {
  ISTANBUL_TIME_ZONE,
  formatIstanbulDate,
  formatIstanbulDateTime,
  formatIstanbulTime,
} from './date-format';

describe('date-format (Europe/Istanbul)', () => {
  it('ISTANBUL_TIME_ZONE Europe/Istanbul sabitini tanımlar', () => {
    expect(ISTANBUL_TIME_ZONE).toBe('Europe/Istanbul');
  });

  describe('gece yarısı sınırındaki UTC zaman damgaları (UTC+3 İstanbul)', () => {
    // 2026-11-09 22:30:00 UTC -> İstanbul'da 2026-11-10 01:30:00 (+3 saat)
    const midnightBoundaryUtc = '2026-11-09T22:30:00.000Z';

    it('formatIstanbulDate bir sonraki güne geçen tarihi doğru gösterir', () => {
      const formatted = formatIstanbulDate(midnightBoundaryUtc);
      // tr-TR varsayılan format: '10.11.2026'
      expect(formatted).toBe('10.11.2026');
    });

    it('formatIstanbulDateTime İstanbul saatine göre tarih ve saati birleştirir', () => {
      const formatted = formatIstanbulDateTime(midnightBoundaryUtc, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      // '10 Kas 2026 01:30' veya '10 Kas 2026, 01:30'
      expect(formatted).toContain('10 Kas 2026');
      expect(formatted).toContain('01:30');
    });

    it('formatIstanbulTime varsayılan olarak saat ve dakikayı İstanbul saatine göre döner', () => {
      const formatted = formatIstanbulTime(midnightBoundaryUtc);
      expect(formatted).toBe('01:30');
    });
  });

  describe('özel seçenekler (options)', () => {
    const testIso = '2026-04-15T09:05:00.000Z'; // İstanbul'da 12:05

    it('formatIstanbulDate verilen Intl seçeneklerini uygular', () => {
      const formatted = formatIstanbulDate(testIso, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      expect(formatted).toBe('15 Nisan 2026');
    });

    it('formatIstanbulTime saniyeli seçenek verildiğinde saniyeyi de gösterir', () => {
      const formatted = formatIstanbulTime(testIso, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      expect(formatted).toBe('12:05:00');
    });
  });

  describe('geçersiz veya uç değerler', () => {
    it('geçersiz tarih stringi verildiğinde string girdiyi korur', () => {
      expect(formatIstanbulDate('invalid-date')).toBe('invalid-date');
      expect(formatIstanbulDateTime('invalid-date')).toBe('invalid-date');
      expect(formatIstanbulTime('invalid-date')).toBe('invalid-date');
    });

    it('geçersiz Date nesnesi verildiğinde boş string döner', () => {
      const invalidDate = new Date(NaN);
      expect(formatIstanbulDate(invalidDate)).toBe('');
      expect(formatIstanbulDateTime(invalidDate)).toBe('');
      expect(formatIstanbulTime(invalidDate)).toBe('');
    });

    it('timestamp (number) girdilerini doğru işler', () => {
      // 2026-11-09T22:30:00.000Z in milliseconds
      const timestamp = Date.parse('2026-11-09T22:30:00.000Z');
      expect(formatIstanbulDate(timestamp)).toBe('10.11.2026');
      expect(formatIstanbulTime(timestamp)).toBe('01:30');
    });
  });
});
