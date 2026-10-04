import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createLiveLessons,
  LiveLessonInputError,
  updateLiveLesson,
} from './liveLessons';

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: () => ({ from: mockFrom }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

async function expectInputError(result: Promise<unknown>, message: string) {
  await expect(result).rejects.toBeInstanceOf(LiveLessonInputError);
  await expect(result).rejects.toMatchObject({ message });
}

describe('liveLessons input validation errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('LESSON_TEACHER_SECRET', 'test-teacher-secret-1234567890');
  });

  afterEach(() => vi.unstubAllEnvs());

  describe('createLiveLessons', () => {
    it('boş başlıkta LiveLessonInputError fırlatır', async () => {
      await expectInputError(
        createLiveLessons({
          durationMinutes: 60,
          startsAt: '2026-10-10T10:00:00Z',
          targetGrade: '5',
          title: '   ',
          userId: 'user-1',
        }),
        'Ders başlığı gerekli.',
      );
    });

    it('geçersiz tarihte LiveLessonInputError fırlatır', async () => {
      await expectInputError(
        createLiveLessons({
          durationMinutes: 60,
          startsAt: 'invalid-date',
          targetGrade: '5',
          title: 'Matematik Dersi',
          userId: 'user-1',
        }),
        'Geçerli bir tarih ve saat seçin.',
      );
    });

    it('geçersiz hedef sınıfta LiveLessonInputError fırlatır', async () => {
      await expectInputError(
        createLiveLessons({
          durationMinutes: 60,
          startsAt: '2026-10-10T10:00:00Z',
          targetGrade: 'invalid-grade',
          title: 'Matematik Dersi',
          userId: 'user-1',
        }),
        'Geçerli bir sınıf seçin.',
      );
    });

    it('selected modunda öğrenci seçilmemişse LiveLessonInputError fırlatır', async () => {
      await expectInputError(
        createLiveLessons({
          durationMinutes: 60,
          startsAt: '2026-10-10T10:00:00Z',
          targetGrade: 'selected',
          targetStudentIds: [],
          title: 'Matematik Dersi',
          userId: 'user-1',
        }),
        'En az bir öğrenci seçin.',
      );
    });

    it('geçersiz tekrar bitiş tarihinde LiveLessonInputError fırlatır', async () => {
      await expectInputError(
        createLiveLessons({
          durationMinutes: 60,
          repeatWeeklyUntil: 'invalid-date',
          startsAt: '2026-10-10T10:00:00Z',
          targetGrade: '5',
          title: 'Matematik Dersi',
          userId: 'user-1',
        }),
        'Geçerli bir tekrar bitiş tarihi seçin.',
      );
    });

    it('tekrar bitiş tarihi ders başlangıcından önce ise LiveLessonInputError fırlatır', async () => {
      await expectInputError(
        createLiveLessons({
          durationMinutes: 60,
          repeatWeeklyUntil: '2026-10-09T10:00:00Z',
          startsAt: '2026-10-10T10:00:00Z',
          targetGrade: '5',
          title: 'Matematik Dersi',
          userId: 'user-1',
        }),
        'Tekrar bitiş tarihi ders başlangıcından önce olamaz.',
      );
    });

    it('tekrar eden dersler 16 haftayı aşarsa LiveLessonInputError fırlatır', async () => {
      await expectInputError(
        createLiveLessons({
          durationMinutes: 60,
          repeatWeeklyUntil: '2027-04-10T10:00:00Z',
          startsAt: '2026-10-10T10:00:00Z',
          targetGrade: '5',
          title: 'Matematik Dersi',
          userId: 'user-1',
        }),
        'Tekrar eden dersler en fazla 16 hafta planlanabilir.',
      );
    });

    it('Supabase insert hatasını olduğu gibi fırlatır (LiveLessonInputError değildir)', async () => {
      const dbError = { code: 'XX000', message: 'Supabase insert failed' };
      mockFrom.mockReturnValue({
        insert: () => ({
          select: async () => ({ data: null, error: dbError }),
        }),
      });

      const err = await createLiveLessons({
        durationMinutes: 60,
        startsAt: '2026-10-10T10:00:00Z',
        targetGrade: '5',
        title: 'Matematik Dersi',
        userId: 'user-1',
      }).catch((error: unknown) => error);

      expect(err).toBe(dbError);
      expect(err instanceof LiveLessonInputError).toBe(false);
    });
  });

  describe('updateLiveLesson', () => {
    it.each([
      [{ startsAt: 'invalid-date' }, 'Geçerli bir tarih ve saat seçin.'],
      [{ targetGrade: 'invalid-grade' }, 'Geçerli bir ders hedefi seçin.'],
      [
        { targetGrade: 'selected', targetStudentIds: [] as string[] },
        'En az bir öğrenci seçin.',
      ],
    ] as const)(
      'geçersiz güncelleme girdisini ayırır (%j)',
      async (input, message) => {
        await expectInputError(
          updateLiveLesson({
            durationMinutes: 60,
            lessonId: 'lesson-1',
            startsAt: '2026-10-10T10:00:00Z',
            targetGrade: '5',
            title: 'Matematik Dersi',
            ...input,
          }),
          message,
        );
      },
    );

    it('boş başlıkta LiveLessonInputError fırlatır', async () => {
      await expectInputError(
        updateLiveLesson({
          durationMinutes: 60,
          lessonId: 'lesson-1',
          startsAt: '2026-10-10T10:00:00Z',
          targetGrade: '5',
          title: '',
        }),
        'Ders başlığı gerekli.',
      );
    });

    it('ders bulunamazsa LiveLessonInputError fırlatır', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('not found') }),
          }),
        }),
      });

      await expectInputError(
        updateLiveLesson({
          durationMinutes: 60,
          lessonId: 'missing-lesson',
          startsAt: '2026-10-10T10:00:00Z',
          targetGrade: '5',
          title: 'Güncelleme',
        }),
        'Ders bulunamadı.',
      );
    });

    it('iptal edilmiş ders düzenlenmeye çalışılırsa LiveLessonInputError fırlatır', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: 'cancelled-lesson',
                status: 'cancelled',
                starts_at: '2026-10-10T10:00:00Z',
                target_grade: '5',
              },
              error: null,
            }),
          }),
        }),
      });

      await expectInputError(
        updateLiveLesson({
          durationMinutes: 60,
          lessonId: 'cancelled-lesson',
          startsAt: '2026-10-10T10:00:00Z',
          targetGrade: '5',
          title: 'Güncelleme',
        }),
        'İptal edilmiş ders düzenlenemez.',
      );
    });
  });
});
