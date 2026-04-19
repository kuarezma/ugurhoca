export const ADMIN_EMAIL = "admin@ugurhoca.com";

/** RLS / production ile aynı liste — tek adres bırakınca diğer admin hesabı API'de 403 alıyordu. */
const ADMIN_EMAIL_ALLOWLIST = new Set(
  [
    ADMIN_EMAIL,
    "admin@matematiklab.com",
    ...((process.env.NEXT_PUBLIC_ADMIN_EXTRA_EMAILS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)),
  ].map((e) => e.toLowerCase()),
);

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return ADMIN_EMAIL_ALLOWLIST.has(email.trim().toLowerCase());
}
