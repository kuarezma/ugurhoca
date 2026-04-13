import type {
  ProgressRow,
  StudyGoal,
  StudySession,
} from '@/features/progress/types';

export const getCurrentWeekStart = (referenceDate = new Date()) => {
  const nextDate = new Date(referenceDate);
  const dayOfWeek = nextDate.getDay();
  const diff = nextDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  nextDate.setDate(diff);
  return nextDate.toISOString().split('T')[0] ?? '';
};

export const resolveCurrentGoal = (
  goals: StudyGoal[] | null | undefined,
  referenceDate = new Date(),
): StudyGoal => {
  const weekStart = getCurrentWeekStart(referenceDate);

  return (
    goals?.find((goal) => goal.week_start === weekStart) ?? {
      target_duration: 600,
      week_start: weekStart,
    }
  );
};

export const mergeProgressRow = (
  rows: ProgressRow[],
  nextRow: ProgressRow,
): ProgressRow[] =>
  [...rows.filter((row) => row.topic !== nextRow.topic), nextRow].sort(
    (left, right) => right.mastery_level - left.mastery_level,
  );

export const prependStudySession = (
  sessions: StudySession[],
  nextSession: StudySession,
): StudySession[] => [nextSession, ...sessions];
