import type { ContentDocument, GradeValue } from '@/types';
import type { ContentFormState } from '@/features/content/types';

const nullableTextFields = [
  'answer_key_text',
  'description',
  'file_url',
  'solution_url',
  'title',
  'type',
  'video_url',
] as const;

type PersistableContentPayload = Partial<
  Pick<ContentDocument, 'downloads' | 'grade'>
> & {
  answer_key_text?: string | null;
  created_at?: string;
  description?: string | null;
  file_url?: string | null;
  solution_url?: string | null;
  title?: string | null;
  type?: string | null;
  video_url?: string | null;
};

export function buildContentDocumentPersistPayload(
  payload: ContentFormState,
): PersistableContentPayload {
  const persistedPayload: PersistableContentPayload = {};

  for (const field of nullableTextFields) {
    const value = payload[field];
    if (typeof value === 'string') {
      persistedPayload[field] = value.trim() || null;
    }
  }

  const numericGrades = normalizeNumericGrades(payload.grade);
  if (numericGrades.length > 0) {
    persistedPayload.grade = numericGrades;
  } else if (Array.isArray(payload.grade)) {
    persistedPayload.grade = [];
  }

  return persistedPayload;
}

function normalizeNumericGrades(grades?: GradeValue[]) {
  if (!Array.isArray(grades)) {
    return [];
  }

  return grades.filter(
    (grade): grade is number =>
      typeof grade === 'number' && Number.isFinite(grade),
  );
}
