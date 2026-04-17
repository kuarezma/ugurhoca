import { supabase } from '@/lib/supabase/client';
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

const WORKSHEET_TITLE_PATTERN = /^Test\s*-\s*(\d+)$/i;
const WORKSHEET_META_PREFIX = '__WS_META__';
const WORKSHEET_GENERIC_DESCRIPTION_PATTERNS = [
  /^test\s*-\s*\d+$/i,
  /^\d+\.\s*sınıf matematik testleri$/i,
  /^yaprak test/i,
  /^kazanım testi/i,
  /^fasikül/i,
];
const WORKSHEET_STOP_WORDS = new Set([
  'bir',
  'bu',
  'cin',
  'gibi',
  'icin',
  'ile',
  'ilgili',
  'matematik',
  'problemleri',
  'problemi',
  'sinif',
  'soruda',
  'soru',
  'test',
  'testi',
  'testleri',
  've',
  'ya',
  'yaprak',
]);

const findWorksheetCatalogOutcomeByCode = (
  grade: number,
  code: string,
) => (WORKSHEET_OUTCOME_CATALOG[grade] || []).find((item) => item.code === code)?.full || '';

const isOfficialWorksheetOutcome = (grade: number, outcome: string) =>
  (WORKSHEET_OUTCOME_CATALOG[grade] || []).some((item) => item.full === outcome);

export const isWorksheetType = (type?: string | null) => type === 'yaprak-test';

export const getWorksheetTestTitle = (order: number) => `Test - ${order}`;

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

