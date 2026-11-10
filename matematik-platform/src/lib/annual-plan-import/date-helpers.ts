import {
  HEADER_ALIASES,
  MAX_PLAN_CELL_LENGTH,
  NON_INSTRUCTIONAL_PLAN_KEYWORDS,
  type RawCell,
} from './types';

export function decodeBuffer(buffer: ArrayBuffer): string {
  return new TextDecoder('utf-8').decode(buffer).replace(/^\uFEFF/, '');
}

export function inferAcademicStartYearFromRows(
  rows: RawCell[][],
): number | null {
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

export function mapHeaders(
  row: RawCell[],
): Partial<Record<keyof typeof HEADER_ALIASES, number>> {
  const headers: Partial<Record<keyof typeof HEADER_ALIASES, number>> = {};

  row.forEach((cell, index) => {
    const normalized = normalizeHeader(toCellText(cell));
    for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
      const aliasIndex = aliases.indexOf(normalized);
      if (aliasIndex !== -1) {
        const currentCol = headers[key as keyof typeof HEADER_ALIASES];
        if (currentCol === undefined) {
          headers[key as keyof typeof HEADER_ALIASES] = index;
        } else {
          const currentAliasIndex = aliases.indexOf(
            normalizeHeader(toCellText(row[currentCol])),
          );
          if (aliasIndex < currentAliasIndex) {
            headers[key as keyof typeof HEADER_ALIASES] = index;
          }
        }
      }
    }
  });

  return headers;
}

export function normalizeHeader(value: string): string {
  return normalizeKey(value).replace(/[^a-z0-9]/g, '');
}

export function normalizeKey(value: string): string {
  return value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function toCellText(value: RawCell): string {
  if (value instanceof Date) {
    return formatDate(value);
  }

  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);
  return text.length > MAX_PLAN_CELL_LENGTH
    ? text.slice(0, MAX_PLAN_CELL_LENGTH)
    : text;
}

export function cleanImportedText(value: RawCell): string {
  return toCellText(value)
    .replace(/^[>\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isNonInstructionalPlanRow(
  subject: string,
  learningOutcome: string,
): boolean {
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

export function parseGrade(value: RawCell): number | null {
  const text = toCellText(value);
  const match = text.match(/\d+/);
  const grade = match ? Number(match[0]) : Number(text);

  return Number.isInteger(grade) && grade >= 5 && grade <= 12 ? grade : null;
}

export function parseDateCell(value: RawCell): string | null {
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
    return buildDateString(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3]),
    );
  }

  const trMatch = text.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (trMatch) {
    return buildDateString(
      Number(trMatch[3]),
      Number(trMatch[2]),
      Number(trMatch[1]),
    );
  }

  return null;
}

export function parseDateRangeCell(
  value: RawCell,
  academicStartYear?: number | null,
): { weekEnd: string; weekStart: string } | null {
  const text = toCellText(value).trim();
  if (!text) {
    return null;
  }

  const explicitDates = Array.from(
    text.matchAll(/(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[./]\d{1,2}[./]\d{4})/g),
  )
    .map((match) => parseDateCell(match[1]))
    .filter((d): d is string => Boolean(d));

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

export function parseTurkishMonth(value: string): number {
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

export function inferAcademicYearForMonth(
  month: number,
  providedAcademicStartYear?: number | null,
): number {
  if (providedAcademicStartYear) {
    return month >= 8
      ? providedAcademicStartYear
      : providedAcademicStartYear + 1;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const fallbackAcademicStartYear =
    currentMonth >= 8 ? currentYear : currentYear - 1;

  return month >= 8 ? fallbackAcademicStartYear : fallbackAcademicStartYear + 1;
}

export function buildDateString(
  year: number,
  month: number,
  day: number,
): string | null {
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

export function formatDate(date: Date): string {
  return (
    buildDateString(date.getFullYear(), date.getMonth() + 1, date.getDate()) ??
    ''
  );
}
