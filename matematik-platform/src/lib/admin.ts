export const ADMIN_EMAIL = "admin@ugurhoca.com";

/** Varsayılan admin + server-only ADMIN_EXTRA_EMAILS ile ek adresler. */
const ADMIN_EMAIL_ALLOWLIST = new Set(
  [
    ADMIN_EMAIL,
    ...((process.env.ADMIN_EXTRA_EMAILS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)),
  ].map((e) => e.toLowerCase()),
);

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return ADMIN_EMAIL_ALLOWLIST.has(email.trim().toLowerCase());
}
