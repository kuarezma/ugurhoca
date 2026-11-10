export const REQUIRED_COLUMNS = [
  'sinif',
  'hafta_baslangic',
  'hafta_bitis',
  'konu',
  'kazanim',
] as const;

export const HEADER_ALIASES: Record<string, string[]> = {
  aciklama: ['aciklama', 'aciklamalar', 'not', 'notlar'],
  hafta_baslangic: [
    'haftabaslangic',
    'haftabaslangici',
    'baslangic',
    'weekstart',
  ],
  hafta_bitis: ['haftabitis', 'haftabitisi', 'bitis', 'weekend'],
  tarih_araligi: ['tarih', 'tarihler', 'haftatarihi', 'sure', 'süre'],
  kazanim: [
    'kazanim',
    'kazanimlar',
    'hedefvekazanimlar',
    'learningoutcome',
    'ogrenmeciktilari',
    'ogrenmeciktiları',
  ],
  konu: [
    'konu',
    'konuicerikcercevesi',
    'icerikcercevesi',
    'altogrenmealani',
    'altogrenmealanı',
    'ogrenmealani',
    'ogrenmealanı',
    'subject',
    'tema',
    'unite',
    'ünite',
  ],
  sinif: ['sinif', 'sinifduzeyi', 'grade', 'class'],
  tema: ['tema', 'unite', 'ünite'],
};

export type AnnualPlanImportRow = {
  description: string | null;
  grade: number;
  learning_outcome: string;
  subject: string;
  week_end: string;
  week_start: string;
};

export type AnnualPlanImportError = {
  message: string;
  row: number;
};

export type AnnualPlanParseResult = {
  errors: AnnualPlanImportError[];
  rows: AnnualPlanImportRow[];
  skippedDuplicates: number;
};

export type RawCell = string | number | Date | null | undefined;

// Güvenlik sınırları: admin-only akışta bile devasa dosyayla sunucuyu
// kilitlememek için. Route katmanındaki 5 MB kontrolüne ek savunma.
export const MAX_PLAN_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_PLAN_ROWS = 2000;
export const MAX_PLAN_CELL_LENGTH = 10_000;

export const NON_INSTRUCTIONAL_PLAN_KEYWORDS = [
  'ara tatil',
  'bayram',
  'egitim ogretim yili sonu',
  'kurban bayrami',
  'ramazan bayrami',
  'resmi tatil',
  'sosyal etkinlik',
  'tatil',
  'yariyil tatili',
  'yil sonu',
];
