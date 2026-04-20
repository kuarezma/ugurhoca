import ExcelJS from 'exceljs';
import JSZip from 'jszip';

const MAX_QUESTIONS = 30;
const IMAGE_PREFIX = 'images/';

export interface ParsedQuestion {
  question: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation: string;
  question_image_files?: string[];
  option_image_files?: [string[], string[], string[], string[]];
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
  source: 'bundle' | 'excel';
  assetPreviewUrls: Record<string, string>;
  file_name?: string;
}

export type QuizBundleAsset = {
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
};

export type ParsedQuizBundle = {
  assetFiles: Map<string, QuizBundleAsset>;
  importResult: ImportResult;
};

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

    const q = getCellText(row, headerIndexes.get('Soru') || 1);

    if (!q) return;

    if (valid.length >= MAX_QUESTIONS) {
      errors.push({
        row: rowNumber,
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
      errors.push({ row: rowNumber, message: msgs.join(' | ') });
      return;
    }

    valid.push({
      question: q,
      options: [a, b, c, d],
      correct_index: CORRECT_MAP[correctRaw],
      explanation,
      option_image_files: [[], [], [], []],
      question_image_files: [],
    });
  });

  return {
    assetPreviewUrls: {},
    errors,
    meta,
    source: 'excel',
    valid,
  };
}

export async function parseQuizBundleFile(
  buffer: ArrayBuffer,
  options?: { createPreviewUrls?: boolean; fileName?: string },
): Promise<ImportResult> {
  const result = await parseQuizBundleArchive(buffer, options);
  return result.importResult;
}

export async function parseQuizBundleArchive(
  buffer: ArrayBuffer,
  options?: { createPreviewUrls?: boolean; fileName?: string },
): Promise<ParsedQuizBundle> {
  const zip = await JSZip.loadAsync(buffer);
  const quizFile = zip.file('quiz.json');

  if (!quizFile) {
    throw new Error('ZIP içinde "quiz.json" bulunamadı.');
  }

  const quizJson = await quizFile.async('text');
  let parsed: {
    meta?: Record<string, unknown>;
    questions?: unknown[];
  };
  try {
    parsed = JSON.parse(quizJson) as {
      meta?: Record<string, unknown>;
      questions?: unknown[];
    };
  } catch {
    throw new Error('quiz.json geçerli JSON değil.');
  }

  const assetFiles = await loadBundleAssets(zip);
  const assetPreviewUrls = createAssetPreviewUrls(
    assetFiles,
    options?.createPreviewUrls ?? false,
  );

  const meta = normalizeBundleMeta(parsed.meta || {});
  const valid: ParsedQuestion[] = [];
  const errors: { row: number; message: string }[] = [];
  const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];

  rawQuestions.forEach((rawQuestion, index) => {
    const row = index + 1;

    if (valid.length >= MAX_QUESTIONS) {
      errors.push({
        row,
        message: `Maksimum ${MAX_QUESTIONS} soru sınırına ulaşıldı. Bu kayıt atlandı.`,
      });
      return;
    }

    const question = normalizeBundleQuestion(rawQuestion);
    const rawOptionCount = getRawOptionCount(rawQuestion);
    const messages: string[] = [];

    if (!question.question) messages.push('Soru metni boş olamaz');
    if (rawOptionCount !== 4)
      messages.push('Yalnızca 4 şıklı (A-D) sorular destekleniyor');
    if (
      !Number.isInteger(question.correct_index) ||
      question.correct_index < 0 ||
      question.correct_index > 3
    ) {
      messages.push('Doğru cevap 0 ile 3 arasında olmalıdır');
    }
    if (question.options.some((option) => !option)) {
      messages.push('A, B, C veya D şıkları boş bırakılamaz');
    }

    const questionImageFiles = question.question_image_files ?? [];
    const optionImageFiles = question.option_image_files ?? [[], [], [], []];
    const referencedAssets = [
      ...questionImageFiles,
      ...optionImageFiles.flat(),
    ];
    const missingAssets = referencedAssets.filter(
      (fileName) => !resolveAsset(assetFiles, fileName),
    );
    if (missingAssets.length > 0) {
      messages.push(`Eksik görsel dosyası: ${missingAssets.join(', ')}`);
    }

    if (messages.length > 0) {
      errors.push({ row, message: messages.join(' | ') });
      return;
    }

    valid.push(question);
  });

  return {
    assetFiles,
    importResult: {
      assetPreviewUrls,
      errors,
      file_name: options?.fileName,
      meta,
      source: 'bundle',
      valid,
    },
  };
}

