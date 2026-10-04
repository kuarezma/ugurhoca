// Yetki kararlarında (canlı ders hedeflemesi) kullanılan sınıf çözümü.
//
// Bu kural SQL'de birebir aynalanır: public.live_lesson_normalize_grade(jsonb)
// ve public.live_lesson_viewer_grade() (migration 20261004120000). İki taraf
// supabase/tests/live_lesson_rls.sql içindeki ortak vaka tablosuyla test edilir
// (src/lib/access-grade.test.ts aynı tabloyu okur); birini değiştiren diğerini
// de değiştirmelidir.
//
// Görüntüleme için kullanılan AuthSnapshot.grade'den bilerek ayrıdır: o alan
// sınıf bilinmiyorsa 5'e düşer. Yetkide varsayılan sınıf yoktur; sınıfı
// doğrulanmış kaynaktan çözülemeyen kullanıcı yalnızca 'all' ve kendisinin
// seçildiği dersleri görür.

/**
 * Kabul edilen biçimler (başka her şey → null):
 * - tam 'Mezun' metni → 'Mezun'
 * - yalnız ASCII rakamlardan oluşan metin → baştaki sıfırları atılmış hâli ('07' → '7')
 * - negatif olmayan güvenli tam sayı → metin
 * SQL ile fark yalnız JS’in üretemediği ham JSON sayı temsillerinde (7.0 vb.) kalır.
 * Boşluk kırpılmaz; boolean, dizi, nesne, negatif ve kesirli değerler reddedilir.
 */
export function normalizeAccessGrade(value: unknown): string | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? String(value) : null;
  }

  if (typeof value === 'string') {
    if (value === 'Mezun') {
      return 'Mezun';
    }
    if (/^[0-9]+$/.test(value)) {
      return value.replace(/^0+/, '') || '0';
    }
    return null;
  }

  return null;
}

/**
 * Profil sınıfı null/undefined değilse o (geçersizse metadata'ya düşmez),
 * değilse auth.users.raw_user_meta_data->'grade' kullanılır.
 */
export function resolveAccessGrade(
  profileGrade: unknown,
  metadataGrade: unknown,
): string | null {
  if (profileGrade !== null && profileGrade !== undefined) {
    return normalizeAccessGrade(profileGrade);
  }
  return normalizeAccessGrade(metadataGrade);
}