type WorksheetMetadata = {
  cleanDescription: string;
  outcome: string | null;
  order: number | null;
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
  const cleanDescription = lineBreakIndex === -1 ? '' : value.slice(lineBreakIndex + 1);

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

export const buildWorksheetDescription = (options: {
  description?: string | null;
  order?: number | null;
  outcome: string;
}) => {
  const metadata = JSON.stringify({
    order: options.order ?? null,
    outcome: normalizeWorksheetOutcome(options.outcome),
  });

  return `${WORKSHEET_META_PREFIX}${metadata}\n${options.description || ''}`;
};

const isGenericWorksheetDescription = (value: string) =>
  WORKSHEET_GENERIC_DESCRIPTION_PATTERNS.some((pattern) => pattern.test(value));

export const getWorksheetVisibleDescription = (
  document: Pick<ContentDocument, 'description'>,
) => stripWorksheetMetaPrefix(document.description);

const normalizeWorksheetSearchText = (value: string) =>
  value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenizeWorksheetSearchText = (value: string) =>
  normalizeWorksheetSearchText(value)
    .split(' ')
    .filter(
      (token) => token.length > 2 && !WORKSHEET_STOP_WORDS.has(token),
    );

const getWorksheetOutcomeOverride = (
  document: Pick<ContentDocument, 'description' | 'grade' | 'title'>,
) => {
  const grade = getWorksheetGradeValue(document.grade);

  if (typeof grade !== 'number') {
    return '';
  }

  const normalizedSource = normalizeWorksheetSearchText(
    `${document.title} ${getWorksheetVisibleDescription(document)}`.trim(),
  );

  if (
    grade === 5 &&
    normalizedSource.includes('kesir') &&
    (normalizedSource.includes('karsilastirma') ||
      normalizedSource.includes('siralama'))
  ) {
    return findWorksheetCatalogOutcomeByCode(5, 'MAT.5.1.4.');
  }

  if (
    grade === 5 &&
    normalizedSource.includes('ondalik') &&
    (normalizedSource.includes('sayi dogrusu') ||
      normalizedSource.includes('siralama'))
  ) {
    return findWorksheetCatalogOutcomeByCode(5, 'MAT.5.1.4.');
  }

  if (
    grade === 6 &&
    ((normalizedSource.includes('dortgen') &&
      normalizedSource.includes('aci')) ||
      (normalizedSource.includes('cokgen') &&
        normalizedSource.includes('aci')))
  ) {
    return findWorksheetCatalogOutcomeByCode(6, 'MAT.6.3.4.');
  }

  if (
    grade === 7 &&
    normalizedSource.includes('oranda') &&
    normalizedSource.includes('biri bir')
  ) {
    return findWorksheetCatalogOutcomeByCode(7, 'M.7.1.4.1.');
  }

  if (
    grade === 7 &&
    (normalizedSource.includes('bir orantida bir cokluk') ||
      normalizedSource.includes('iki oranin esitligi'))
  ) {
    return findWorksheetCatalogOutcomeByCode(7, 'M.7.1.4.2.');
  }

  if (
    grade === 7 &&
    normalizedSource.includes('yuzde') &&
    normalizedSource.includes('problem')
  ) {
    return findWorksheetCatalogOutcomeByCode(7, 'M.7.1.5.4.');
  }

  if (
    grade === 7 &&
    (normalizedSource.includes('dogru ve ters oranti') ||
      (normalizedSource.includes('oran') &&
        normalizedSource.includes('oranti')))
  ) {
    return findWorksheetCatalogOutcomeByCode(7, 'M.7.1.4.7.');
  }

  if (grade === 8 && normalizedSource.includes('pisagor')) {
    return findWorksheetCatalogOutcomeByCode(8, 'M.8.3.1.5.');
  }

  if (
    grade === 8 &&
    normalizedSource.includes('birinci dereceden bir bilinmeyenli denklem')
  ) {
    return findWorksheetCatalogOutcomeByCode(8, 'M.8.2.2.1.');
  }

  if (grade === 8 && normalizedSource.includes('cebirsel ifade')) {
    return findWorksheetCatalogOutcomeByCode(8, 'M.8.2.1.1.');
  }

  if (grade === 8 && normalizedSource.includes('egim')) {
    return findWorksheetCatalogOutcomeByCode(8, 'M.8.2.2.6.');
  }

  if (
    grade === 8 &&
    normalizedSource.includes('dogrusal denklemlerin grafikleri')
  ) {
    return findWorksheetCatalogOutcomeByCode(8, 'M.8.2.2.4.');
  }

  if (
    grade === 8 &&
    (normalizedSource.includes('koordinat sisteminde sirali ikilileri') ||
      normalizedSource.includes('koordinat sistemini tanir'))
  ) {
    return findWorksheetCatalogOutcomeByCode(8, 'M.8.2.2.2.');
  }

  if (
    grade === 8 &&
    normalizedSource.includes('koordinat sistemi ve dogrusal iliskiler')
  ) {
    return findWorksheetCatalogOutcomeByCode(8, 'M.8.2.2.3.');
  }

  if (grade === 8 && normalizedSource.includes('dogrusal denklemler')) {
    return findWorksheetCatalogOutcomeByCode(8, 'M.8.2.2.5.');
  }

  return '';
};

export const inferLegacyWorksheetOutcomeFromText = (value?: string | null) => {
  const normalizedValue = normalizeWorksheetOutcome(value);

  if (!normalizedValue || isGenericWorksheetDescription(normalizedValue)) {
    return '';
  }

  return normalizedValue
    .replace(/\bmaarif modele uygun kazanım testi\b/gi, '')
    .replace(/\bçözümlü sorular\b/gi, '')
    .replace(/\btesti\b/gi, '')
    .replace(/\bfasikülü\b/gi, '')
    .replace(/\s*--\s*\d+\s*$/g, '')
    .replace(/\s*-\s*[ivx]+\s*$/gi, '')
    .replace(/\s*-\s*\d+\s*$/g, '')
    .replace(/^\d+\.\s*sınıf\s*/i, '')
    .replace(/^100\s*soruda\s*\d+\.?\s*sınıf\s*/i, '')
    .replace(/^\d+\.?\s*sinif\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const inferWorksheetOutcomeFromCatalog = (
  document: Pick<ContentDocument, 'description' | 'grade' | 'title'>,
) => {
  const grade = getWorksheetGradeValue(document.grade);

  if (typeof grade !== 'number') {
    return '';
  }

  const source = `${document.title} ${getWorksheetVisibleDescription(document)}`.trim();
  const normalizedSource = normalizeWorksheetSearchText(source);
  const sourceTokens = new Set(tokenizeWorksheetSearchText(source));
  const candidates = WORKSHEET_OUTCOME_CATALOG[grade] || [];

  let bestMatch = '';
  let bestScore = 0;
  let bestTokenCount = 0;

  for (const candidate of candidates) {
    const normalizedCode = normalizeWorksheetSearchText(candidate.code);

    if (normalizedCode && normalizedSource.includes(normalizedCode)) {
      return candidate.full;
    }

    const tokens = tokenizeWorksheetSearchText(candidate.full);

    if (tokens.length === 0) {
      continue;
    }

    const score = tokens.reduce((total, token) => {
      return total + (sourceTokens.has(token) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate.full;
      bestTokenCount = tokens.length;
    }
  }

  return bestScore >= 2 && bestScore / Math.max(bestTokenCount, 1) >= 0.35
    ? bestMatch
    : '';
};

export const getWorksheetOutcomeLabel = (
  document: Pick<ContentDocument, 'description' | 'grade' | 'title'>,
) => {
  const metadata = parseWorksheetMetadata(document.description);
  const grade = getWorksheetGradeValue(document.grade);

  if (
    metadata.outcome &&
    typeof grade === 'number' &&
    isOfficialWorksheetOutcome(grade, metadata.outcome)
  ) {
    return metadata.outcome;
  }

  const overriddenOutcome = getWorksheetOutcomeOverride(document);

  if (overriddenOutcome) {
    return overriddenOutcome;
  }

  if (metadata.outcome) {
    return metadata.outcome;
  }

  const inferredFromDescription = inferLegacyWorksheetOutcomeFromText(
    metadata.cleanDescription,
  );

  if (inferredFromDescription) {
    return inferredFromDescription;
  }

  const inferredFromCatalog = inferWorksheetOutcomeFromCatalog(document);

  if (inferredFromCatalog) {
    return inferredFromCatalog;
  }

  const inferredFromTitle = inferLegacyWorksheetOutcomeFromText(document.title);
  return inferredFromTitle || DEFAULT_WORKSHEET_OUTCOME;
};

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

  const match = document.title?.match(WORKSHEET_TITLE_PATTERN);
  const parsedOrder = match ? Number.parseInt(match[1] || '', 10) : Number.NaN;

  return Number.isFinite(parsedOrder) && parsedOrder > 0 ? parsedOrder : 0;
};

export const getNextWorksheetOrder = (
  documents: Array<Pick<ContentDocument, 'description' | 'title'>>,
) =>
  documents.reduce((maxOrder, document) => {
    return Math.max(maxOrder, getWorksheetOrder(document));
  }, 0) + 1;

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

export const prepareWorksheetDocumentPayload = async <
  T extends {
    description?: string | null;
    grade?: GradeValue[];
    learning_outcome?: string | null;
    title?: string | null;
    type?: string | null;
    worksheet_order?: number | null;
  },
>(
  payload: T,
) => {
  if (!isWorksheetType(payload.type)) {
    return payload;
  }

  const grade = getWorksheetGradeValue(payload.grade);
  const learningOutcome = normalizeWorksheetOutcome(payload.learning_outcome);

  if (!grade) {
    throw new Error('Yaprak test için tek bir sınıf düzeyi seçmelisiniz.');
  }

  if (!learningOutcome) {
    throw new Error('Yaprak test için kazanım alanı zorunludur.');
  }

  const { data, error } = await supabase
    .from('documents')
    .select('grade, title, description')
    .eq('type', 'yaprak-test');

  if (error) {
    throw error;
  }

  const sameOutcomeDocuments = ((data || []) as ContentDocument[]).filter(
    (document) =>
      String(getWorksheetGradeValue(document.grade)) === String(grade) &&
      getWorksheetOutcomeLabel(document) === learningOutcome,
  );

  const worksheetOrder = getNextWorksheetOrder(sameOutcomeDocuments);

  return {
    ...payload,
    description: buildWorksheetDescription({
      description: payload.description,
      order: worksheetOrder,
      outcome: learningOutcome,
    }),
    grade: [grade],
    title: getWorksheetTestTitle(worksheetOrder),
  };
};
