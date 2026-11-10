import {
  MAX_PLAN_FILE_BYTES,
  MAX_PLAN_ROWS,
  REQUIRED_COLUMNS,
  type AnnualPlanImportError,
  type AnnualPlanImportRow,
  type AnnualPlanParseResult,
  type RawCell,
} from './annual-plan-import/types';
import {
  cleanImportedText,
  inferAcademicStartYearFromRows,
  isNonInstructionalPlanRow,
  mapHeaders,
  normalizeKey,
  parseDateCell,
  parseDateRangeCell,
  parseGrade,
  toCellText,
} from './annual-plan-import/date-helpers';
import { readAnnualPlanRawRows } from './annual-plan-import/file-readers';

export type {
  AnnualPlanImportError,
  AnnualPlanImportRow,
  AnnualPlanParseResult,
} from './annual-plan-import/types';

export { readAnnualPlanRawRows } from './annual-plan-import/file-readers';

export async function parseAnnualPlanFile(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<AnnualPlanParseResult> {
  if (buffer.byteLength > MAX_PLAN_FILE_BYTES) {
    return {
      errors: [
        { row: 1, message: 'Yıllık plan dosyası en fazla 5 MB olabilir.' },
      ],
      rows: [],
      skippedDuplicates: 0,
    };
  }
  const lowerName = fileName.toLocaleLowerCase('tr');
  const defaultGrade = parseGrade(fileName);
  const rawRows = await readAnnualPlanRawRows(buffer, fileName);
  const academicStartYear = inferAcademicStartYearFromRows(rawRows);

  if (lowerName.endsWith('.csv')) {
    return parseAnnualPlanRows(rawRows, {
      academicStartYear,
      defaultGrade,
    });
  }

  if (lowerName.endsWith('.xlsx')) {
    return parseAnnualPlanRows(rawRows, {
      academicStartYear,
      defaultGrade,
    });
  }

  if (lowerName.endsWith('.docx')) {
    return parseAnnualPlanRows(rawRows, {
      academicStartYear,
      defaultGrade,
    });
  }

  return {
    errors: [
      {
        row: 1,
        message: lowerName.endsWith('.doc')
          ? "Eski DOC dosyası desteklenmez. Word'de DOCX olarak kaydedip yükleyin."
          : 'Yalnızca CSV, XLSX veya DOCX yıllık plan dosyası yükleyebilirsiniz.',
      },
    ],
    rows: [],
    skippedDuplicates: 0,
  };
}

export function parseAnnualPlanRows(
  rows: RawCell[][],
  options: {
    academicStartYear?: number | null;
    defaultGrade?: number | null;
  } = {},
): AnnualPlanParseResult {
  const headerRowIndex = rows.findIndex((row) =>
    row.some((cell) => toCellText(cell).trim().length > 0),
  );

  if (headerRowIndex === -1) {
    return {
      errors: [{ row: 1, message: 'Dosyada başlık satırı bulunamadı.' }],
      rows: [],
      skippedDuplicates: 0,
    };
  }

  const headers = mapHeaders(rows[headerRowIndex] ?? []);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => {
    if (column === 'sinif' && options.defaultGrade) {
      return false;
    }

    if (
      (column === 'hafta_baslangic' || column === 'hafta_bitis') &&
      headers.tarih_araligi !== undefined
    ) {
      return false;
    }

    return headers[column] === undefined;
  });

  if (missingColumns.length > 0) {
    return {
      errors: [
        {
          row: headerRowIndex + 1,
          message: `Eksik kolon: ${missingColumns.join(', ')}.`,
        },
      ],
      rows: [],
      skippedDuplicates: 0,
    };
  }

  const resultRows: AnnualPlanImportRow[] = [];
  const errors: AnnualPlanImportError[] = [];
  const seenKeys = new Map<
    string,
    { row: AnnualPlanImportRow; subjects: Set<string> }
  >();
  let skippedDuplicates = 0;

  // Kötü niyetli dosyadaki on binlerce satırı işlememek için üst sınır.
  // Normal yıllık planlar birkaç yüz satırı geçmez.
  const lastRowIndex = Math.min(
    rows.length,
    headerRowIndex + 1 + MAX_PLAN_ROWS,
  );
  const truncated = rows.length > lastRowIndex;

  for (
    let rowIndex = headerRowIndex + 1;
    rowIndex < lastRowIndex;
    rowIndex += 1
  ) {
    const row = rows[rowIndex] ?? [];

    if (!row || row.every((cell) => toCellText(cell).trim().length === 0)) {
      continue;
    }

    const rowNumber = rowIndex + 1;
    const dateRange =
      headers.tarih_araligi === undefined
        ? null
        : parseDateRangeCell(
            row[headers.tarih_araligi],
            options.academicStartYear,
          );
    const grade =
      headers.sinif === undefined
        ? (options.defaultGrade ?? null)
        : parseGrade(row[headers.sinif]);
    const weekStart =
      headers.hafta_baslangic === undefined
        ? dateRange?.weekStart
        : parseDateCell(row[headers.hafta_baslangic]);
    const weekEnd =
      headers.hafta_bitis === undefined
        ? dateRange?.weekEnd
        : parseDateCell(row[headers.hafta_bitis]);
    const descriptionIndex = headers.aciklama;
    const description =
      descriptionIndex === undefined
        ? ''
        : toCellText(row[descriptionIndex]).trim();
    const themeIndex = headers.tema;
    const theme =
      themeIndex === undefined ? '' : toCellText(row[themeIndex]).trim();
    const subject =
      cleanImportedText(row[headers.konu!]) ||
      (theme ? cleanImportedText(theme) : '') ||
      (description ? cleanImportedText(description) : '');
    const learningOutcome = cleanImportedText(row[headers.kazanim!]);

    if (!subject && !learningOutcome) {
      continue;
    }

    if (isNonInstructionalPlanRow(subject, learningOutcome)) {
      continue;
    }

    if (!grade) {
      errors.push({
        row: rowNumber,
        message: 'Geçersiz sınıf. Sınıf 5 ile 12 arasında olmalı.',
      });
    }

    if (!weekStart) {
      errors.push({
        row: rowNumber,
        message: 'Geçersiz hafta başlangıç tarihi.',
      });
    }

    if (!weekEnd) {
      errors.push({ row: rowNumber, message: 'Geçersiz hafta bitiş tarihi.' });
    }

    if (weekStart && weekEnd && weekStart > weekEnd) {
      errors.push({
        row: rowNumber,
        message: 'Hafta başlangıcı, hafta bitişinden sonra olamaz.',
      });
    }

    if (!subject) {
      errors.push({ row: rowNumber, message: 'Konu alanı boş olamaz.' });
    }

    if (!learningOutcome) {
      errors.push({ row: rowNumber, message: 'Kazanım alanı boş olamaz.' });
    }

    if (
      !grade ||
      !weekStart ||
      !weekEnd ||
      !subject ||
      !learningOutcome ||
      weekStart > weekEnd
    ) {
      continue;
    }

    const key = `${grade}|${weekStart}|${normalizeKey(learningOutcome)}`;
    const existing = seenKeys.get(key);
    if (existing) {
      // Bir kazanım aynı haftada birden çok konuya ait olabilir (ör. MAT.7.1.1).
      // Veritabanının tekil anahtarını korurken ikinci konu adını kaybetme.
      const subjectKey = normalizeKey(subject);
      if (!existing.subjects.has(subjectKey)) {
        existing.subjects.add(subjectKey);
        existing.row.subject += `\n${subject}`;
      }
      skippedDuplicates += 1;
      continue;
    }

    const item: AnnualPlanImportRow = {
      description: description || null,
      grade,
      learning_outcome: learningOutcome,
      subject,
      week_end: weekEnd,
      week_start: weekStart,
    };
    seenKeys.set(key, {
      row: item,
      subjects: new Set([normalizeKey(subject)]),
    });
    resultRows.push(item);
  }

  if (truncated) {
    errors.push({
      row: lastRowIndex + 1,
      message: `Dosyada çok fazla satır var. İlk ${MAX_PLAN_ROWS} satır işlendi.`,
    });
  }

  return {
    errors,
    rows: errors.length > 0 ? [] : resultRows,
    skippedDuplicates,
  };
}
