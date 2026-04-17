import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createAdminClient, loadEnv, parseArgs, rootPath } from './import/utils.mjs';

const WORKSHEET_META_PREFIX = '__WS_META__';
const WORKSHEET_TITLE_PATTERN = /^Test\s*-\s*(\d+)$/i;
const DEFAULT_WORKSHEET_OUTCOME = 'Genel Kazanım';
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

function findWorksheetCatalogOutcomeByCode(catalog, grade, code) {
  return (catalog[grade] || []).find((item) => item.code === code)?.full || '';
}

function isOfficialWorksheetOutcome(catalog, grade, outcome) {
  return (catalog[grade] || []).some((item) => item.full === outcome);
}

function normalizeWorksheetOutcome(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function stripWorksheetMetaPrefix(description) {
  const value = description || '';

  if (!value.startsWith(WORKSHEET_META_PREFIX)) {
    return value;
  }

  const lineBreakIndex = value.indexOf('\n');
  return lineBreakIndex === -1 ? '' : value.slice(lineBreakIndex + 1);
}

function parseWorksheetMetadata(description) {
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
    const metadata = JSON.parse(encodedMetadata);

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
}

function buildWorksheetDescription({ description, order, outcome }) {
  const metadata = JSON.stringify({
    order: order ?? null,
    outcome: normalizeWorksheetOutcome(outcome),
  });

  return `${WORKSHEET_META_PREFIX}${metadata}\n${description || ''}`;
}

function getWorksheetVisibleDescription(document) {
  return stripWorksheetMetaPrefix(document.description);
}

function isGenericWorksheetDescription(value) {
  return WORKSHEET_GENERIC_DESCRIPTION_PATTERNS.some((pattern) => pattern.test(value));
}

function normalizeWorksheetSearchText(value) {
  return value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeWorksheetSearchText(value) {
  return normalizeWorksheetSearchText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !WORKSHEET_STOP_WORDS.has(token));
}

function getWorksheetOutcomeOverride(document, catalog) {
  const grade = getWorksheetGradeValue(document.grade);

  if (typeof grade !== 'number') {
    return '';
  }

  const normalizedSource = normalizeWorksheetSearchText(
    `${document.title || ''} ${getWorksheetVisibleDescription(document)}`.trim(),
  );

  if (
    grade === 5 &&
    normalizedSource.includes('kesir') &&
    (normalizedSource.includes('karsilastirma') ||
      normalizedSource.includes('siralama'))
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 5, 'MAT.5.1.4.');
  }

  if (
    grade === 5 &&
    normalizedSource.includes('ondalik') &&
    (normalizedSource.includes('sayi dogrusu') ||
      normalizedSource.includes('siralama'))
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 5, 'MAT.5.1.4.');
  }

  if (
    grade === 6 &&
    ((normalizedSource.includes('dortgen') &&
      normalizedSource.includes('aci')) ||
      (normalizedSource.includes('cokgen') &&
        normalizedSource.includes('aci')))
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 6, 'MAT.6.3.4.');
  }

  if (
    grade === 7 &&
    normalizedSource.includes('oranda') &&
    normalizedSource.includes('biri bir')
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 7, 'M.7.1.4.1.');
  }

  if (
    grade === 7 &&
    (normalizedSource.includes('bir orantida bir cokluk') ||
      normalizedSource.includes('iki oranin esitligi'))
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 7, 'M.7.1.4.2.');
  }

  if (
    grade === 7 &&
    normalizedSource.includes('yuzde') &&
    normalizedSource.includes('problem')
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 7, 'M.7.1.5.4.');
  }

  if (
    grade === 7 &&
    (normalizedSource.includes('dogru ve ters oranti') ||
      (normalizedSource.includes('oran') &&
        normalizedSource.includes('oranti')))
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 7, 'M.7.1.4.7.');
  }

  if (grade === 8 && normalizedSource.includes('pisagor')) {
    return findWorksheetCatalogOutcomeByCode(catalog, 8, 'M.8.3.1.5.');
  }

  if (
    grade === 8 &&
    normalizedSource.includes('birinci dereceden bir bilinmeyenli denklem')
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 8, 'M.8.2.2.1.');
  }

  if (grade === 8 && normalizedSource.includes('cebirsel ifade')) {
    return findWorksheetCatalogOutcomeByCode(catalog, 8, 'M.8.2.1.1.');
  }

  if (grade === 8 && normalizedSource.includes('egim')) {
    return findWorksheetCatalogOutcomeByCode(catalog, 8, 'M.8.2.2.6.');
  }

  if (
    grade === 8 &&
    normalizedSource.includes('dogrusal denklemlerin grafikleri')
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 8, 'M.8.2.2.4.');
  }

  if (
    grade === 8 &&
    (normalizedSource.includes('koordinat sisteminde sirali ikilileri') ||
      normalizedSource.includes('koordinat sistemini tanir'))
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 8, 'M.8.2.2.2.');
  }

  if (
    grade === 8 &&
    normalizedSource.includes('koordinat sistemi ve dogrusal iliskiler')
  ) {
    return findWorksheetCatalogOutcomeByCode(catalog, 8, 'M.8.2.2.3.');
  }

  if (grade === 8 && normalizedSource.includes('dogrusal denklemler')) {
    return findWorksheetCatalogOutcomeByCode(catalog, 8, 'M.8.2.2.5.');
  }

  return '';
}

