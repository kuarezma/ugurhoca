import ExcelJS from 'exceljs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const topicMeta = JSON.parse(
  await readFile(
    new URL('../src/features/progress/topics-2026.json', import.meta.url),
    'utf8',
  ),
);
const months = [
  'ocak',
  'şubat',
  'mart',
  'nisan',
  'mayıs',
  'haziran',
  'temmuz',
  'ağustos',
  'eylül',
  'ekim',
  'kasım',
  'aralık',
];
const normalize = (text) =>
  text.normalize('NFC').toLocaleLowerCase('tr').replace(/\s+/g, ' ').trim();
// Kaynak Excel'deki farklı yazımlar; uygulamanın takma ad listesine eklenmez.
const sourceSpellings = {
  'İki Paralel Doğrunun Bir Kesenile Oluşturduğu Açılar':
    'İki Paralel Doğrunun Bir Kesenle Oluşturduğu Açılar',
  'Yamuk, Paralelkenar, Eşkenar Dörtgen, Dikdörtgen ve Karenin Kenar, Açı ve Köşegen Özellikleri':
    'Dörtgenlerin Kenar, Açı ve Köşegen Özellikleri',
  'Üçgenlerde Kenarortay ve İnşası, Açıortay, Yükseklik':
    'Üçgenlerde Kenarortay, Açıortay ve Yükseklik',
};
const nonTeaching = /okul\s+temelli\s+planlama|sosyal\s+etkinlik|tatil/i;

export function parseWeekDates(text, startYear = 2026) {
  if (!/\d+\s*\.\s*Hafta\b/i.test(text)) return null;
  const datePart = normalize(text)
    .replace(/^.*?hafta\s*:?\s*/, '')
    .replace(/[–—]/g, '-');
  const match = datePart.match(
    /^(\d{1,2})\s*(\p{L}+)?\s*-\s*(\d{1,2})\s*(\p{L}+)(?:\s+\d{4})?$/u,
  );
  if (!match) throw new Error(`Hafta tarihi okunamadı: ${text}`);
  const startMonth = months.indexOf(match[2] || match[4]) + 1;
  const endMonth = months.indexOf(match[4]) + 1;
  const iso = (day, month) => {
    if (!month) throw new Error(`Bilinmeyen ay: ${text}`);
    const year = month >= 9 ? startYear : startYear + 1;
    const date = new Date(Date.UTC(year, month - 1, Number(day)));
    if (date.getUTCMonth() !== month - 1)
      throw new Error(`Geçersiz tarih: ${text}`);
    return date.toISOString().slice(0, 10);
  };
  const start = iso(match[1], startMonth);
  const end = iso(match[3], endMonth);
  if (end < start || (Date.parse(end) - Date.parse(start)) / 86400000 > 6)
    throw new Error(`Geçersiz hafta aralığı: ${text}`);
  return { start, end };
}

function readTopics(text, grade) {
  let remaining = normalize(text).replace(/\bm\.\d+(?:\.\d+)+\.?\s*/g, '');
  const candidates = topicMeta[grade].flatMap((item) =>
    [item.topic, ...item.aliases].map((name) => [name, item.topic]),
  );
  candidates.push(...Object.entries(sourceSpellings));
  // Uzun ad önce çıkarılır: "Oran" veya "Cebirsel İfadelerle İşlemler" alt dizesi değildir.
  candidates.sort((a, b) => b[0].length - a[0].length);
  const found = new Set();
  for (const [name, topic] of candidates) {
    if (!topicMeta[grade].some((item) => item.topic === topic)) continue;
    const escaped = normalize(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,
      'gu',
    );
    remaining = remaining.replace(pattern, (_match, prefix) => {
      found.add(topic);
      return prefix + ' ';
    });
  }
  if (!found.size || remaining.trim())
    throw new Error(`Konu eşleştirilemedi (${grade}): ${text}`);
  return [...found];
}

function outcomeParts(text, grade) {
  const parts = text
    .trim()
    .split(/(?=\b(?:MAT|M)\.\d+\.\d+\.\d+\.)/u)
    .map((part) => part.trim())
    .filter(Boolean);
  if (
    !parts.length ||
    parts.some(
      (part) =>
        !new RegExp(`^(?:MAT|M)\\.${grade}\\.\\d+\\.\\d+\\.`).test(part),
    )
  ) {
    throw new Error(`Öğrenme çıktısı okunamadı (${grade}): ${text}`);
  }
  return parts.map((part) => part.replace(/\s+/g, ' '));
}

