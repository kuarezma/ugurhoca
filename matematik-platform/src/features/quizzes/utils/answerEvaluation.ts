/**
 * MEB Ortak Yazılı Uyumlu Kısa Cevaplı Matematik Cevap Değerlendirme Motoru
 * - Türkçe ondalık virgül ve nokta eşdeğerliği (2,5 === 2.5)
 * - Basit ve bileşik kesir sadeleştirme ve eşdeğerliği (2/4 === 1/2 === 0.5)
 * - Çoklu geçerli yanıt alternatifleri (örn. "1/2|0,5|0.5")
 * - Değişken öneki temizleme (örn. "x=5" === "5")
 * - Negatif sayılar ve işaret normalizasyonu (+3 === 3, -1/2 === -0.5)
 */

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function parseFraction(
  str: string,
): { numerator: number; denominator: number; value: number } | null {
  const match = str.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
  if (!match) return null;

  let num = parseInt(match[1], 10);
  let den = parseInt(match[2], 10);
  if (den === 0 || isNaN(num) || isNaN(den)) return null;

  if (den < 0) {
    num = -num;
    den = -den;
  }

  return {
    numerator: num,
    denominator: den,
    value: num / den,
  };
}

export function parseNumericValue(str: string): number | null {
  const normalized = str.trim().replace(/,/g, '.');
  const fraction = parseFraction(normalized);
  if (fraction !== null) {
    return fraction.value;
  }

  // Yüzde işareti kontrolü: %25 veya 25%
  if (normalized.startsWith('%')) {
    const val = parseFloat(normalized.slice(1));
    return isNaN(val) ? null : val / 100;
  }
  if (normalized.endsWith('%')) {
    const val = parseFloat(normalized.slice(0, -1));
    return isNaN(val) ? null : val / 100;
  }

  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Matematiksel kısa cevabı karşılaştırmaya hazır hale getirir.
 */
export function normalizeMathShortAnswer(input: string): string {
  if (!input) return '';

  let cleaned = input.trim();

  // "x = 5", "x=5", "çevresi = 24 cm" gibi durumlarda ön ekleri ve birimleri sadeleştir
  cleaned = cleaned.replace(/^[a-zA-ZçğıöşüÇĞİÖŞÜ]\s*=\s*/, '');
  cleaned = cleaned.replace(
    /\s*(cm|m|km|kg|gr|g|derece|adet|tane|katı)\b/gi,
    '',
  );
  cleaned = cleaned.replace(/\s+/g, '');

  // Türkçe virgülü noktaya çevir
  cleaned = cleaned.replace(/,/g, '.');

  // Başındaki artı işaretini temizle (+5 -> 5)
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // Kesir kontrolü ve sadeleştirme
  const frac = parseFraction(cleaned);
  if (frac) {
    const g = gcd(frac.numerator, frac.denominator);
    const simpNum = frac.numerator / g;
    const simpDen = frac.denominator / g;
    if (simpDen === 1) {
      return simpNum.toString();
    }
    return `${simpNum}/${simpDen}`;
  }

  // Ondalık sayı ise gereksiz sıfırları temizle (örn: 2.50 -> 2.5, 3.0 -> 3)
  const numVal = parseFloat(cleaned);
  if (!isNaN(numVal) && !cleaned.includes('/')) {
    // String ifadenin tamamen sayısal olduğunu kontrol et
    if (/^[+-]?\d+(\.\d+)?$/.test(cleaned)) {
      return Number(cleaned).toString();
    }
  }

  return cleaned.toLowerCase();
}

/**
 * Kullanıcı yanıtını beklenen yanıt veya yanıtlar kümesi ile karşılaştırır.
 * expectedAnswer "1/2|0,5|0.5" biçiminde ayrılmış alternatifler içerebilir.
 */
export function evaluateShortAnswer(
  userAnswer: string,
  expectedAnswer: string,
): boolean {
  if (!userAnswer || !expectedAnswer) return false;

  const normalizedUser = normalizeMathShortAnswer(userAnswer);
  if (!normalizedUser) return false;

  const userNum = parseNumericValue(userAnswer);

  const alternatives = expectedAnswer
    .split(/[|;]/)
    .map((alt) => alt.trim())
    .filter(Boolean);

  for (const alt of alternatives) {
    const normalizedAlt = normalizeMathShortAnswer(alt);

    // 1. Doğrudan normalize string eşitliği
    if (normalizedUser === normalizedAlt) {
      return true;
    }

    // 2. Sayısal değer eşitliği (kesir-ondalık eşdeğerliği: 1/2 === 0.5)
    if (userNum !== null) {
      const altNum = parseNumericValue(alt);
      if (altNum !== null && Math.abs(userNum - altNum) < 1e-7) {
        return true;
      }
    }
  }

  return false;
}
