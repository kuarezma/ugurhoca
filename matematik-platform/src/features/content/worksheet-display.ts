import type { ContentDocument, GradeValue } from '@/types';

export const WORKSHEET_GRADE_OPTIONS = [
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  'Mezun',
] as const;

export const DEFAULT_WORKSHEET_OUTCOME = 'Genel Kazanım';

const WORKSHEET_LEGACY_TITLE_PATTERN = /^Test\s*-\s*(\d+)$/i;
const WORKSHEET_TITLE_SUFFIX_PATTERN = /\(\s*Test\s*-\s*(\d+)\s*\)\s*$/i;
const WORKSHEET_STANDARD_TITLE_PATTERN = /Yaprak Test\s+(\d+)\s*$/i;
const WORKSHEET_META_PREFIX = '__WS_META__';

type WorksheetMetadata = {
  cleanDescription: string;
  order: number | null;
  outcome: string | null;
};

export const isWorksheetType = (type?: string | null) => type === 'yaprak-test';

export const normalizeWorksheetOutcome = (value?: string | null) =>
  value?.trim().replace(/\s+/g, ' ') || '';

const stripWorksheetMetaPrefix = (description?: string | null) => {
  const value = description || '';

  if (!value.startsWith(WORKSHEET_META_PREFIX)) {
    return value;
  }

  const lineBreakIndex = value.indexOf('\n');
  return lineBreakIndex === -1 ? '' : value.slice(lineBreakIndex + 1);
};

export const parseWorksheetMetadata = (
  description?: string | null,
): WorksheetMetadata => {
  const value = description || '';

  if (!value.startsWith(WORKSHEET_META_PREFIX)) {
    return {
      cleanDescription: value,
      order: null,
      outcome: null,
    };
  }

  const lineBreakIndex = value.indexOf('\n');
  const encodedMetadata =
    lineBreakIndex === -1
      ? value.slice(WORKSHEET_META_PREFIX.length)
      : value.slice(WORKSHEET_META_PREFIX.length, lineBreakIndex);
  const cleanDescription =
    lineBreakIndex === -1 ? '' : value.slice(lineBreakIndex + 1);

  try {
    const metadata = JSON.parse(encodedMetadata) as {
      order?: number;
      outcome?: string;
    };

    return {
      cleanDescription,
      order:
        typeof metadata.order === 'number' && metadata.order > 0
          ? metadata.order
          : null,
      outcome: normalizeWorksheetOutcome(metadata.outcome),
    };
  } catch {
    return {
      cleanDescription: stripWorksheetMetaPrefix(description),
      order: null,
      outcome: null,
    };
  }
};

export const getWorksheetVisibleDescription = (
  document: Pick<ContentDocument, 'description'>,
) => parseWorksheetMetadata(document.description).cleanDescription;

export const getWorksheetGradeValue = (grades?: GradeValue[] | null) =>
  Array.isArray(grades) && grades.length > 0
    ? grades.find(
        (grade) =>
          grade === 'Mezun' ||
          (typeof grade === 'number' &&
            Number.isFinite(grade) &&
            grade >= 5 &&
            grade <= 12),
      ) || null
    : null;

export const getWorksheetOrder = (
  document: Pick<ContentDocument, 'description' | 'title'>,
) => {
  const metadata = parseWorksheetMetadata(document.description);

  if (typeof metadata.order === 'number' && metadata.order > 0) {
    return metadata.order;
  }

  const suffixMatch = document.title?.match(WORKSHEET_TITLE_SUFFIX_PATTERN);
  const legacyMatch = document.title?.match(WORKSHEET_LEGACY_TITLE_PATTERN);
  const standardMatch = document.title?.match(WORKSHEET_STANDARD_TITLE_PATTERN);
  const parsedOrder = Number.parseInt(
    standardMatch?.[1] || suffixMatch?.[1] || legacyMatch?.[1] || '',
    10,
  );

  return Number.isFinite(parsedOrder) && parsedOrder > 0 ? parsedOrder : 0;
};

export const getWorksheetOutcomeLabel = (
  document: Pick<ContentDocument, 'description' | 'title'>,
) => {
  const metadata = parseWorksheetMetadata(document.description);

  if (metadata.outcome) {
    return metadata.outcome;
  }

  return (
    normalizeWorksheetOutcome(metadata.cleanDescription) ||
    normalizeWorksheetOutcome(document.title) ||
    DEFAULT_WORKSHEET_OUTCOME
  );
};

export const sortWorksheetDocuments = (documents: ContentDocument[]) =>
  [...documents].sort((left, right) => {
    const leftOrder = getWorksheetOrder(left);
    const rightOrder = getWorksheetOrder(right);
    const leftHasOrder = leftOrder > 0;
    const rightHasOrder = rightOrder > 0;

    if (leftHasOrder && rightHasOrder && leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    if (leftHasOrder !== rightHasOrder) {
      return leftHasOrder ? -1 : 1;
    }

    return left.title.localeCompare(right.title, 'tr');
  });
