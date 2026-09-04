import type { LiveLesson } from '@/features/live-lessons/types';

function padZero(num: number): string {
  return String(num).padStart(2, '0');
}

export function formatUtcToCalendarIso(date: Date): string {
  return (
    date.getUTCFullYear() +
    padZero(date.getUTCMonth() + 1) +
    padZero(date.getUTCDate()) +
    'T' +
    padZero(date.getUTCHours()) +
    padZero(date.getUTCMinutes()) +
    padZero(date.getUTCSeconds()) +
    'Z'
  );
}

export function buildGoogleCalendarUrl(lesson: Pick<LiveLesson, 'title' | 'description' | 'starts_at' | 'duration_minutes' | 'room_id'>): string {
  const startDate = new Date(lesson.starts_at);
  const endDate = new Date(startDate.getTime() + (lesson.duration_minutes || 60) * 60 * 1000);

  const startIso = formatUtcToCalendarIso(startDate);
  const endIso = formatUtcToCalendarIso(endDate);

  const details = [
    lesson.description || 'Uğur Hoca Matematik Canlı Dersi',
    '',
    `Ders Odası Linki: https://ugurhoca.com/canli-ders/d/${lesson.room_id}`,
  ].join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: lesson.title,
    dates: `${startIso}/${endIso}`,
    details,
    location: `https://ugurhoca.com/canli-ders/d/${lesson.room_id}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsFileContent(lesson: Pick<LiveLesson, 'title' | 'description' | 'starts_at' | 'duration_minutes' | 'room_id'>): string {
  const startDate = new Date(lesson.starts_at);
  const endDate = new Date(startDate.getTime() + (lesson.duration_minutes || 60) * 60 * 1000);
  const now = new Date();

  const uid = `lesson-${lesson.room_id}-${startDate.getTime()}@ugurhoca.com`;
  const startIso = formatUtcToCalendarIso(startDate);
  const endIso = formatUtcToCalendarIso(endDate);
  const stampIso = formatUtcToCalendarIso(now);
  const description = (lesson.description || 'Uğur Hoca Canlı Matematik Dersi')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ugur Hoca//Matematik Platformu//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stampIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${lesson.title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${description}\\nhttps://ugurhoca.com/canli-ders/d/${lesson.room_id}`,
    `LOCATION:https://ugurhoca.com/canli-ders/d/${lesson.room_id}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(lesson: Pick<LiveLesson, 'title' | 'description' | 'starts_at' | 'duration_minutes' | 'room_id'>): void {
  if (typeof window === 'undefined') return;

  const icsContent = generateIcsFileContent(lesson);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${lesson.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatTimeRemaining(
  startsAt: string,
  durationMinutes = 60,
  nowTimestamp = Date.now(),
): {
  badgeColor: 'emerald' | 'amber' | 'slate' | 'red';
  isLiveNow: boolean;
  isPast: boolean;
  label: string;
} {
  const startTime = new Date(startsAt).getTime();
  if (!Number.isFinite(startTime)) {
    return { badgeColor: 'slate', isLiveNow: false, isPast: false, label: '-' };
  }

  const endTime = startTime + durationMinutes * 60 * 1000;
  const diffMs = startTime - nowTimestamp;

  if (nowTimestamp >= startTime && nowTimestamp <= endTime) {
    const remainingMins = Math.max(1, Math.round((endTime - nowTimestamp) / 60000));
    return {
      badgeColor: 'red',
      isLiveNow: true,
      isPast: false,
      label: `Şu an canlıda · ${remainingMins} dk kaldı`,
    };
  }

  if (nowTimestamp > endTime) {
    return {
      badgeColor: 'slate',
      isLiveNow: false,
      isPast: true,
      label: 'Ders tamamlandı',
    };
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes <= 0) {
    return {
      badgeColor: 'red',
      isLiveNow: true,
      isPast: false,
      label: 'Başlamak üzere',
    };
  }

  if (diffMinutes < 60) {
    return {
      badgeColor: 'amber',
      isLiveNow: false,
      isPast: false,
      label: `${diffMinutes} dakika kaldı`,
    };
  }

  if (diffHours < 24) {
    const remainingMinutes = diffMinutes % 60;
    return {
      badgeColor: 'emerald',
      isLiveNow: false,
      isPast: false,
      label:
        remainingMinutes > 0
          ? `${diffHours} sa ${remainingMinutes} dk kaldı`
          : `${diffHours} saat kaldı`,
    };
  }

  return {
    badgeColor: 'emerald',
    isLiveNow: false,
    isPast: false,
    label: `${diffDays} gün kaldı`,
  };
}
