import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { MAX_PLAN_CELL_LENGTH, MAX_PLAN_ROWS, type RawCell } from './types';
import { decodeBuffer, normalizeKey } from './date-helpers';

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

export function parseCsvRows(text: string): RawCell[][] {
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
      if (rows.length > MAX_PLAN_ROWS + 10) {
        break;
      }
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some((cell) => cell.trim().length > 0)) {
    rows.push(row);
  }

  return rows.map((csvRow) =>
    csvRow.map((cell) =>
      cell.length > MAX_PLAN_CELL_LENGTH
        ? cell.slice(0, MAX_PLAN_CELL_LENGTH)
        : cell,
    ),
  );
}

export async function parseDocxTableRows(
  buffer: ArrayBuffer,
): Promise<RawCell[][]> {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file('word/document.xml')?.async('string');

  if (!documentXml) {
    return [];
  }

  const tableMatches = Array.from(
    documentXml.matchAll(/<w:tbl[\s\S]*?<\/w:tbl>/g),
  );
  const tables = tableMatches
    .map((match) => parseDocxRowsFromTable(match[0]))
    .filter((tableRows) => tableRows.length > 0);

  if (tables.length === 0) {
    return [];
  }

  const planTables = tables.filter((table) => {
    const firstRowText = normalizeKey((table[0] || []).join(' '));
    return (
      firstRowText.includes('tarih') &&
      (firstRowText.includes('hafta') ||
        firstRowText.includes('ogrenme') ||
        firstRowText.includes('kazanim'))
    );
  });

  if (planTables.length > 1) {
    const combined: RawCell[][] = [planTables[0][0]];
    for (const t of planTables) {
      combined.push(...t.slice(1));
    }
    return combined;
  }

  return [...tables].sort((left, right) => right.length - left.length)[0] ?? [];
}

export function parseDocxRowsFromTable(tableXml: string): RawCell[][] {
  return Array.from(tableXml.matchAll(/<w:tr[\s\S]*?<\/w:tr>/g))
    .map((rowMatch) =>
      Array.from(rowMatch[0].matchAll(/<w:tc[\s\S]*?<\/w:tc>/g)).map(
        (cellMatch) => extractDocxCellText(cellMatch[0]),
      ),
    )
    .filter((row) => row.some((cell) => cell.trim().length > 0));
}

export function extractDocxCellText(cellXml: string): string {
  const paragraphTexts = Array.from(cellXml.matchAll(/<w:p[\s\S]*?<\/w:p>/g))
    .map((paragraphMatch) =>
      Array.from(
        paragraphMatch[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g),
      )
        .map((textMatch) => decodeXmlText(textMatch[1] || ''))
        .join(''),
    )
    .filter(Boolean);

  return paragraphTexts.join(' ').replace(/\s+/g, ' ').trim();
}

export function decodeXmlText(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

export function normalizeExcelCellValue(value: ExcelJS.CellValue): RawCell {
  if (
    value instanceof Date ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
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
