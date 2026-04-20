import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import {
  parseExcelFile,
  parseQuizBundleArchive,
  parseQuizBundleFile,
} from '@/lib/question-import';

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

  it('parses a valid quiz bundle with image previews', async () => {
    const zip = new JSZip();
    zip.file(
      'quiz.json',
      JSON.stringify({
        meta: {
          title: 'Görselli Test',
          grade: 8,
          difficulty: 'Orta',
          time_limit: 20,
          description: 'PDF dönüştürücü çıktısı',
        },
        questions: [
          {
            question: 'Görseldeki şeklin çevresi kaç cm?',
            options: ['10', '12', '14', '16'],
            correct_index: 1,
            explanation: 'Uzunlukları topla.',
            question_image_files: ['question-1.png'],
            option_image_files: [['a.png'], [], [], []],
          },
        ],
      }),
    );
    zip.file(
      'images/question-1.png',
      Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    zip.file(
      'images/a.png',
      Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );

    const archive = await parseQuizBundleArchive(await zip.generateAsync({ type: 'arraybuffer' }));
    const result = archive.importResult;

    expect(result.source).toBe('bundle');
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0]?.question_image_files).toEqual(['question-1.png']);
    expect(result.valid[0]?.option_image_files?.[0]).toEqual(['a.png']);
    expect(archive.assetFiles.has('question-1.png')).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects five-option bundle questions', async () => {
    const zip = new JSZip();
    zip.file(
      'quiz.json',
      JSON.stringify({
        meta: {
          title: '5 şıklı test',
          grade: 8,
          difficulty: 'Orta',
          time_limit: 20,
          description: '',
        },
        questions: [
          {
            question: 'Kaçtır?',
            options: ['1', '2', '3', '4', '5'],
            correct_index: 4,
            explanation: '',
          },
        ],
      }),
    );

    const result = await parseQuizBundleFile(await zip.generateAsync({ type: 'arraybuffer' }));

    expect(result.valid).toHaveLength(0);
    expect(result.errors[0]?.message).toContain('4 şıklı');
  });
});
