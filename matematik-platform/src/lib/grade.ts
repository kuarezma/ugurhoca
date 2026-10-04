import type { GradeValue } from '@/types';

/**
 * Kabul edilen biçimler (başka her şey → null):
 * - 0 ve tam 'Mezun' metni → 'Mezun'
 * - yalnız ASCII rakamlardan oluşan metin → baştaki sıfırları atılmış hâli ('07' → '7')
 * - negatif olmayan güvenli tam sayı → metin
 * SQL ile fark yalnız JS’in üretemediği ham JSON sayı temsillerinde (7.0 vb.) kalır.
 * Boşluk kırpılmaz; boolean, dizi, nesne, negatif ve kesirli değerler reddedilir.
 */
export function normalizeGrade(value: unknown): string | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0
      ? value === 0
        ? 'Mezun'
        : String(value)
      : null;
  }

  if (typeof value === 'string') {
    if (value === 'Mezun') {
      return 'Mezun';
    }
    if (/^[0-9]+$/.test(value)) {
      return value.replace(/^0+/, '') || 'Mezun';
    }
    return null;
  }

  return null;
}

/** profiles ve assignments tamsayı kolonlarında Mezun = 0. Geçersiz girdiyi reddeder. */
export function toStoredGrade(value: unknown): number {
  const normalized = normalizeGrade(value);
  if (normalized === 'Mezun') return 0;
  const numeric = normalized === null ? NaN : Number(normalized);
  if (!Number.isSafeInteger(numeric)) throw new Error('Geçersiz sınıf düzeyi.');
  return numeric;
}

/** Görüntüleme varsayılanı yetki kararlarında kullanılmaz. */
export function toDisplayGrade(value: unknown): GradeValue {
  const normalized = normalizeGrade(value);
  if (normalized === 'Mezun') return 'Mezun';
  return normalized !== null && Number.isSafeInteger(Number(normalized))
    ? Number(normalized)
    : 5;
}

export function isGraduateGrade(value: unknown): boolean {
  return normalizeGrade(value) === 'Mezun';
}
