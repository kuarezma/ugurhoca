import {
  getWorksheetGradeValue,
  getWorksheetOutcomeLabel,
  sortWorksheetDocuments,
} from '@/features/content/worksheet';
import type { ContentDocument, GradeValue } from '@/types';

export type WeeklyWorksheetPlanItem = {
  grade: number;
  learning_outcome: string;
  subject: string;
  week_end: string;
  week_start: string;
};

export type WeeklyWorksheetSuggestion = {
  description: string;
  documentId: string;
  fileUrl: string | null;
  grade: number;
  href: string;
  learningOutcome: string;
  subject: string;
  title: string;
  weekEnd: string;
  weekStart: string;
};

export const getTodayInTimeZone = (
  timeZone = 'Europe/Istanbul',
  referenceDate = new Date(),
) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(referenceDate);
  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || '';

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
};

export const buildWorksheetContentHref = (
  grade: number,
  learningOutcome: string,
) => {
  const params = new URLSearchParams({
    grade: String(grade),
    outcome: learningOutcome,
    type: 'yaprak-test',
  });

  return `/icerikler?${params.toString()}`;
};

export const normalizeNumericGrade = (grade?: GradeValue | string | null) => {
  const numericGrade = Number(grade);
  return Number.isFinite(numericGrade) ? numericGrade : null;
};

export const selectWeeklyWorksheetSuggestion = ({
  documents,
  grade,
  planItems,
  today,
}: {
  documents: ContentDocument[];
  grade: GradeValue | string | null;
  planItems: WeeklyWorksheetPlanItem[];
  today: string;
}): WeeklyWorksheetSuggestion | null => {
  const numericGrade = normalizeNumericGrade(grade);

  if (!numericGrade) {
    return null;
  }

  const currentPlanItem = [...planItems]
    .filter(
      (item) =>
        item.grade === numericGrade &&
        item.week_start <= today &&
        item.week_end >= today,
    )
    .sort((left, right) => left.week_start.localeCompare(right.week_start))[0];

  if (!currentPlanItem) {
    return null;
  }

  const matchingDocument = sortWorksheetDocuments(
    documents.filter(
      (document) =>
        document.type === 'yaprak-test' &&
        getWorksheetGradeValue(document.grade) === numericGrade &&
        getWorksheetOutcomeLabel(document) === currentPlanItem.learning_outcome,
    ),
  )[0];

  if (!matchingDocument) {
    return null;
  }

  return {
    description: `${currentPlanItem.subject} konusu için yayınlanan yaprak testi hazır.`,
    documentId: matchingDocument.id,
    fileUrl: matchingDocument.file_url || null,
    grade: numericGrade,
    href: buildWorksheetContentHref(
      numericGrade,
      currentPlanItem.learning_outcome,
    ),
    learningOutcome: currentPlanItem.learning_outcome,
    subject: currentPlanItem.subject,
    title: 'Bu haftanın yaprak testini çöz',
    weekEnd: currentPlanItem.week_end,
    weekStart: currentPlanItem.week_start,
  };
};
