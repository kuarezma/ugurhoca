export const ANNUAL_PLAN_SAMPLE_CSV_ROWS = [
  ['sinif', 'hafta_baslangic', 'hafta_bitis', 'konu', 'kazanim', 'aciklama'],
  [
    '8',
    '2026-09-14',
    '2026-09-18',
    'Çarpanlar ve Katlar',
    'M.8.1.1.1. Verilen pozitif tam sayıların pozitif tam sayı çarpanlarını bulur',
    'İlk hafta, tekrar',
  ],
  [
    '7',
    '2026-09-14',
    '2026-09-18',
    'Tam Sayılar',
    'M.7.1.1.1. Tam sayılarla toplama ve çıkarma işlemlerini yapar',
    '',
  ],
];

const escapeCsvCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export const buildAnnualPlanSampleCsv = () =>
  ANNUAL_PLAN_SAMPLE_CSV_ROWS.map((row) => row.map(escapeCsvCell).join(',')).join(
    '\n',
  );
