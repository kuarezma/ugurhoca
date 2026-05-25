import ExcelJS from 'exceljs';
import JSZip from 'jszip';

const REQUIRED_COLUMNS = [
  'sinif',
  'hafta_baslangic',
  'hafta_bitis',
  'konu',
  'kazanim',
] as const;

const HEADER_ALIASES: Record<string, string[]> = {
  aciklama: ['aciklama', 'aciklamalar', 'not', 'notlar'],
  hafta_baslangic: ['haftabaslangic', 'haftabaslangici', 'baslangic', 'weekstart'],
  hafta_bitis: ['haftabitis', 'haftabitisi', 'bitis', 'weekend'],
  tarih_araligi: ['tarih', 'tarihler', 'haftatarihi', 'sure', 'süre'],
  kazanim: [
    'kazanim',
    'kazanimlar',
    'hedefvekazanimlar',
    'learningoutcome',
    'ogrenmeciktilari',
    'ogrenmeciktiları',
  ],
  konu: [
    'konu',
    'konuicerikcercevesi',
    'ogrenmealani',
    'ogrenmealanı',
    'altogrenmealani',
    'altogrenmealanı',
    'subject',
    'tema',
    'unite',
    'ünite',
  ],
  sinif: ['sinif', 'sinifduzeyi', 'grade', 'class'],
};

export type AnnualPlanImportRow = {
  description: string | null;
  grade: number;
  learning_outcome: string;
  subject: string;
  week_end: string;
  week_start: string;
};

export type AnnualPlanImportError = {
  message: string;
  row: number;
};

export type AnnualPlanParseResult = {
  errors: AnnualPlanImportError[];
  rows: AnnualPlanImportRow[];
  skippedDuplicates: number;
};

type RawCell = string | number | Date | null | undefined;

export async function parseAnnualPlanFile(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<AnnualPlanParseResult> {
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
        message:
          lowerName.endsWith('.doc')
            ? "Eski DOC dosyası desteklenmez. Word'de DOCX olarak kaydedip yükleyin."
            : 'Yalnızca CSV, XLSX veya DOCX yıllık plan dosyası yükleyebilirsiniz.',
      },
    ],
    rows: [],
    skippedDuplicates: 0,
  };
}

export async function readAnnualPlanRawRows(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<RawCell[][]> {
  const lowerName = fileName.toLocaleLowerCase('tr');

  if (lowerName.endsWith('.csv')) {
    return parseCsvRows(decodeBuffer(buffer));
  }

  if (lowerName.endsWith('.xlsx')) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return [];
    }

    const rows: RawCell[][] = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const values: RawCell[] = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        values[colNumber - 1] = normalizeExcelCellValue(cell.value);
      });
      rows.push(values);
    });

    return rows;
  }

  if (lowerName.endsWith('.docx')) {
    return parseDocxTableRows(buffer);
  }

  return [];
}

export function parseAnnualPlanRows(
  rows: RawCell[][],
  options: { academicStartYear?: number | null; defaultGrade?: number | null } = {},
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
  const seenKeys = new Set<string>();
  let skippedDuplicates = 0;

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];

    if (!row || row.every((cell) => toCellText(cell).trim().length === 0)) {
      continue;
    }

    const rowNumber = rowIndex + 1;
    const dateRange =
      headers.tarih_araligi === undefined
        ? null
        : parseDateRangeCell(row[headers.tarih_araligi], options.academicStartYear);
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
    const subject = cleanImportedText(row[headers.konu!]);
    const learningOutcome = cleanImportedText(row[headers.kazanim!]);
    const descriptionIndex = headers.aciklama;
    const description =
      descriptionIndex === undefined
        ? ''
        : toCellText(row[descriptionIndex]).trim();

    if (!subject && !learningOutcome) {
      continue;
    }

    if (isNonInstructionalPlanRow(subject, learningOutcome)) {
      continue;
    }

    if (!grade) {
      errors.push({ row: rowNumber, message: 'Geçersiz sınıf. Sınıf 5 ile 12 arasında olmalı.' });
    }

    if (!weekStart) {
      errors.push({ row: rowNumber, message: 'Geçersiz hafta başlangıç tarihi.' });
    }

    if (!weekEnd) {
      errors.push({ row: rowNumber, message: 'Geçersiz hafta bitiş tarihi.' });
    }

    if (weekStart && weekEnd && weekStart > weekEnd) {
      errors.push({ row: rowNumber, message: 'Hafta başlangıcı, hafta bitişinden sonra olamaz.' });
    }

    if (!subject) {
      errors.push({ row: rowNumber, message: 'Konu alanı boş olamaz.' });
    }

    if (!learningOutcome) {
      errors.push({ row: rowNumber, message: 'Kazanım alanı boş olamaz.' });
    }

    if (!grade || !weekStart || !weekEnd || !subject || !learningOutcome || weekStart > weekEnd) {
      continue;
    }

    const key = `${grade}|${weekStart}|${normalizeKey(learningOutcome)}`;
    if (seenKeys.has(key)) {
      skippedDuplicates += 1;
      continue;
    }
    seenKeys.add(key);

    resultRows.push({
      description: description || null,
      grade,
      learning_outcome: learningOutcome,
      subject,
      week_end: weekEnd,
      week_start: weekStart,
    });
  }

  return { errors, rows: errors.length > 0 ? [] : resultRows, skippedDuplicates };
}

