import { describe, expect, it } from 'vitest';
import {
  canUserAccessLiveLesson,
  isLiveLessonAdmin,
  LIVE_LESSON_CLIENT_COLUMNS,
  liveLessonAudienceFilter,
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

// Regresyon: teacher_proof authenticated rolüne kolon düzeyinde kapalı
// (migration 20261004120000). Kullanıcı istemcisi select('*') yerine bu listeyi
// kullanır; liste teacher_proof'u içerirse sorgu 42501 ile düşer.
describe('LIVE_LESSON_CLIENT_COLUMNS', () => {
  const columns = LIVE_LESSON_CLIENT_COLUMNS.split(',').map((column) => column.trim());

  it('teacher_proof kolonunu istemez', () => {
    expect(columns).not.toContain('teacher_proof');
    expect(LIVE_LESSON_CLIENT_COLUMNS).not.toContain('*');
  });

  it('LiveLesson tipindeki teacher_proof dışındaki tüm alanları kapsar', () => {
    // Required<> sayesinde tipe yeni alan eklenince bu nesne derlenmez ve
    // liste güncellenmeye zorlanır.
    const everyField: Required<LiveLesson> = {
      created_at: null,
      created_by: null,
      description: null,
      duration_minutes: 60,
      ended_at: null,
      id: 'l',
      materials_url: null,
      recording_url: null,
      room_id: 'room1234',
      started_at: null,
      starts_at: '',
      status: 'scheduled',
      target_grade: '5',
      target_student_ids: null,
      teacher_proof: null,
      title: 't',
      updated_at: null,
    };
    const expected = Object.keys(everyField)
      .filter((key) => key !== 'teacher_proof')
      .sort();
    expect([...columns].sort()).toEqual(expected);
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
      canUserAccessLiveLesson(lesson({ target_grade: 'all' }), { accessGrade: '8', id: 'u1' }),
    ).toBe(true);
    expect(
      canUserAccessLiveLesson(lesson({ target_grade: 'all' }), { accessGrade: null, id: 'u1' }),
    ).toBe(true);
  });

  it('yalnızca hedef sınıfa açar', () => {
    expect(
      canUserAccessLiveLesson(lesson({ target_grade: '5' }), { accessGrade: '5', id: 'u1' }),
    ).toBe(true);
    expect(
      canUserAccessLiveLesson(lesson({ target_grade: '5' }), { accessGrade: '6', id: 'u1' }),
    ).toBe(false);
  });

  it('sınıfı çözülemeyen kullanıcıya sınıf dersini açmaz (varsayılan sınıf yok)', () => {
    expect(
      canUserAccessLiveLesson(lesson({ target_grade: '5' }), { accessGrade: null, id: 'u1' }),
    ).toBe(false);
  });

  it('seçili öğrenci dersinde yalnızca listedeki öğrenciye açar', () => {
    const selective = lesson({ target_grade: 'selected', target_student_ids: ['u1'] });
    expect(canUserAccessLiveLesson(selective, { accessGrade: '5', id: 'u1' })).toBe(true);
    expect(canUserAccessLiveLesson(selective, { accessGrade: '5', id: 'u2' })).toBe(false);
  });

  it('boş veya NULL seçimli dersi kimseye açmaz', () => {
    for (const target_student_ids of [null, []]) {
      const selective = lesson({ target_grade: 'selected', target_student_ids });
      expect(canUserAccessLiveLesson(selective, { accessGrade: '5', id: 'u1' })).toBe(false);
    }
  });

  it('sınıf dersindeki bayat target_student_ids başka sınıftaki öğrenciye açmaz', () => {
    const stale = lesson({ target_grade: '6', target_student_ids: ['u1'] });
    expect(canUserAccessLiveLesson(stale, { accessGrade: '5', id: 'u1' })).toBe(false);
  });
});

describe('liveLessonAudienceFilter', () => {
  it('diziyi yalnızca selected hedefiyle birlikte eşler', () => {
    expect(liveLessonAudienceFilter({ accessGrade: '7', id: 'u1' })).toBe(
      'target_grade.eq.all,and(target_grade.eq.selected,target_student_ids.cs.{u1}),target_grade.eq.7',
    );
  });

  it('sınıf çözülemezse sınıf koşulu eklemez', () => {
    expect(liveLessonAudienceFilter({ accessGrade: null, id: 'u1' })).toBe(
      'target_grade.eq.all,and(target_grade.eq.selected,target_student_ids.cs.{u1})',
    );
  });
});
