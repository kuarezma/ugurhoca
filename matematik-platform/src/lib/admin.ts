export const ADMIN_EMAIL = "admin@ugurhoca.com";

export const ADMIN_EMAILS = [ADMIN_EMAIL];

export function isAdminEmail(email: string | null | undefined) {
  return email === ADMIN_EMAIL;
}