function inferLegacyWorksheetOutcomeFromText(value) {
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
}

function getWorksheetGradeValue(grades) {
  if (!Array.isArray(grades) || grades.length === 0) {
    return null;
  }

  return (
    grades.find(
      (grade) =>
        grade === 'Mezun' ||
        (typeof grade === 'number' && Number.isFinite(grade) && grade >= 5 && grade <= 12),
    ) || null
  );
}

async function loadWorksheetCatalog() {
  const catalogPath = rootPath('src', 'features', 'content', 'worksheet-catalog.ts');
  const raw = await fs.readFile(catalogPath, 'utf8');
  const match = raw.match(
    /export const WORKSHEET_OUTCOME_CATALOG:\s*Record<number,\s*WorksheetCatalogItem\[]>\s*=\s*(\{[\s\S]*\});\s*$/,
  );

  if (!match?.[1]) {
    throw new Error(`Worksheet catalog could not be parsed: ${catalogPath}`);
  }

  return vm.runInNewContext(`(${match[1]})`);
}

function inferWorksheetOutcomeFromCatalog(document, catalog) {
  const grade = getWorksheetGradeValue(document.grade);

  if (typeof grade !== 'number') {
    return '';
  }

  const source = `${document.title || ''} ${getWorksheetVisibleDescription(document)}`.trim();
  const normalizedSource = normalizeWorksheetSearchText(source);
  const sourceTokens = new Set(tokenizeWorksheetSearchText(source));
  const candidates = catalog[grade] || [];

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

    const score = tokens.reduce(
      (total, token) => total + (sourceTokens.has(token) ? 1 : 0),
      0,
    );

    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate.full;
      bestTokenCount = tokens.length;
    }
  }

  return bestScore >= 2 && bestScore / Math.max(bestTokenCount, 1) >= 0.35
    ? bestMatch
    : '';
}

function getWorksheetOutcomeLabel(document, catalog) {
  const metadata = parseWorksheetMetadata(document.description);
  const grade = getWorksheetGradeValue(document.grade);

  if (
    metadata.outcome &&
    typeof grade === 'number' &&
    isOfficialWorksheetOutcome(catalog, grade, metadata.outcome)
  ) {
    return metadata.outcome;
  }

  const overriddenOutcome = getWorksheetOutcomeOverride(document, catalog);

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

  const inferredFromCatalog = inferWorksheetOutcomeFromCatalog(document, catalog);

  if (inferredFromCatalog) {
    return inferredFromCatalog;
  }

  const inferredFromTitle = inferLegacyWorksheetOutcomeFromText(document.title);
  return inferredFromTitle || DEFAULT_WORKSHEET_OUTCOME;
}

function getWorksheetOrder(document) {
  const metadata = parseWorksheetMetadata(document.description);

  if (typeof metadata.order === 'number' && metadata.order > 0) {
    return metadata.order;
  }

  const match = String(document.title || '').match(WORKSHEET_TITLE_PATTERN);
  const parsedOrder = match ? Number.parseInt(match[1] || '', 10) : Number.NaN;

  return Number.isFinite(parsedOrder) && parsedOrder > 0 ? parsedOrder : 0;
}

function gradesAreEqual(left, right) {
  return JSON.stringify(left ?? []) === JSON.stringify(right ?? []);
}

async function main() {
  loadEnv();

  const args = parseArgs(process.argv.slice(2));
  const dryRun = Boolean(args['dry-run']);
  const supabase = createAdminClient();
  const catalog = await loadWorksheetCatalog();

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, description, grade, type')
    .eq('type', 'yaprak-test');

  if (error) {
    throw error;
  }

  const documents = data || [];
  let updated = 0;
  let skipped = 0;

  for (const document of documents) {
    const grade = getWorksheetGradeValue(document.grade);
    const outcome = getWorksheetOutcomeLabel(document, catalog);
    const nextDescription = buildWorksheetDescription({
      description: getWorksheetVisibleDescription(document),
      order: getWorksheetOrder(document),
      outcome,
    });
    const nextGrade = grade ? [grade] : document.grade;

    if (
      nextDescription === (document.description || '') &&
      gradesAreEqual(nextGrade, document.grade)
    ) {
      skipped += 1;
      continue;
    }

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          description: nextDescription,
          grade: nextGrade,
        })
        .eq('id', document.id);

      if (updateError) {
        throw updateError;
      }
    }

    updated += 1;
    console.log(
      `${dryRun ? '[dry-run] ' : ''}${document.id} -> ${outcome} (${Array.isArray(nextGrade) ? nextGrade.join(', ') : 'sinif-yok'})`,
    );
  }

  console.log('');
  console.log(`Worksheet documents scanned: ${documents.length}`);
  console.log(`${dryRun ? 'Would update' : 'Updated'}: ${updated}`);
  console.log(`Unchanged: ${skipped}`);
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
