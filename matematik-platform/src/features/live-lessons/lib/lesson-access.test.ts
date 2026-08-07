import { describe, expect, it } from 'vitest';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  toClientLiveLesson,
} from '@/features/live-lessons/lib/lesson-access';
import type { LiveLesson } from '@/features/live-lessons/types';

// Regresyon: forge edilmiş auth-snapshot çereziyle canlı-ders öğretmen yetkisine
// yükselme açığı (kimliksiz kullanıcı → çocukların dersinde kamera/mikrofon).
describe('isLiveLessonAdmin', () => {
  it('istemciden gelen forge edilmiş isAdmin bayrağını yok sayar', () => {
    const forgedStudent = { email: 'ogrenci@example.com', isAdmin: true };
    expect(isLiveLessonAdmin(forgedStudent)).toBe(false);
  });

  it('yetkiyi yalnızca doğrulanmış admin e-postasından türetir', () => {
    expect(isLiveLessonAdmin({ email: 'admin@ugurhoca.com' })).toBe(true);
    expect(isLiveLessonAdmin({ email: null })).toBe(false);
    expect(isLiveLessonAdmin({ email: undefined })).toBe(false);
  });
});

describe('toClientLiveLesson', () => {
  const baseLesson: LiveLesson = {
    id: 'lesson-1',
    room_id: 'abcd1234',
    title: 'Kesirler',
    target_grade: '5',
    starts_at: '2026-08-07T10:00:00.000Z',
    duration_minutes: 60,
    status: 'scheduled',
    teacher_proof: 'HMAC_SECRET_PROOF',
  };

  it('teacher_proof sütununu istemciye geçmeden önce düşürür', () => {
    const client = toClientLiveLesson(baseLesson);
    expect(client.teacher_proof).toBeUndefined();
    expect(client.id).toBe('lesson-1');
    expect(client.room_id).toBe('abcd1234');
  });

  it('kaynak nesneyi mutasyona uğratmaz', () => {
    toClientLiveLesson(baseLesson);
    expect(baseLesson.teacher_proof).toBe('HMAC_SECRET_PROOF');
  });
});

describe('canUserAccessLiveLesson', () => {
  const lesson = (overrides: Partial<LiveLesson>): LiveLesson => ({
    id: 'l',
    room_id: 'room1234',
    title: 't',
    target_grade: '5',
    starts_at: '',
    duration_minutes: 60,
    status: 'scheduled',
    ...overrides,
  });

  it('herkese açık dersi her öğrenciye açar', () => {
    expect(
      canUserAccessLiveLesson(lesson({ target_grade: 'all' }), { grade: 8, id: 'u1' }),
    ).toBe(true);
  });

  it('yalnızca hedef sınıfa açar', () => {
    expect(
      canUserAccessLiveLesson(lesson({ target_grade: '5' }), { grade: 5, id: 'u1' }),
    ).toBe(true);
    expect(
      canUserAccessLiveLesson(lesson({ target_grade: '5' }), { grade: 6, id: 'u1' }),
    ).toBe(false);
  });

  it('seçili öğrenci dersinde yalnızca listedeki öğrenciye açar', () => {
    const selective = lesson({ target_grade: 'selected', target_student_ids: ['u1'] });
    expect(canUserAccessLiveLesson(selective, { grade: 5, id: 'u1' })).toBe(true);
    expect(canUserAccessLiveLesson(selective, { grade: 5, id: 'u2' })).toBe(false);
  });
});
