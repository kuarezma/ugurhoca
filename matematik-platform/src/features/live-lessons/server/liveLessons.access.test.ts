import { beforeEach, describe, expect, it, vi } from 'vitest';

// Regresyon (F1-RLS incelemesi): service_role loader'ları RLS'i atlar.
// Eskiden filtre `target_student_ids.cs.{uid}` koşulunu hedef 'selected'
// olmadan OR'luyordu; başka hedefe çevrilmiş dersteki bayat dizi, dersi
// (kayıt/materyal linki, oda kimliği) başka sınıftaki öğrenciye döndürüyordu.

const mockGetVerifiedServerUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/auth-verify.server', () => ({
  getVerifiedServerUser: () => mockGetVerifiedServerUser(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({ from: mockFrom }),
  createServerSupabaseClient: () => ({ from: mockFrom }),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

type Call = { args: unknown[]; method: string };
type Result = { data: unknown; error: unknown };
type Chain = { [method: string]: (...args: unknown[]) => Chain } & PromiseLike<Result>;

let chains: Array<{ calls: Call[]; table: string }> = [];
let resolveChain: (table: string, calls: Call[]) => Result = () => ({ data: null, error: null });

// Her supabase.from(...) için çağrıları kaydeden, await edilince
// resolveChain'in sonucunu dönen zincirlenebilir sahte sorgu.
function createChain(table: string): Chain {
  const entry = { calls: [] as Call[], table };
  chains.push(entry);
  const chain: Chain = new Proxy({} as Chain, {
    get(_target, property) {
      if (property === 'then') {
        return (onFulfilled: (value: Result) => unknown, onRejected?: (reason: unknown) => unknown) =>
          Promise.resolve(resolveChain(table, entry.calls)).then(onFulfilled, onRejected);
      }
      return (...args: unknown[]) => {
        entry.calls.push({ args, method: String(property) });
        return chain;
      };
    },
  });
  return chain;
}

const STUDENT_ID = 'student-5';
const student = {
  accessGrade: '5',
  email: 'ogrenci5@example.com',
  grade: 5,
  id: STUDENT_ID,
  isAdmin: false,
  name: 'Öğrenci',
};

const baseLesson = {
  duration_minutes: 60,
  room_id: 'room',
  starts_at: '2026-10-04T10:00:00.000Z',
  status: 'active',
  teacher_proof: 'gizli',
};

const lessons = {
  all: { ...baseLesson, id: 'all', target_grade: 'all', target_student_ids: null, title: 'Herkes' },
  grade5: { ...baseLesson, id: 'grade5', target_grade: '5', target_student_ids: null, title: '5' },
  otherSelected: {
    ...baseLesson,
    id: 'other-selected',
    target_grade: 'selected',
    target_student_ids: ['someone-else'],
    title: 'Başkası seçili',
  },
  selectedMine: {
    ...baseLesson,
    id: 'selected-mine',
    target_grade: 'selected',
    target_student_ids: [STUDENT_ID],
    title: 'Ben seçiliyim',
  },
  // 'selected' iken öğrenci seçilmiş, sonra 6. sınıfa çevrilmiş; dizi bayat.
  staleGrade6: {
    ...baseLesson,
    id: 'stale-grade6',
    target_grade: '6',
    target_student_ids: [STUDENT_ID],
    recording_url: 'https://example.com/kayit',
    title: '6. sınıf (bayat dizi)',
  },
};

const orFilters = () =>
  chains.flatMap(({ calls }) => calls.filter((call) => call.method === 'or').map((call) => call.args[0]));

beforeEach(() => {
  vi.clearAllMocks();
  chains = [];
  mockFrom.mockImplementation((table: string) => createChain(table));
});

describe('loadLiveLessonsForCurrentUser', () => {
  it('bayat diziyle sınıf dersi başka sınıftaki öğrenciye dönmez', async () => {
    mockGetVerifiedServerUser.mockResolvedValue(student);
    // Sorgu filtresini delen bir satır gelse bile süzgeç onu atmalı.
    resolveChain = () => ({ data: Object.values(lessons), error: null });

    const { loadLiveLessonsForCurrentUser } = await import('./liveLessons');
    const result = await loadLiveLessonsForCurrentUser();

    expect(result.map((lesson) => lesson.id).sort()).toEqual(['all', 'grade5', 'selected-mine']);
    expect(result.every((lesson) => lesson.teacher_proof === undefined)).toBe(true);
    expect(orFilters()).toEqual([
      `target_grade.eq.all,and(target_grade.eq.selected,target_student_ids.cs.{${STUDENT_ID}}),target_grade.eq.5`,
    ]);
  });

  it('sınıfı çözülemeyen öğrenciye sınıf dersi dönmez', async () => {
    mockGetVerifiedServerUser.mockResolvedValue({ ...student, accessGrade: null });
    resolveChain = () => ({ data: Object.values(lessons), error: null });

    const { loadLiveLessonsForCurrentUser } = await import('./liveLessons');
    const result = await loadLiveLessonsForCurrentUser();

    expect(result.map((lesson) => lesson.id).sort()).toEqual(['all', 'selected-mine']);
    expect(String(orFilters()[0])).not.toContain('target_grade.eq.5');
  });

  it('eski şema geri dönüşünde de süzgeç uygulanır', async () => {
    mockGetVerifiedServerUser.mockResolvedValue(student);
    let first = true;
    resolveChain = () => {
      if (first) {
        first = false;
        return { data: null, error: { code: '42703', message: 'column does not exist' } };
      }
      return { data: Object.values(lessons), error: null };
    };

    const { loadLiveLessonsForCurrentUser } = await import('./liveLessons');
    const result = await loadLiveLessonsForCurrentUser();

    expect(result.map((lesson) => lesson.id).sort()).toEqual(['all', 'grade5', 'selected-mine']);
    expect(orFilters()[1]).toBe('target_grade.eq.all,target_grade.eq.5');
  });
});

describe('loadActiveLiveLessonForCurrentUser', () => {
  it('bayat diziyle sınıf dersi başka sınıftaki öğrenciye dönmez', async () => {
    mockGetVerifiedServerUser.mockResolvedValue(student);
    resolveChain = () => ({ data: [lessons.staleGrade6], error: null });

    const { loadActiveLiveLessonForCurrentUser } = await import('./liveLessons');

    await expect(loadActiveLiveLessonForCurrentUser()).resolves.toBeNull();
    expect(orFilters()).toEqual([
      `target_grade.eq.all,and(target_grade.eq.selected,target_student_ids.cs.{${STUDENT_ID}}),target_grade.eq.5`,
    ]);
  });
});

describe('updateLiveLesson', () => {
  const current = {
    ...baseLesson,
    id: 'lesson-1',
    status: 'scheduled',
    target_grade: 'selected',
    target_student_ids: [STUDENT_ID],
    title: 'Ders',
  };

  const updatePayload = () =>
    chains
      .flatMap(({ calls }) => calls)
      .find((call) => call.method === 'update')?.args[0] as Record<string, unknown> | undefined;

  beforeEach(() => {
    resolveChain = (table, calls) => {
      if (table !== 'live_lessons') return { data: [], error: null };
      const update = calls.find((call) => call.method === 'update');
      return {
        data: update ? { ...current, ...(update.args[0] as object) } : current,
        error: null,
      };
    };
  });

  it("hedef 'selected' dışına çevrilince target_student_ids'i null'a çeker", async () => {
    const { updateLiveLesson } = await import('./liveLessons');
    await updateLiveLesson({
      durationMinutes: 60,
      lessonId: 'lesson-1',
      startsAt: current.starts_at,
      targetGrade: '6',
      targetStudentIds: [STUDENT_ID],
      title: 'Ders',
    });

    expect(updatePayload()).toMatchObject({ target_grade: '6', target_student_ids: null });
  });

  it("hedef 'selected' kalınca seçili öğrenci listesini yazar", async () => {
    const { updateLiveLesson } = await import('./liveLessons');
    await updateLiveLesson({
      durationMinutes: 60,
      lessonId: 'lesson-1',
      startsAt: current.starts_at,
      targetGrade: 'selected',
      targetStudentIds: [STUDENT_ID, 'student-2'],
      title: 'Ders',
    });

    expect(updatePayload()).toMatchObject({
      target_grade: 'selected',
      target_student_ids: [STUDENT_ID, 'student-2'],
    });
  });
});
