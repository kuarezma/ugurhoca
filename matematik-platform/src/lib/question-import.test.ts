import * as XLSX from 'xlsx';
import { parseExcelFile } from '@/lib/question-import';

const buildWorkbookBuffer = () => {
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      ['Test Başlığı', '8. Sınıf Denklem Testi'],
      ['Sınıf', 8],
      ['Zorluk', 'Orta'],
      ['Süre (dakika)', 20],
      ['Açıklama', 'Birinci ünite tekrar testi'],
    ]),
    'Test Bilgileri',
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
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
    ]),
    'Sorular',
  );

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
};

describe('question-import', () => {
  it('parses a valid quiz workbook', () => {
    const result = parseExcelFile(buildWorkbookBuffer());

    expect(result.meta.title).toBe('8. Sınıf Denklem Testi');
    expect(result.meta.grade).toBe(8);
    expect(result.valid).toHaveLength(2);
    expect(result.valid[0]?.correct_index).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('collects row-level validation errors for invalid options', () => {
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ['Test Başlığı', 'Geçersiz Test'],
        ['Sınıf', 8],
        ['Zorluk', 'Orta'],
        ['Süre (dakika)', 20],
      ]),
      'Test Bilgileri',
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
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
      ]),
      'Sorular',
    );

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    }) as ArrayBuffer;

    const result = parseExcelFile(buffer);

    expect(result.valid).toHaveLength(0);
    expect(result.errors[0]?.message).toContain('Doğru cevap');
  });
});
