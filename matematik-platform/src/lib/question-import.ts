import * as XLSX from 'xlsx';

export const MAX_QUESTIONS = 30;

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

/** Excel dosyasını (ArrayBuffer) parse eder ve ImportResult döner */
export function parseExcelFile(buffer: ArrayBuffer): ImportResult {
  const wb = XLSX.read(buffer, { type: 'array' });

  // ── 1. Test Bilgileri sekmesi ─────────────────────────────────────────────
  const metaSheet = wb.Sheets['Test Bilgileri'];
  if (!metaSheet) {
    throw new Error(
      '"Test Bilgileri" sekmesi bulunamadı. Lütfen indirdiğiniz şablonu kullanın.'
    );
  }

  const metaRows: any[][] = XLSX.utils.sheet_to_json(metaSheet, {
    header: 1,
    defval: '',
  });

  const metaMap: Record<string, string> = {};
  for (const row of metaRows) {
    if (row[0] && row[1] !== undefined) {
      metaMap[String(row[0]).trim()] = String(row[1]).trim();
    }
  }

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
  const soruSheet = wb.Sheets['Sorular'];
  if (!soruSheet) {
    throw new Error(
      '"Sorular" sekmesi bulunamadı. Lütfen indirdiğiniz şablonu kullanın.'
    );
  }

  const rawRows: any[] = XLSX.utils.sheet_to_json(soruSheet, { defval: '' });

  const valid: ParsedQuestion[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const rowNum = i + 2; // Excel satır numarası (header = 1)

    // Boş satırı atla
    const q = String(row['Soru'] || '').trim();
    if (!q) continue;

    // Max soru sınırı
    if (valid.length >= MAX_QUESTIONS) {
      errors.push({ row: rowNum, message: `Maksimum ${MAX_QUESTIONS} soru sınırına ulaşıldı. Bu satır ve sonrası atlandı.` });
      break;
    }

    const a = String(row['A Şıkkı'] || '').trim();
    const b = String(row['B Şıkkı'] || '').trim();
    const c = String(row['C Şıkkı'] || '').trim();
    const d = String(row['D Şıkkı'] || '').trim();
    const correctRaw = String(row['Doğru (A/B/C/D)'] || '').trim().toUpperCase();
    const explanation = String(row['Açıklama'] || '').trim();

    const msgs: string[] = [];

    if (!a || !b || !c || !d) msgs.push('A, B, C veya D şıkları boş bırakılamaz');
    if (!(correctRaw in CORRECT_MAP)) msgs.push('Doğru cevap A, B, C veya D olmalıdır');

    if (msgs.length > 0) {
      errors.push({ row: rowNum, message: msgs.join(' | ') });
      continue;
    }

    valid.push({
      question: q,
      options: [a, b, c, d],
      correct_index: CORRECT_MAP[correctRaw],
      explanation,
    });
  }

  return { meta, valid, errors };
}

/** Şablon .xlsx dosyası oluşturup tarayıcıdan indirir */
export function downloadExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // ── Test Bilgileri sekmesi ────────────────────────────────────────────────
  const metaData = [
    ['Test Başlığı', '8. Sınıf Denklemler Testi'],
    ['Sınıf', 8],
    ['Zorluk', 'Orta'],
    ['Süre (dakika)', 20],
    ['Açıklama', 'Doğrusal denklemler konusunu kapsar.'],
  ];
  const metaWS = XLSX.utils.aoa_to_sheet(metaData);
  metaWS['!cols'] = [{ wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, metaWS, 'Test Bilgileri');

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
  const soruData = [headers, exampleRow];
  const soruWS = XLSX.utils.aoa_to_sheet(soruData);
  soruWS['!cols'] = [
    { wch: 55 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
    { wch: 18 }, { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, soruWS, 'Sorular');

  XLSX.writeFile(wb, 'ugur-hoca-test-sablonu.xlsx');
}
