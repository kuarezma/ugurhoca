/**
 * Öğrenci ad soyad eşleştirmesi: Türkçe büyük/küçük harf duyarsız (tr-TR).
 * Sahte e-posta yerel kısmı için ASCII slug (Auth e-posta formatı).
 */

const TR_CHAR_TO_ASCII: Record<string, string> = {
  ı: 'i',
  İ: 'i',
  i: 'i',
  I: 'i',
  ğ: 'g',
  Ğ: 'g',
  ü: 'u',
  Ü: 'u',
  ş: 's',
  Ş: 's',
  ö: 'o',
  Ö: 'o',
  ç: 'c',
  Ç: 'c',
};

/** Boşlukları tek boşluğa indirir, trim, Türkçe kurallarıyla küçük harf. */
export function normalizeFullNameForMatch(input: string): string {
  const collapsed = input.trim().replace(/\s+/g, ' ');
  return collapsed.toLocaleLowerCase('tr-TR');
}

/** @ugurhoca.local için yerel kısım: normalize ad + ASCII slug. */
export function slugForStudentEmailLocalPart(displayName: string): string {
  const normalized = normalizeFullNameForMatch(displayName);
  let ascii = '';
  for (const ch of normalized) {
    ascii += TR_CHAR_TO_ASCII[ch] ?? ch;
  }
  return ascii
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function studentLoginEmail(displayName: string): string {
  const slug = slugForStudentEmailLocalPart(displayName);
  if (!slug) {
    throw new Error('Ad soyad e-posta için yeterli harf içermiyor.');
  }
  return `${slug}@ugurhoca.local`;
}

/** Supabase Auth / kayıt hatalarını Türkçe metne çevirir. */
export function formatSignupError(err: unknown): string {
  const msg =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: string }).message)
      : String(err ?? '');
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : '';
  const lower = msg.toLowerCase();
  if (code === '23505' || lower.includes('duplicate key')) {
    return 'Bu ad soyad ile zaten hesap var. Giriş sayfasından deneyin.';
  }
  if (
    lower.includes('already registered') ||
    lower.includes('user already') ||
    lower.includes('already been registered')
  ) {
    return 'Bu ad soyad ile zaten hesap var. Giriş sayfasından deneyin.';
  }
  if (lower.includes('duplicate') && lower.includes('name_normalized')) {
    return 'Bu ad soyad ile zaten hesap var. Giriş sayfasından deneyin.';
  }
  return msg || 'Kayıt olurken bir hata oluştu';
}
