import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { parseAnnualPlanFile, parseAnnualPlanRows } from '@/lib/annual-plan-import';

describe('annual plan import parser', () => {
  it('parses valid annual plan rows and skips duplicates from the same file', () => {
    const result = parseAnnualPlanRows([
      ['sinif', 'hafta_baslangic', 'hafta_bitis', 'konu', 'kazanim', 'aciklama'],
      ['8', '2026-09-14', '2026-09-18', 'Üslü İfadeler', 'M.8.1.2.1', 'Tekrar'],
      ['8. Sınıf', '14.09.2026', '18.09.2026', 'Üslü İfadeler', 'M.8.1.2.1', 'Aynı kayıt'],
    ]);

    expect(result.errors).toEqual([]);
    expect(result.skippedDuplicates).toBe(1);
    expect(result.rows).toEqual([
      {
        description: 'Tekrar',
        grade: 8,
        learning_outcome: 'M.8.1.2.1',
        subject: 'Üslü İfadeler',
        week_end: '2026-09-18',
        week_start: '2026-09-14',
      },
    ]);
  });

  it('returns Turkish validation errors for missing columns', () => {
    const result = parseAnnualPlanRows([
      ['sinif', 'hafta_baslangic', 'konu'],
      ['8', '2026-09-14', 'Üslü İfadeler'],
    ]);

    expect(result.rows).toEqual([]);
    expect(result.errors[0]?.message).toContain('Eksik kolon');
    expect(result.errors[0]?.message).toContain('hafta_bitis');
    expect(result.errors[0]?.message).toContain('kazanim');
  });

  it('rejects invalid grade, dates and empty subject fields', () => {
    const result = parseAnnualPlanRows([
      ['sinif', 'hafta_baslangic', 'hafta_bitis', 'konu', 'kazanim'],
      ['4', '2026-09-20', '2026-09-18', '', 'M.8.1.2.1'],
    ]);

    expect(result.rows).toEqual([]);
    expect(result.errors.map((error) => error.message)).toEqual([
      'Geçersiz sınıf. Sınıf 5 ile 12 arasında olmalı.',
      'Hafta başlangıcı, hafta bitişinden sonra olamaz.',
      'Konu alanı boş olamaz.',
    ]);
  });

  it('parses annual plan rows from a DOCX table', async () => {
    const zip = new JSZip();
    zip.file(
      'word/document.xml',
      `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:tbl>
            ${buildDocxRow(['sinif', 'hafta_baslangic', 'hafta_bitis', 'konu', 'kazanim', 'aciklama'])}
            ${buildDocxRow(['8', '2026-05-18', '2026-05-24', 'Üslü İfadeler', 'M.8.1.2.1', 'Word planı'])}
          </w:tbl>
        </w:body>
      </w:document>`,
    );

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const result = await parseAnnualPlanFile(buffer, 'yillik-plan.docx');

    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([
      {
        description: 'Word planı',
        grade: 8,
        learning_outcome: 'M.8.1.2.1',
        subject: 'Üslü İfadeler',
        week_end: '2026-05-24',
        week_start: '2026-05-18',
      },
    ]);
  });

  it('parses common Word annual plan headers with date range and grade from filename', async () => {
    const zip = new JSZip();
    zip.file(
      'word/document.xml',
      `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:tbl>
            ${buildDocxRow(['Tarih', 'Öğrenme Alanı', 'Kazanımlar', 'Açıklamalar'])}
            ${buildDocxRow(['18-24 Mayıs 2026', 'Üslü İfadeler', 'M.8.1.2.1', 'Word planı'])}
          </w:tbl>
        </w:body>
      </w:document>`,
    );

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const result = await parseAnnualPlanFile(buffer, '8-sinif-yillik-plan.docx');

    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([
      {
        description: 'Word planı',
        grade: 8,
        learning_outcome: 'M.8.1.2.1',
        subject: 'Üslü İfadeler',
        week_end: '2026-05-24',
        week_start: '2026-05-18',
      },
    ]);
  });

  it('parses Maarif Word annual plan headers with yearless date ranges', async () => {
    const zip = new JSZip();
    zip.file(
      'word/document.xml',
      `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:tbl>
            ${buildDocxRow(['TARİH', 'HAFTA', 'SAAT', 'TEMA', 'KONU (İÇERİK ÇERÇEVESİ)', 'ÖĞRENME ÇIKTILARI'])}
            ${buildDocxRow(['08-12 Eylül', '1. Hafta', '5 Saat', 'MAT.5.3.GEOMETRİK ŞEKİLLER', 'Temel Geometrik Çizimler ve İnşalar', 'MAT.5.3.1. Temel geometrik çizimler için matematiksel araç ve teknolojiden yararlanabilme'])}
            ${buildDocxRow(['29-03 Eylül-Ekim', '4. Hafta', '5 Saat', 'MAT.5.3.GEOMETRİK ŞEKİLLER', 'Açı Ölçme', 'MAT.5.3.4. Açılara dair çıkarım yapabilme'])}
          </w:tbl>
        </w:body>
      </w:document>`,
    );

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const result = await parseAnnualPlanFile(buffer, '5-sinif-matematik.docx');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const academicStartYear = currentMonth >= 8 ? currentYear : currentYear - 1;

    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([
      {
        description: null,
        grade: 5,
        learning_outcome:
          'MAT.5.3.1. Temel geometrik çizimler için matematiksel araç ve teknolojiden yararlanabilme',
        subject: 'Temel Geometrik Çizimler ve İnşalar',
        week_end: `${academicStartYear}-09-12`,
        week_start: `${academicStartYear}-09-08`,
      },
      {
        description: null,
        grade: 5,
        learning_outcome: 'MAT.5.3.4. Açılara dair çıkarım yapabilme',
        subject: 'Açı Ölçme',
        week_end: `${academicStartYear}-10-03`,
        week_start: `${academicStartYear}-09-29`,
      },
    ]);
  });

  it('skips holiday rows from annual plans', () => {
    const result = parseAnnualPlanRows([
      ['sinif', 'hafta_baslangic', 'hafta_bitis', 'konu', 'kazanim'],
      ['5', '2026-05-25', '2026-05-29', '*Kurban Bayramı', '*Kurban Bayramı'],
      ['5', '2026-06-01', '2026-06-05', 'Olasılık', 'MAT.5.5.1'],
    ]);

    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([
      {
        description: null,
        grade: 5,
        learning_outcome: 'MAT.5.5.1',
        subject: 'Olasılık',
        week_end: '2026-06-05',
        week_start: '2026-06-01',
      },
    ]);
  });

  it('returns a clear message for old DOC files', async () => {
    const result = await parseAnnualPlanFile(new ArrayBuffer(0), 'yillik-plan.doc');

    expect(result.rows).toEqual([]);
    expect(result.errors[0]?.message).toBe(
      "Eski DOC dosyası desteklenmez. Word'de DOCX olarak kaydedip yükleyin.",
    );
  });
});

function buildDocxRow(cells: string[]) {
  return `<w:tr>${cells
    .map(
      (cell) =>
        `<w:tc><w:p><w:r><w:t>${escapeXml(cell)}</w:t></w:r></w:p></w:tc>`,
    )
    .join('')}</w:tr>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
