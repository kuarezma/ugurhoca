import fs from 'node:fs/promises';
import path from 'node:path';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Kullanım: npm run preview:annual-plan -- <dosya-yolu>');
  process.exit(1);
}

const absolutePath = path.resolve(filePath);
const fileName = path.basename(absolutePath).toLocaleLowerCase('tr');
const buffer = await fs.readFile(absolutePath);
const rows = await readRows(buffer, fileName);

console.log('Yıllık plan dosya önizleme\n');
console.log(`Dosya: ${absolutePath}`);
console.log(`Okunan tablo satırı: ${rows.length}`);

if (rows.length === 0) {
  console.error('\nTablo/satır bulunamadı. Word dosyasını .docx ve tablo halinde kaydedin.');
  process.exit(1);
}

console.log('\nİlk 8 satır:');
for (const row of rows.slice(0, 8)) {
  console.log(`- ${row.map((cell) => cell || '-').join(' | ')}`);
}

const parsedRows = parseRowsForPreview(rows, path.basename(absolutePath));
console.log(`\nİçe aktarılabilir satır: ${parsedRows.rows.length}`);

if (parsedRows.errors.length > 0) {
  console.log('\nİçe aktarma uyarıları:');
  for (const error of parsedRows.errors.slice(0, 8)) {
    console.log(`- Satır ${error.row}: ${error.message}`);
  }
  process.exit(1);
}

if (parsedRows.rows.length > 0) {
  console.log('\nİçe aktarılacak ilk satırlar:');
  for (const row of parsedRows.rows.slice(0, 5)) {
    console.log(
      `- ${row.grade}. sınıf | ${row.week_start} - ${row.week_end} | ${row.subject} | ${row.learning_outcome}`,
    );
  }
}

async function readRows(fileBuffer, lowerName) {
  if (lowerName.endsWith('.csv')) {
    return parseCsvRows(fileBuffer.toString('utf8').replace(/^\uFEFF/, ''));
  }

  if (lowerName.endsWith('.xlsx')) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(fileBuffer));
    const worksheet = workbook.worksheets[0];
    if (!worksheet) return [];

    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const values = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        values[colNumber - 1] = String(cell.text || cell.value || '').trim();
      });
      rows.push(values);
    });
    return rows;
  }

  if (lowerName.endsWith('.docx')) {
    const zip = await JSZip.loadAsync(toArrayBuffer(fileBuffer));
    const documentXml = await zip.file('word/document.xml')?.async('string');
    if (!documentXml) return [];

    const tables = Array.from(documentXml.matchAll(/<w:tbl[\s\S]*?<\/w:tbl>/g))
      .map((match) => parseDocxRowsFromTable(match[0]))
      .filter((tableRows) => tableRows.length > 0);

    return [...tables].sort((left, right) => right.length - left.length)[0] ?? [];
  }

  console.error('Desteklenen formatlar: .csv, .xlsx, .docx');
  process.exit(1);
}

function parseCsvRows(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(/[;,]/).map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
}

function parseDocxRowsFromTable(tableXml) {
  return Array.from(tableXml.matchAll(/<w:tr[\s\S]*?<\/w:tr>/g))
    .map((rowMatch) =>
      Array.from(rowMatch[0].matchAll(/<w:tc[\s\S]*?<\/w:tc>/g)).map((cellMatch) =>
        extractDocxCellText(cellMatch[0]),
      ),
    )
    .filter((row) => row.some((cell) => cell.trim().length > 0));
}

