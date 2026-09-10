/**
 * Admin yetkilendirme modeli: e-posta allowlist.
 *
 * - Varsayılan admin koda gömülü (ADMIN_EMAIL); ek adresler server-only
 *   ADMIN_EXTRA_EMAILS env ile verilir (virgülle ayrılmış).
 * - Gerçek yetki denetimi HER ZAMAN server'da yapılır: API'lerde requireAdmin()
 *   (bkz. src/lib/api-auth.ts), satırlarda getVerifiedServerUser() + RLS.
 * - Middleware'deki çerez kontrolü yalnızca UX kısayoludur, güvenlik sınırı
 *   değildir (imzasız snapshot çerez spoof edilebilir; veri RLS korur).
 *
 * Bilinen sınır: DB rol tablosu yok. Ekip büyürse profiles.role + RLS
 * politikasına geçilmeli (yol haritası, acil değil).
 */
export const ADMIN_EMAIL = 'admin@ugurhoca.com';

/** Varsayılan admin + server-only ADMIN_EXTRA_EMAILS ile ek adresler. */
const ADMIN_EMAIL_ALLOWLIST = new Set(
  [
    ADMIN_EMAIL,
    ...(process.env.ADMIN_EXTRA_EMAILS ?? '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  ].map((e) => e.toLowerCase()),
);

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return ADMIN_EMAIL_ALLOWLIST.has(email.trim().toLowerCase());
}
