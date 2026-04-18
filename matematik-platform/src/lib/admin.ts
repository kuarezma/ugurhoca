export const ADMIN_EMAIL = "admin@ugurhoca.com";

export function isAdminEmail(email: string | null | undefined) {
  return email === ADMIN_EMAIL;
}