/** Şablon .xlsx dosyası oluşturup tarayıcıdan indirir */
export function downloadExcelTemplate(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const workbook = new ExcelJS.Workbook();

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

  void workbook.xlsx.writeBuffer().then((outputBuffer) => {
    const blob = new Blob([outputBuffer], { type: TEMPLATE_MIME_TYPE });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = 'ugur-hoca-test-sablonu.xlsx';
    link.click();
    URL.revokeObjectURL(objectUrl);
  });
}

const normalizeBundleMeta = (rawMeta: Record<string, unknown>): ParsedQuizMeta => {
  const rawGrade = Number(rawMeta.grade || 0);
  const rawTime = Number(rawMeta.time_limit || 0);
  const rawDifficulty = String(rawMeta.difficulty || 'Orta').trim();

  return {
    description: String(rawMeta.description || '').trim(),
    difficulty: VALID_DIFFICULTIES.includes(rawDifficulty)
      ? (rawDifficulty as ParsedQuizMeta['difficulty'])
      : 'Orta',
    grade: rawGrade >= 5 && rawGrade <= 12 ? rawGrade : 5,
    time_limit: rawTime > 0 && rawTime <= 180 ? rawTime : 20,
    title: String(rawMeta.title || 'İsimsiz Test').trim() || 'İsimsiz Test',
  };
};

const normalizeBundleQuestion = (rawQuestion: unknown): ParsedQuestion => {
  const record =
    rawQuestion && typeof rawQuestion === 'object'
      ? (rawQuestion as Record<string, unknown>)
      : {};
  const options = Array.isArray(record.options)
    ? record.options.map((option) => String(option || '').trim())
    : [];

  return {
    correct_index: Number(record.correct_index),
    explanation: String(record.explanation || '').trim(),
    option_image_files: normalizeOptionImageFiles(record.option_image_files),
    options: [
      options[0] || '',
      options[1] || '',
      options[2] || '',
      options[3] || '',
    ],
    question: String(record.question || '').trim(),
    question_image_files: normalizeStringArray(record.question_image_files),
  };
};

const getRawOptionCount = (rawQuestion: unknown) => {
  const record =
    rawQuestion && typeof rawQuestion === 'object'
      ? (rawQuestion as Record<string, unknown>)
      : {};
  return Array.isArray(record.options) ? record.options.length : 0;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean);
};

const normalizeOptionImageFiles = (
  value: unknown,
): [string[], string[], string[], string[]] => {
  if (!Array.isArray(value)) {
    return [[], [], [], []];
  }

  const normalized = Array.from({ length: 4 }, (_, index) =>
    normalizeStringArray(value[index]),
  );
  return normalized as [string[], string[], string[], string[]];
};

const loadBundleAssets = async (zip: JSZip) => {
  const assetFiles = new Map<string, QuizBundleAsset>();

  await Promise.all(
    Object.values(zip.files).map(async (entry) => {
      if (entry.dir || !entry.name.startsWith(IMAGE_PREFIX)) {
        return;
      }

      const bytes = new Uint8Array(await entry.async('uint8array'));
      const fileName = entry.name.slice(IMAGE_PREFIX.length);
      const asset = {
        bytes,
        contentType: guessImageContentType(fileName),
        fileName,
      };

      assetFiles.set(fileName, asset);
      assetFiles.set(entry.name, asset);
    }),
  );

  return assetFiles;
};

const createAssetPreviewUrls = (
  assetFiles: Map<string, QuizBundleAsset>,
  createPreviewUrls: boolean,
) => {
  if (!createPreviewUrls || typeof window === 'undefined') {
    return {};
  }

  const previewUrls: Record<string, string> = {};
  for (const [fileName, asset] of assetFiles.entries()) {
    if (fileName.startsWith(IMAGE_PREFIX) || previewUrls[fileName]) {
      continue;
    }

    const blobBytes = Uint8Array.from(asset.bytes);
    previewUrls[fileName] = URL.createObjectURL(
      new Blob([blobBytes], { type: asset.contentType }),
    );
  }
  return previewUrls;
};

const resolveAsset = (
  assetFiles: Map<string, QuizBundleAsset>,
  fileName: string,
) => {
  return (
    assetFiles.get(fileName) ||
    assetFiles.get(fileName.replace(/^\.\//, '')) ||
    assetFiles.get(`${IMAGE_PREFIX}${fileName}`)
  );
};

const guessImageContentType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/png';
  }
};
