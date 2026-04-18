import ExcelJS from 'exceljs';
import { parseExcelFile } from '@/lib/question-import';

const buildWorkbookBuffer = async () => {
  const workbook = new ExcelJS.Workbook();
  const metaSheet = workbook.addWorksheet('Test Bilgileri');
  const questionSheet = workbook.addWorksheet('Sorular');

  metaSheet.addRows([
    ['Test Başlığı', '8. Sınıf Denklem Testi'],
    ['Sınıf', 8],
    ['Zorluk', 'Orta'],
    ['Süre (dakika)', 20],
    ['Açıklama', 'Birinci ünite tekrar testi'],
  ]);

  questionSheet.addRows([
    [
      'Soru',
      'A Şıkkı',
      'B Şıkkı',
      'C Şıkkı',
      'D Şıkkı',
      'Doğru (A/B/C/D)',
      'Açıklama',
    ],
    ['2x = 10 ise x kaçtır?', '3', '4', '5', '6', 'C', '2x = 10 ise x = 5'],
    ['x + 4 = 9 ise x kaçtır?', '3', '4', '5', '6', 'C', 'x = 5'],
  ]);

  return workbook.xlsx.writeBuffer() as Promise<ArrayBuffer>;
};

describe('question-import', () => {
  it('parses a valid quiz workbook', async () => {
    const result = await parseExcelFile(await buildWorkbookBuffer());

    expect(result.meta.title).toBe('8. Sınıf Denklem Testi');
    expect(result.meta.grade).toBe(8);
    expect(result.valid).toHaveLength(2);
    expect(result.valid[0]?.correct_index).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('collects row-level validation errors for invalid options', async () => {
    const workbook = new ExcelJS.Workbook();
    const metaSheet = workbook.addWorksheet('Test Bilgileri');
    const questionSheet = workbook.addWorksheet('Sorular');

    metaSheet.addRows([
      ['Test Başlığı', 'Geçersiz Test'],
      ['Sınıf', 8],
      ['Zorluk', 'Orta'],
      ['Süre (dakika)', 20],
    ]);

    questionSheet.addRows([
      [
        'Soru',
        'A Şıkkı',
        'B Şıkkı',
        'C Şıkkı',
        'D Şıkkı',
        'Doğru (A/B/C/D)',
        'Açıklama',
      ],
      ['Eksik şıklı soru', 'A', '', 'C', 'D', 'Z', ''],
    ]);

    const result = await parseExcelFile(
      (await workbook.xlsx.writeBuffer()) as ArrayBuffer,
    );

    expect(result.valid).toHaveLength(0);
    expect(result.errors[0]?.message).toContain('Doğru cevap');
  });
});
