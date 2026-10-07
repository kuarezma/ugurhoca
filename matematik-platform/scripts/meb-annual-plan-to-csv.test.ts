// @vitest-environment node
import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { readFile, writeFile } from 'node:fs/promises';
import {
  annualPlanCsv,
  convertMebWorkbook,
  parseWeekDates,
} from './meb-annual-plan-to-csv.mjs';
import { parseAnnualPlanFile } from '../src/lib/annual-plan-import';
import topicMeta from '../src/features/progress/topics-2026.json';

const parseCsv = (csv: string) =>
  parseAnnualPlanFile(
    new TextEncoder().encode(csv).buffer,
    'yillik-plan-2026-2027.csv',
  );
const addRow = (
  sheet: ExcelJS.Worksheet,
  week: string,
  topic: string,
  outcome: string,
) => sheet.addRow(['', week, 5, 'Tema', topic, outcome, 'Açıklama']);

describe('MEB annual plan conversion', () => {
  it.each([
    ['3. Hafta:\n28 Eylül-02 Ekim', '2026-09-28', '2026-10-02'],
    ['15. Hafta:\n28 Aralık-01 Ocak', '2026-12-28', '2027-01-01'],
    ['15. Hafta: 28-31 Aralık', '2026-12-28', '2026-12-31'],
    ['34. Hafta: 31 Mayıs- 04 Haziran', '2027-05-31', '2027-06-04'],
    ['36.Hafta :14-18 Haziran', '2027-06-14', '2027-06-18'],
    ['32. Hafta:\n20-21 Mayıs', '2027-05-20', '2027-05-21'],
  ])('parses %s', (text, start, end) =>
    expect(parseWeekDates(text)).toEqual({ start, end }),
  );

  it('rejects malformed dates instead of inventing a week', () => {
    expect(parseWeekDates('ARA TATİLİ: 16-20 Kasım')).toBeNull();
    expect(() => parseWeekDates('3. Hafta: 31-32 Şubat')).toThrow(
      'Geçersiz tarih',
    );
    expect(() => parseWeekDates('3. Hafta: 14-18 Bilinmeyen')).toThrow(
      'Bilinmeyen ay',
    );
    expect(() => parseWeekDates('3. Hafta: 18-14 Eylül')).toThrow(
      'Geçersiz hafta',
    );
  });

  it('round-trips four synthetic MEB sheets through XLSX and the admin CSV parser', async () => {
    const workbook = new ExcelJS.Workbook();
    for (const [grade, topics] of Object.entries(topicMeta)) {
      const sheet = workbook.addWorksheet(`${grade}.Sınıf`);
      sheet.addRow(['2026-2027']);
      sheet.addRow([
        'AY',
        'HAFTA',
        'DERS SAATİ',
        'TEMA',
        'KONU',
        'ÖĞRENME ÇIKTILARI',
      ]);
      for (let week = 0; week < 36; week++) {
        const start = new Date(Date.UTC(2026, 8, 14 + week * 7));
        const end = new Date(Date.UTC(2026, 8, 18 + week * 7));
        const month = (date: Date) =>
          date.toLocaleDateString('tr', { month: 'long', timeZone: 'UTC' });
        const dateRange = `${start.getUTCDate()} ${month(start)}-${end.getUTCDate()} ${month(end)}`;
        addRow(
          sheet,
          `${week + 1}. Hafta: ${dateRange}`,
          topics[week % topics.length].topic,
          `${grade === '8' ? 'M' : 'MAT'}.${grade}.1.1.${grade === '8' ? '1. ' : ' '}Öğrenme çıktısı, "örnek".`,
        );
      }
      addRow(
        sheet,
        '37. Hafta: 21-25 Haziran',
        'SOSYAL ETKİNLİK',
        'SOSYAL ETKİNLİK',
      );
      addRow(sheet, '38. Hafta: 21-25 Haziran', 'OKUL TEMELLİ PLANLAMA*', '');
      addRow(sheet, 'ARA TATİLİ: 16-20 Kasım', 'ARA TATİLİ', '');
    }
    const loaded = new ExcelJS.Workbook();
    await loaded.xlsx.load(await workbook.xlsx.writeBuffer());
    const result = await parseCsv(annualPlanCsv(convertMebWorkbook(loaded)));
    expect(result.errors).toEqual([]);
    expect(result.skippedDuplicates).toBe(0);
    expect([...new Set(result.rows.map((row) => row.grade))]).toEqual([
      5, 6, 7, 8,
    ]);
    for (const grade of [5, 6, 7, 8])
      expect(result.rows.filter((row) => row.grade === grade)).toHaveLength(36);
    expect(result.rows[0].learning_outcome).toContain('"örnek"');
  });

  it('expands multiple topics, merges duplicate cells and selects grade 8 outcome prefixes', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('8.Sınıf');
    sheet.addRow(['Yıllık Plan']);
    sheet.addRow(['Başlıklar']);
    const topics =
      'M.8.4.1. Veri Analizi\n\nM.8.5.1. Basit Olayların Olma Olasılığı';
    const outcomes =
      'M.8.4.1.2. Grafik çizer.\nM.8.5.1.1. Olası durumları belirler.\nM.8.5.1.2. Olayları ayırt eder.';
    addRow(sheet, '15. Hafta: 28 Aralık-01 Ocak', topics, outcomes);
    sheet.mergeCells('B3:B4');
    sheet.mergeCells('E3:E4');
    sheet.mergeCells('F3:F4');
    const rows = convertMebWorkbook(workbook);
    expect(rows).toHaveLength(2);
    expect(rows[0].outcomes).toEqual(['M.8.4.1.2. Grafik çizer.']);
    expect(rows[1].outcomes).toHaveLength(2);
    expect(rows[1].theme).toBe('Olasılık');
    const result = await parseCsv(annualPlanCsv(rows));
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(2);
  });

  it('normalizes source spellings and preserves shared MAT outcomes for two topics', () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('6.Sınıf');
    sheet.addRow(['Plan']);
    sheet.addRow(['Başlık']);
    addRow(
      sheet,
      '19. Hafta: 08-12 Şubat',
      'İki Paralel Doğrunun Bir Kesenile Oluşturduğu Açılar',
      'MAT.6.3.1. Açıları inceler.',
    );
    addRow(
      sheet,
      '20. Hafta: 15-19 Şubat',
      'Üçgenin Açıları\nYamuk, Paralelkenar, Eşkenar Dörtgen, Dikdörtgen ve Karenin Kenar, Açı ve Köşegen Özellikleri',
      'MAT.6.3.2. Şekilleri inceler.',
    );
    expect(convertMebWorkbook(workbook).map((row) => row.topic)).toEqual([
      'İki Paralel Doğrunun Bir Kesenle Oluşturduğu Açılar',
      'Üçgenin Açıları',
      'Dörtgenlerin Kenar, Açı ve Köşegen Özellikleri',
    ]);
    sheet.getCell('E3').value = 'Tanımsız konu';
    expect(() => convertMebWorkbook(workbook)).toThrow(
      '6.Sınıf, satır 3: Konu eşleştirilemedi',
    );
  });

  // Gerçek dosya yalnız açık yerel doğrulamada okunur; fixture veya CI bağımlılığı değildir.
  it.skipIf(!process.env.ANNUAL_PLAN_CSV)(
    'validates the explicitly supplied generated CSV',
    async () => {
      const result = await parseCsv(
        await readFile(process.env.ANNUAL_PLAN_CSV!, 'utf8'),
      );
      expect(result.errors).toEqual([]);
      // Aynı haftanın ortak kazanımları mevcut importer/DB anahtarıyla birleştirilir.
      expect(result.rows.length + result.skippedDuplicates).toBeGreaterThan(
        120,
      );
      expect([...new Set(result.rows.map((row) => row.grade))]).toEqual([
        5, 6, 7, 8,
      ]);
      const counts = Object.fromEntries(
        [5, 6, 7, 8].map((grade) => [
          grade,
          result.rows.filter((row) => row.grade === grade).length,
        ]),
      );
      for (const count of Object.values(counts)) {
        expect(count).toBeGreaterThanOrEqual(30);
        expect(count).toBeLessThanOrEqual(80);
      }
      if (process.env.ANNUAL_PLAN_REPORT) {
        await writeFile(
          process.env.ANNUAL_PLAN_REPORT,
          JSON.stringify(
            {
              rows: result.rows.length,
              errors: result.errors.length,
              skippedDuplicates: result.skippedDuplicates,
              grades: counts,
            },
            null,
            2,
          ),
        );
      }
    },
  );
});