export function convertMebWorkbook(workbook, startYear = 2026) {
  const rows = new Map();
  for (const sheet of workbook.worksheets) {
    const grade = sheet.name.match(/^([5-8])\s*\.\s*Sınıf$/i)?.[1];
    if (!grade) continue;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < 3) return;
      const week = row.getCell(2).text;
      const rawTopic = row.getCell(5).text;
      if (
        nonTeaching.test(normalize(rawTopic)) ||
        !/\d+\s*\.\s*Hafta\b/i.test(week)
      )
        return;
      try {
        const dates = parseWeekDates(week, startYear);
        const topics = readTopics(rawTopic, grade);
        const outcomes = outcomeParts(row.getCell(6).text, grade);
        for (const topic of topics) {
          // 8. sınıfta konu kodu kazanımın ön ekidir; diğer sınıflarda ortak çıktı olabilir.
          const topicCode =
            grade === '8'
              ? [...rawTopic.matchAll(/M\.8\.\d+\.\d+\./g)]
                  .map((match) => match[0])
                  .find((code) => {
                    const section = rawTopic
                      .slice(rawTopic.indexOf(code) + code.length)
                      .split(/M\.8\.\d+\.\d+\./)[0];
                    return readTopics(section, grade).includes(topic);
                  })
              : null;
          const relevant = topicCode
            ? outcomes.filter((outcome) => outcome.startsWith(topicCode))
            : outcomes;
          if (!relevant.length)
            throw new Error(`Konu için kazanım yok: ${topic}`);
          const key = `${grade}|${dates.start}|${dates.end}|${topic}`;
          const existing = rows.get(key);
          const item = topicMeta[grade].find((entry) => entry.topic === topic);
          if (existing) {
            existing.outcomes = [
              ...new Set([...existing.outcomes, ...relevant]),
            ];
          } else {
            rows.set(key, {
              grade: Number(grade),
              week_start: dates.start,
              week_end: dates.end,
              topic,
              theme: item.theme,
              outcomes: relevant,
            });
          }
        }
      } catch (error) {
        throw new Error(`${sheet.name}, satır ${rowNumber}: ${error.message}`, {
          cause: error,
        });
      }
    });
  }
  if (!rows.size) throw new Error('Dönüştürülecek öğretim satırı bulunamadı.');
  return [...rows.values()].sort(
    (a, b) =>
      a.grade - b.grade ||
      a.week_start.localeCompare(b.week_start) ||
      topicMeta[a.grade].findIndex((item) => item.topic === a.topic) -
        topicMeta[b.grade].findIndex((item) => item.topic === b.topic),
  );
}

export function annualPlanCsv(rows) {
  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
  return (
    '\uFEFFsinif,hafta_baslangic,hafta_bitis,konu,kazanim,aciklama\r\n' +
    rows
      .map((row) =>
        [
          row.grade,
          row.week_start,
          row.week_end,
          row.topic,
          row.outcomes.join('\n'),
          row.theme,
        ]
          .map(escape)
          .join(','),
      )
      .join('\r\n') +
    '\r\n'
  );
}

export async function convertMebFile(input, output) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(input);
  const rows = convertMebWorkbook(workbook);
  await writeFile(output, annualPlanCsv(rows), 'utf8');
  return rows;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [, , input, output = 'yillik-plan-2026-2027.csv'] = process.argv;
  if (!input) {
    console.error(
      'Kullanım: node scripts/meb-annual-plan-to-csv.mjs <meb.xlsx> [çıktı.csv]',
    );
    process.exitCode = 1;
  } else {
    try {
      const rows = await convertMebFile(input, output);
      console.log(
        JSON.stringify({
          output: resolve(output),
          rows: rows.length,
          grades: Object.fromEntries(
            [5, 6, 7, 8].map((grade) => [
              grade,
              rows.filter((row) => row.grade === grade).length,
            ]),
          ),
        }),
      );
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