function decodeBuffer(buffer: ArrayBuffer) {
  return new TextDecoder('utf-8').decode(buffer).replace(/^\uFEFF/, '');
}

function inferAcademicStartYearFromRows(rows: RawCell[][]) {
  const text = rows
    .flat()
    .map((cell) => toCellText(cell))
    .join(' ');
  const match = text.match(/\b(20\d{2})\s*[-–/]\s*(20\d{2})\b/);

  if (!match) {
    return null;
  }

  const startYear = Number(match[1]);
  const endYear = Number(match[2]);

  return endYear === startYear + 1 ? startYear : null;
}

function parseCsvRows(text: string): RawCell[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delimiter =
    (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length
      ? ';'
      : ',';
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? '';
    const nextChar = text[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some((cell) => cell.trim().length > 0)) {
    rows.push(row);
  }

  return rows;
}

async function parseDocxTableRows(buffer: ArrayBuffer): Promise<RawCell[][]> {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file('word/document.xml')?.async('string');

  if (!documentXml) {
    return [];
  }

  const tableMatches = Array.from(documentXml.matchAll(/<w:tbl[\s\S]*?<\/w:tbl>/g));
  const tables = tableMatches
    .map((match) => parseDocxRowsFromTable(match[0]))
    .filter((tableRows) => tableRows.length > 0);

  if (tables.length === 0) {
    return [];
  }

  return [...tables].sort((left, right) => right.length - left.length)[0] ?? [];
}

function parseDocxRowsFromTable(tableXml: string): RawCell[][] {
  return Array.from(tableXml.matchAll(/<w:tr[\s\S]*?<\/w:tr>/g))
    .map((rowMatch) =>
      Array.from(rowMatch[0].matchAll(/<w:tc[\s\S]*?<\/w:tc>/g)).map((cellMatch) =>
        extractDocxCellText(cellMatch[0]),
      ),
    )
    .filter((row) => row.some((cell) => cell.trim().length > 0));
}

function extractDocxCellText(cellXml: string) {
  const paragraphTexts = Array.from(cellXml.matchAll(/<w:p[\s\S]*?<\/w:p>/g))
    .map((paragraphMatch) =>
      Array.from(paragraphMatch[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g))
        .map((textMatch) => decodeXmlText(textMatch[1] || ''))
        .join(''),
    )
    .filter(Boolean);

  return paragraphTexts.join(' ').replace(/\s+/g, ' ').trim();
}

function decodeXmlText(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function mapHeaders(row: RawCell[]) {
  const headers: Partial<Record<keyof typeof HEADER_ALIASES, number>> = {};

  row.forEach((cell, index) => {
    const normalized = normalizeHeader(toCellText(cell));
    const match = Object.entries(HEADER_ALIASES).find(([, aliases]) =>
      aliases.includes(normalized),
    );

    if (match) {
      headers[match[0] as keyof typeof HEADER_ALIASES] = index;
    }
  });

  return headers;
}

function normalizeHeader(value: string) {
  return normalizeKey(value).replace(/[^a-z0-9]/g, '');
}

function normalizeKey(value: string) {
  return value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function toCellText(value: RawCell) {
  if (value instanceof Date) {
    return formatDate(value);
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function cleanImportedText(value: RawCell) {
  return toCellText(value)
    .replace(/^[>\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isNonInstructionalPlanRow(subject: string, learningOutcome: string) {
  const normalizedText = normalizeKey(`${subject} ${learningOutcome}`)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalizedText) {
    return false;
  }

  return NON_INSTRUCTIONAL_PLAN_KEYWORDS.some((keyword) =>
    normalizedText.includes(keyword),
  );
}

function parseGrade(value: RawCell) {
  const text = toCellText(value);
  const match = text.match(/\d+/);
  const grade = match ? Number(match[0]) : Number(text);

  return Number.isInteger(grade) && grade >= 5 && grade <= 12 ? grade : null;
}

function parseDateCell(value: RawCell) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return formatDate(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    return formatDate(new Date(excelEpoch + value * 24 * 60 * 60 * 1000));
  }

  const text = toCellText(value).trim();
  if (!text) {
    return null;
  }

  const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return buildDateString(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const trMatch = text.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (trMatch) {
    return buildDateString(Number(trMatch[3]), Number(trMatch[2]), Number(trMatch[1]));
  }

  return null;
}

function parseDateRangeCell(value: RawCell, academicStartYear?: number | null) {
  const text = toCellText(value).trim();
  if (!text) {
    return null;
  }

  const explicitDates = Array.from(
    text.matchAll(/(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[./]\d{1,2}[./]\d{4})/g),
  )
    .map((match) => parseDateCell(match[1]))
    .filter(Boolean);

  if (explicitDates.length >= 2) {
    return { weekEnd: explicitDates[1], weekStart: explicitDates[0] };
  }

  const compactTwoMonthMatch = text.match(
    /(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)\s*[-–]\s*(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)(?:\s+(\d{4}))?/i,
  );
  if (compactTwoMonthMatch) {
    const startMonth = parseTurkishMonth(compactTwoMonthMatch[3]);
    const endMonth = parseTurkishMonth(compactTwoMonthMatch[4]);
    const startYear = compactTwoMonthMatch[5]
      ? Number(compactTwoMonthMatch[5])
      : inferAcademicYearForMonth(startMonth, academicStartYear);
    const endYear = compactTwoMonthMatch[5]
      ? Number(compactTwoMonthMatch[5])
      : inferAcademicYearForMonth(endMonth, academicStartYear);
    const weekStart = buildDateString(
      startYear,
      startMonth,
      Number(compactTwoMonthMatch[1]),
    );
    const weekEnd = buildDateString(
      endYear,
      endMonth,
      Number(compactTwoMonthMatch[2]),
    );

    return weekStart && weekEnd ? { weekEnd, weekStart } : null;
  }

  const sameMonthMatch = text.match(
    /(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)(?:\s+(\d{4}))?/i,
  );
  if (sameMonthMatch) {
    const month = parseTurkishMonth(sameMonthMatch[3]);
    const year = sameMonthMatch[4]
      ? Number(sameMonthMatch[4])
      : inferAcademicYearForMonth(month, academicStartYear);
    const weekStart = buildDateString(year, month, Number(sameMonthMatch[1]));
    const weekEnd = buildDateString(year, month, Number(sameMonthMatch[2]));

    return weekStart && weekEnd ? { weekEnd, weekStart } : null;
  }

  const twoMonthMatch = text.match(
    /(\d{1,2})\s+(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)\s*[-–]\s*(\d{1,2})\s+(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)(?:\s+(\d{4}))?/i,
  );
  if (twoMonthMatch) {
    const startMonth = parseTurkishMonth(twoMonthMatch[2]);
    const endMonth = parseTurkishMonth(twoMonthMatch[4]);
    const startYear = twoMonthMatch[5]
      ? Number(twoMonthMatch[5])
      : inferAcademicYearForMonth(startMonth, academicStartYear);
    const endYear = twoMonthMatch[5]
      ? Number(twoMonthMatch[5])
      : inferAcademicYearForMonth(endMonth, academicStartYear);
    const weekStart = buildDateString(
      startYear,
      startMonth,
      Number(twoMonthMatch[1]),
    );
    const weekEnd = buildDateString(
      endYear,
      endMonth,
      Number(twoMonthMatch[3]),
    );

    return weekStart && weekEnd ? { weekEnd, weekStart } : null;
  }

  return null;
}

function parseTurkishMonth(value: string) {
  const normalized = normalizeHeader(value);
  const months: Record<string, number> = {
    agustos: 8,
    aralik: 12,
    eylul: 9,
    ekim: 10,
    haziran: 6,
    kasim: 11,
    mart: 3,
    mayis: 5,
    nisan: 4,
    ocak: 1,
    subat: 2,
    temmuz: 7,
  };

  return months[normalized] ?? 0;
}

function inferAcademicYearForMonth(month: number, providedAcademicStartYear?: number | null) {
  if (providedAcademicStartYear) {
    return month >= 8 ? providedAcademicStartYear : providedAcademicStartYear + 1;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const fallbackAcademicStartYear =
    currentMonth >= 8 ? currentYear : currentYear - 1;

  return month >= 8 ? fallbackAcademicStartYear : fallbackAcademicStartYear + 1;
}

function buildDateString(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDate(date: Date) {
  return (
    buildDateString(date.getFullYear(), date.getMonth() + 1, date.getDate()) ??
    ''
  );
}

function normalizeExcelCellValue(value: ExcelJS.CellValue): RawCell {
  if (value instanceof Date || typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && 'text' in value) {
    return String(value.text);
  }

  if (value && typeof value === 'object' && 'result' in value) {
    return normalizeExcelCellValue(value.result as ExcelJS.CellValue);
  }

  return value === null || value === undefined ? null : String(value);
}

const NON_INSTRUCTIONAL_PLAN_KEYWORDS = [
  'ara tatil',
  'bayram',
  'kurban bayrami',
  'ramazan bayrami',
  'resmi tatil',
  'tatil',
  'yariyil tatili',
];
