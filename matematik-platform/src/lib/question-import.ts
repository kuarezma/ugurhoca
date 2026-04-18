import ExcelJS from 'exceljs';

const MAX_QUESTIONS = 30;

export interface ParsedQuestion {
  question: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation: string;
}

export interface ParsedQuizMeta {
  title: string;
  grade: number;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  time_limit: number;
  description: string;
}

export interface ImportResult {
  meta: ParsedQuizMeta;
  valid: ParsedQuestion[];
  errors: { row: number; message: string }[];
}

const CORRECT_MAP: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
const VALID_DIFFICULTIES = ['Kolay', 'Orta', 'Zor'];
const TEMPLATE_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const getCellText = (row: ExcelJS.Row, column: number) =>
  row.getCell(column).text.trim();

const getHeaderIndexes = (row: ExcelJS.Row) => {
  const headerIndexes = new Map<string, number>();

  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const value = cell.text.trim();

    if (value) {
      headerIndexes.set(value, colNumber);
    }
  });

  return headerIndexes;
};

/** Excel dosyasını (ArrayBuffer) parse eder ve ImportResult döner */
export async function parseExcelFile(buffer: ArrayBuffer): Promise<ImportResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  // ── 1. Test Bilgileri sekmesi ─────────────────────────────────────────────
  const metaSheet = workbook.getWorksheet('Test Bilgileri');
  if (!metaSheet) {
    throw new Error(
      '"Test Bilgileri" sekmesi bulunamadı. Lütfen indirdiğiniz şablonu kullanın.',
    );
  }

  const metaMap: Record<string, string> = {};
  metaSheet.eachRow({ includeEmpty: false }, (row) => {
    const key = getCellText(row, 1);
    const value = getCellText(row, 2);

    if (key) {
      metaMap[key] = value;
    }
  });

  const rawGrade = parseInt(metaMap['Sınıf'] || '0', 10);
  const rawTime = parseInt(metaMap['Süre (dakika)'] || '0', 10);
  const rawDiff = metaMap['Zorluk'] || 'Orta';

  const meta: ParsedQuizMeta = {
    title: metaMap['Test Başlığı'] || 'İsimsiz Test',
    grade: rawGrade >= 5 && rawGrade <= 12 ? rawGrade : 5,
    difficulty: VALID_DIFFICULTIES.includes(rawDiff)
      ? (rawDiff as 'Kolay' | 'Orta' | 'Zor')
      : 'Orta',
    time_limit: rawTime > 0 && rawTime <= 180 ? rawTime : 20,
    description: metaMap['Açıklama'] || '',
  };

  // ── 2. Sorular sekmesi ────────────────────────────────────────────────────
  const soruSheet = workbook.getWorksheet('Sorular');
  if (!soruSheet) {
    throw new Error(
      '"Sorular" sekmesi bulunamadı. Lütfen indirdiğiniz şablonu kullanın.',
    );
  }

  const headerIndexes = getHeaderIndexes(soruSheet.getRow(1));
  const valid: ParsedQuestion[] = [];
  const errors: { row: number; message: string }[] = [];

  soruSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const rowNum = rowNumber;
    const q = getCellText(row, headerIndexes.get('Soru') || 1);

    // Boş satırı atla
    if (!q) return;

    // Max soru sınırı
    if (valid.length >= MAX_QUESTIONS) {
      errors.push({
        row: rowNum,
        message: `Maksimum ${MAX_QUESTIONS} soru sınırına ulaşıldı. Bu satır ve sonrası atlandı.`,
      });
      return;
    }

    const a = getCellText(row, headerIndexes.get('A Şıkkı') || 2);
    const b = getCellText(row, headerIndexes.get('B Şıkkı') || 3);
    const c = getCellText(row, headerIndexes.get('C Şıkkı') || 4);
    const d = getCellText(row, headerIndexes.get('D Şıkkı') || 5);
    const correctRaw = getCellText(
      row,
      headerIndexes.get('Doğru (A/B/C/D)') || 6,
    ).toUpperCase();
    const explanation = getCellText(row, headerIndexes.get('Açıklama') || 7);

    const msgs: string[] = [];

    if (!a || !b || !c || !d) msgs.push('A, B, C veya D şıkları boş bırakılamaz');
    if (!(correctRaw in CORRECT_MAP)) msgs.push('Doğru cevap A, B, C veya D olmalıdır');

    if (msgs.length > 0) {
      errors.push({ row: rowNum, message: msgs.join(' | ') });
      return;
    }

    valid.push({
      question: q,
      options: [a, b, c, d],
      correct_index: CORRECT_MAP[correctRaw],
      explanation,
    });
  });

  return { meta, valid, errors };
}

/** Şablon .xlsx dosyası oluşturup tarayıcıdan indirir */
export function downloadExcelTemplate(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const workbook = new ExcelJS.Workbook();

  // ── Test Bilgileri sekmesi ────────────────────────────────────────────────
  const metaData = [
    ['Test Başlığı', '8. Sınıf Denklemler Testi'],
    ['Sınıf', 8],
    ['Zorluk', 'Orta'],
    ['Süre (dakika)', 20],
    ['Açıklama', 'Doğrusal denklemler konusunu kapsar.'],
  ];
  const metaSheet = workbook.addWorksheet('Test Bilgileri');
  metaSheet.addRows(metaData);
  metaSheet.columns = [{ width: 20 }, { width: 40 }];

  // ── Sorular sekmesi ───────────────────────────────────────────────────────
  const headers = [
    'Soru',
    'A Şıkkı',
    'B Şıkkı',
    'C Şıkkı',
    'D Şıkkı',
    'Doğru (A/B/C/D)',
    'Açıklama',
  ];
  const exampleRow = [
    '3x + 5 = 14 denkleminin çözümü nedir?',
    'x = 2',
    'x = 3',
    'x = 4',
    'x = 5',
    'B',
    '3x = 9, dolayısıyla x = 3 bulunur.',
  ];
  const questionSheet = workbook.addWorksheet('Sorular');
  questionSheet.addRow(headers);
  questionSheet.addRow(exampleRow);
  questionSheet.columns = [
    { width: 55 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 18 },
    { width: 40 },
  ];

  void workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: TEMPLATE_MIME_TYPE });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = 'ugur-hoca-test-sablonu.xlsx';
    link.click();
    URL.revokeObjectURL(objectUrl);
  });
}
