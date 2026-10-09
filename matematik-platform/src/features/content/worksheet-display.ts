import { WORKSHEET_OUTCOME_CATALOG } from '@/features/content/worksheet-catalog';
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

export const resolveWorksheetOutcome = (
  document: Pick<ContentDocument, 'description' | 'title'> & {
    grade?: GradeValue[] | null;
  },
): string => {
  const grade = getWorksheetGradeValue(document.grade);
  const metadata = parseWorksheetMetadata(document.description);
  const rawOutcome = metadata.outcome || '';
  const title = (document.title || '').trim();
  const desc = metadata.cleanDescription || '';
  const searchSource = `${title} ${desc}`.toLocaleLowerCase('tr');

  if (typeof grade === 'number' && WORKSHEET_OUTCOME_CATALOG[grade]) {
    const catalog = WORKSHEET_OUTCOME_CATALOG[grade];

    // 1. Direct full string match with catalog
    if (rawOutcome) {
      const trimmed = rawOutcome.trim();
      const directMatch = catalog.find(
        (item) => item.full.toLocaleLowerCase('tr') === trimmed.toLocaleLowerCase('tr'),
      );
      if (directMatch) return directMatch.full;
    }

    // 2. Extract official MEB code from outcome (e.g., MAT.5.2.3. or M.8.3.3.1.)
    if (rawOutcome) {
      const codeMatch = rawOutcome.match(/(MAT\.\d+\.\d+\.\d+|M\.\d+\.\d+\.\d+\.\d+)/i);
      if (codeMatch) {
        const normalizedCode = codeMatch[1].toUpperCase();
        const itemByCode = catalog.find(
          (item) => item.code.replace(/\.?$/, '').toUpperCase() === normalizedCode,
        );
        if (itemByCode) return itemByCode.full;
      }
    }

    // 3. Fallbacks based on title & keywords
    if (grade === 8) {
      if (
        searchSource.includes('eşlik') ||
        searchSource.includes('eslik') ||
        searchSource.includes('benzerlik')
      ) {
        const match = catalog.find((item) => item.code.startsWith('M.8.3.3.1'));
        if (match) return match.full;
      }
      if (searchSource.includes('pisagor')) {
        const match = catalog.find((item) => item.code.startsWith('M.8.3.1.5'));
        if (match) return match.full;
      }
      if (searchSource.includes('birinci dereceden bir bilinmeyenli denklem')) {
        const match = catalog.find((item) => item.code.startsWith('M.8.2.2.1'));
        if (match) return match.full;
      }
      if (searchSource.includes('cebirsel ifade')) {
        const match = catalog.find((item) => item.code.startsWith('M.8.2.1.1'));
        if (match) return match.full;
      }
      if (searchSource.includes('eğim') || searchSource.includes('egim')) {
        const match = catalog.find((item) => item.code.startsWith('M.8.2.2.6'));
        if (match) return match.full;
      }
      if (searchSource.includes('doğrusal denklemler') || searchSource.includes('dogrusal')) {
        const match = catalog.find((item) => item.code.startsWith('M.8.2.2.5'));
        if (match) return match.full;
      }
    }

    if (grade === 7) {
      if (searchSource.includes('açıortay') || searchSource.includes('aciortay')) {
        const match = catalog.find((item) => item.code.startsWith('M.7.3.1.1'));
        if (match) return match.full;
      }
      if (searchSource.includes('genel tekrar')) {
        const match = catalog.find((item) => item.code.startsWith('M.7.1.3.5'));
        if (match) return match.full;
      }
      if (searchSource.includes('çember') || searchSource.includes('cember') || searchSource.includes('daire')) {
        const match = catalog.find((item) => item.code.startsWith('M.7.3.3.1'));
        if (match) return match.full;
      }
      if (searchSource.includes('çokgen') || searchSource.includes('cokgen')) {
        const match = catalog.find((item) => item.code.startsWith('M.7.3.2.1'));
        if (match) return match.full;
      }
    }

    if (grade === 6) {
      if (
        (searchSource.includes('dörtgen') || searchSource.includes('dortgen') || searchSource.includes('çokgen')) &&
        (searchSource.includes('açı') || searchSource.includes('aci'))
      ) {
        const match = catalog.find((item) => item.code.startsWith('MAT.6.3.4'));
        if (match) return match.full;
      }
    }

    if (grade === 5) {
      if (
        (searchSource.includes('kesir') || searchSource.includes('ondalık')) &&
        (searchSource.includes('karşılaştırma') || searchSource.includes('sıralama'))
      ) {
        const match = catalog.find((item) => item.code.startsWith('MAT.5.1.4'));
        if (match) return match.full;
      }
      if (searchSource.includes('örüntü') || searchSource.includes('oruntu')) {
        const match = catalog.find((item) => item.code.startsWith('MAT.5.2.3'));
        if (match) return match.full;
      }
      if (
        searchSource.includes('değişme') ||
        searchSource.includes('birleşme') ||
        searchSource.includes('dağılma') ||
        searchSource.includes('eşitliğin korunumu')
      ) {
        const match = catalog.find((item) => item.code.startsWith('MAT.5.2.1'));
        if (match) return match.full;
      }
      if (searchSource.includes('kategorik veri')) {
        const match = catalog.find((item) => item.code.startsWith('MAT.5.5.2'));
        if (match) return match.full;
      }
    }

    // 4. Strip hour suffixes (e.g. "(5 Saat)") and check catalog
    if (rawOutcome) {
      const cleanOutcome = rawOutcome.replace(/\s*\(\s*\d+\s*Saat\s*\)/gi, '').trim().toLocaleLowerCase('tr');
      const cleanMatch = catalog.find(
        (item) =>
          item.full.toLocaleLowerCase('tr').startsWith(cleanOutcome) ||
          cleanOutcome.startsWith(item.full.toLocaleLowerCase('tr')),
      );
      if (cleanMatch) return cleanMatch.full;
    }
  }

  // Fallback to existing outcome or text
  if (rawOutcome) {
    return rawOutcome;
  }

  return (
    normalizeWorksheetOutcome(metadata.cleanDescription) ||
    normalizeWorksheetOutcome(document.title) ||
    DEFAULT_WORKSHEET_OUTCOME
  );
};

export const getWorksheetOutcomeLabel = (
  document: Pick<ContentDocument, 'description' | 'title'> & {
    grade?: GradeValue[] | null;
  },
) => {
  return resolveWorksheetOutcome(document);
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
