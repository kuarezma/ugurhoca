import { describe, expect, it } from 'vitest';
import {
  buildGoogleCalendarUrl,
  formatTimeRemaining,
  formatUtcToCalendarIso,
  generateIcsFileContent,
} from './calendar-helpers';

describe('calendar-helpers', () => {
  const mockLesson = {
    title: '8. Sınıf Üslü Sayılar Soru Çözümü',
    description: 'Yeni nesil sorular ve LGS taktikleri',
    starts_at: '2026-09-04T15:00:00.000Z',
    duration_minutes: 45,
    room_id: 'oda-123',
  };

  it('formats UTC date into calendar ISO string correctly', () => {
    const d = new Date('2026-09-04T15:00:00.000Z');
    expect(formatUtcToCalendarIso(d)).toBe('20260904T150000Z');
  });

  it('builds a valid Google Calendar URL', () => {
    const url = buildGoogleCalendarUrl(mockLesson);
    expect(url).toContain('calendar.google.com/calendar/render');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain('20260904T150000Z%2F20260904T154500Z');
    expect(url).toContain('oda-123');
  });

  it('generates valid iCal .ics content with correct VEVENT headers', () => {
    const ics = generateIcsFileContent(mockLesson);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:8. Sınıf Üslü Sayılar Soru Çözümü');
    expect(ics).toContain('DTSTART:20260904T150000Z');
    expect(ics).toContain('DTEND:20260904T154500Z');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  describe('formatTimeRemaining', () => {
    const startIso = '2026-09-04T15:00:00.000Z';
    const startTime = new Date(startIso).getTime();

    it('returns "Şu an canlıda" when now is within lesson timeframe', () => {
      const result = formatTimeRemaining(startIso, 60, startTime + 10 * 60 * 1000);
      expect(result.isLiveNow).toBe(true);
      expect(result.badgeColor).toBe('red');
      expect(result.label).toContain('Şu an canlıda');
    });

    it('returns "Ders tamamlandı" when lesson has ended', () => {
      const result = formatTimeRemaining(startIso, 60, startTime + 65 * 60 * 1000);
      expect(result.isPast).toBe(true);
      expect(result.badgeColor).toBe('slate');
      expect(result.label).toBe('Ders tamamlandı');
    });

    it('returns minutes remaining when lesson is within an hour', () => {
      const result = formatTimeRemaining(startIso, 60, startTime - 25 * 60 * 1000);
      expect(result.isLiveNow).toBe(false);
      expect(result.badgeColor).toBe('amber');
      expect(result.label).toBe('25 dakika kaldı');
    });

    it('returns hours and minutes when lesson is today', () => {
      const result = formatTimeRemaining(startIso, 60, startTime - (2 * 60 + 15) * 60 * 1000);
      expect(result.isLiveNow).toBe(false);
      expect(result.badgeColor).toBe('emerald');
      expect(result.label).toBe('2 sa 15 dk kaldı');
    });

    it('returns days remaining when lesson is several days away', () => {
      const result = formatTimeRemaining(startIso, 60, startTime - 3 * 24 * 60 * 60 * 1000);
      expect(result.isLiveNow).toBe(false);
      expect(result.label).toBe('3 gün kaldı');
    });
  });
});
