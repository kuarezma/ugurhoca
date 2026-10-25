import { normalizeGrade } from '@/lib/grade';
import type { Quiz } from '@/types/quiz';

/** Sınıfa uygun en yeni denemeyi, ardından genel testi ve ilk aktif testi seçer. */
export function pickLeagueQuiz(
  quizzes: readonly Quiz[],
  selectedGrade?: number | string | null,
): Quiz | undefined {
  const grade = selectedGrade == null ? null : normalizeGrade(selectedGrade);
  if (selectedGrade != null && grade === null) return undefined;

  const activeQuizzes = quizzes.filter(
    (quiz) =>
      quiz.is_active &&
      (grade === null || normalizeGrade(quiz.grade) === grade),
  );
  const newestMatching = (pattern: RegExp) =>
    activeQuizzes
      .filter((quiz) => pattern.test(quiz.title))
      .reduce<Quiz | undefined>((newest, quiz) => {
        // Eksik/geçersiz tarihlerde listedeki sıra korunur.
        const createdAt = Date.parse(quiz.created_at);
        const newestAt = newest ? Date.parse(newest.created_at) : NaN;
        return !newest ||
          (Number.isFinite(createdAt) &&
            (!Number.isFinite(newestAt) || createdAt > newestAt))
          ? quiz
          : newest;
      }, undefined);

  return (
    newestMatching(/deneme/i) ?? newestMatching(/genel/i) ?? activeQuizzes[0]
  );
}
