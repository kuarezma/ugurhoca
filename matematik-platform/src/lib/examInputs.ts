export function applyAnswerChange(
  current: { correct: number; wrong: number },
  field: 'correct' | 'wrong',
  rawValue: string | number,
  maxQuestions: number,
): { correct: number; wrong: number } {
  const parsed = rawValue === '' ? 0 : typeof rawValue === 'string'
    ? Number.parseInt(rawValue, 10)
    : Math.trunc(rawValue);
  const clampedVal = Math.max(0, Math.min(maxQuestions, Number.isNaN(parsed) ? 0 : parsed));

  return field === 'correct'
    ? { correct: clampedVal, wrong: Math.min(current.wrong, maxQuestions - clampedVal) }
    : { correct: Math.min(current.correct, maxQuestions - clampedVal), wrong: clampedVal };
}