function extractDocxCellText(cellXml) {
  return Array.from(cellXml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g))
    .map((textMatch) => decodeXmlText(textMatch[1] || ''))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeXmlText(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function toArrayBuffer(fileBuffer) {
  return fileBuffer.buffer.slice(
    fileBuffer.byteOffset,
    fileBuffer.byteOffset + fileBuffer.byteLength,
  );
}

function parseRowsForPreview(rows, originalFileName) {
  const defaultGrade = parseGrade(originalFileName);
  const academicStartYear = inferAcademicStartYearFromRows(rows);
  const headerRowIndex = rows.findIndex((row) => row.some((cell) => cell.trim()));

  if (headerRowIndex === -1) {
    return {
      errors: [{ row: 1, message: 'Dosyada başlık satırı bulunamadı.' }],
      rows: [],
    };
  }

  const headers = mapHeaders(rows[headerRowIndex] || []);
  const missingColumns = ['sinif', 'hafta_baslangic', 'hafta_bitis', 'konu', 'kazanim'].filter(
    (column) => {
      if (column === 'sinif' && defaultGrade) return false;
      if (
        (column === 'hafta_baslangic' || column === 'hafta_bitis') &&
        headers.tarih_araligi !== undefined
      ) {
        return false;
      }
      return headers[column] === undefined;
    },
  );

  if (missingColumns.length > 0) {
    return {
      errors: [
        {
          row: headerRowIndex + 1,
          message: `Eksik kolon: ${missingColumns.join(', ')}.`,
        },
      ],
      rows: [],
    };
  }

  const parsed = [];
  const errors = [];

  for (let index = headerRowIndex + 1; index < rows.length; index += 1) {
    const row = rows[index] || [];
    if (row.every((cell) => !cell.trim())) continue;

    const dateRange =
      headers.tarih_araligi === undefined
        ? null
        : parseDateRangeCell(row[headers.tarih_araligi], academicStartYear);
    const grade =
      headers.sinif === undefined ? defaultGrade : parseGrade(row[headers.sinif]);
    const weekStart =
      headers.hafta_baslangic === undefined
        ? dateRange?.weekStart
        : parseDateCell(row[headers.hafta_baslangic]);
    const weekEnd =
      headers.hafta_bitis === undefined
        ? dateRange?.weekEnd
        : parseDateCell(row[headers.hafta_bitis]);
    const subject = cleanImportedText(row[headers.konu]);
    const learningOutcome = cleanImportedText(row[headers.kazanim]);

    if (!subject && !learningOutcome) continue;

    if (!grade) errors.push({ row: index + 1, message: 'Geçersiz sınıf.' });
    if (!weekStart) errors.push({ row: index + 1, message: 'Geçersiz hafta başlangıç tarihi.' });
    if (!weekEnd) errors.push({ row: index + 1, message: 'Geçersiz hafta bitiş tarihi.' });
    if (!subject) errors.push({ row: index + 1, message: 'Konu alanı boş olamaz.' });
    if (!learningOutcome) errors.push({ row: index + 1, message: 'Kazanım alanı boş olamaz.' });

    if (grade && weekStart && weekEnd && subject && learningOutcome) {
      parsed.push({
        grade,
        learning_outcome: learningOutcome,
        subject,
        week_end: weekEnd,
        week_start: weekStart,
      });
    }
  }

  return { errors, rows: errors.length > 0 ? [] : parsed };
}

function mapHeaders(row) {
  const aliases = {
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
  const headers = {};

  row.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);
    const match = Object.entries(aliases).find(([, values]) =>
      values.includes(normalized),
    );
    if (match) headers[match[0]] = index;
  });

  return headers;
}

function normalizeHeader(value) {
  return normalizeKey(value).replace(/[^a-z0-9]/g, '');
}

function normalizeKey(value) {
  return String(value || '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function inferAcademicStartYearFromRows(rows) {
  const text = rows.flat().join(' ');
  const match = text.match(/\b(20\d{2})\s*[-–/]\s*(20\d{2})\b/);
  if (!match) return null;

  const startYear = Number(match[1]);
  const endYear = Number(match[2]);
  return endYear === startYear + 1 ? startYear : null;
}

function cleanImportedText(value) {
  return String(value || '')
    .replace(/^[>\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseGrade(value) {
  const match = String(value || '').match(/\d+/);
  const grade = match ? Number(match[0]) : null;
  return Number.isInteger(grade) && grade >= 5 && grade <= 12 ? grade : null;
}

function parseDateCell(value) {
  const text = String(value || '').trim();
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

function parseDateRangeCell(value, academicStartYear) {
  const text = String(value || '').trim();
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
  if (!sameMonthMatch) return null;

  const month = parseTurkishMonth(sameMonthMatch[3]);
  const year = sameMonthMatch[4]
    ? Number(sameMonthMatch[4])
    : inferAcademicYearForMonth(month, academicStartYear);
  const weekStart = buildDateString(year, month, Number(sameMonthMatch[1]));
  const weekEnd = buildDateString(year, month, Number(sameMonthMatch[2]));

  return weekStart && weekEnd ? { weekEnd, weekStart } : null;
}

function parseTurkishMonth(value) {
  const months = {
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
  return months[normalizeHeader(value)] || 0;
}

function inferAcademicYearForMonth(month, providedAcademicStartYear) {
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

function buildDateString(year, month, day) {
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
