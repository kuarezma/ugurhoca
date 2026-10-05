import { createClient } from '@supabase/supabase-js';
import { expect, test, type Page } from '@playwright/test';
import { normalizeFullNameForMatch } from '../src/lib/student-identity';

type TestActor = { name: string; password: string };
const studentA = { name: process.env.E2E_STUDENT_A_NAME ?? '', password: process.env.E2E_STUDENT_A_PASSWORD ?? '' };
const studentB = { name: process.env.E2E_STUDENT_B_NAME ?? '', password: process.env.E2E_STUDENT_B_PASSWORD ?? '' };
const admin = { name: process.env.E2E_ADMIN_NAME ?? '', password: process.env.E2E_ADMIN_PASSWORD ?? '' };
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const hasTestAccounts = Boolean(
  supabaseUrl && anonKey &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  studentA.name && studentA.password &&
  studentB.name && studentB.password &&
  admin.name && admin.password,
);

async function loginInBrowser(page: Page, actor: TestActor, destination: string) {
  await page.goto(`/giris?redirect=${encodeURIComponent(destination)}`);
  await page.getByLabel('Ad ve soyad').fill(actor.name);
  await page.getByLabel('Şifre', { exact: true }).fill(actor.password);
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
}

async function loginInDatabase(actor: TestActor) {
  const client = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: matches, error: lookupError } = await client.rpc('find_login_email', {
    p_name_normalized: normalizeFullNameForMatch(actor.name),
    p_display_name: actor.name,
  });
  expect(lookupError).toBeNull();
  expect(matches).toHaveLength(1);
  const { data, error } = await client.auth.signInWithPassword({
    email: matches[0].email,
    password: actor.password,
  });
  expect(error).toBeNull();
  expect(data.user?.id).toBeTruthy();
  return { client, userId: data.user!.id };
}

test.describe('Gerçek oturum ve öğrenci yalıtımı', () => {
  test.skip(!hasTestAccounts, 'Ayrı test ortamında iki öğrenci ve yönetici E2E hesapları gerekli.');

  async function checkStudent(page: Page, actor: TestActor, isStudentA: boolean) {
    const [a, b] = await Promise.all([
      loginInDatabase(studentA),
      loginInDatabase(studentB),
    ]);
    expect(a.userId).not.toBe(b.userId);
    const own = isStudentA ? a : b;
    const other = isStudentA ? b : a;
    await loginInBrowser(page, actor, '/profil');
    const adminResponse = await page.evaluate(() =>
      fetch('/api/admin/site-statistics', { credentials: 'same-origin' })
        .then((response) => response.status));
    expect(adminResponse).toBe(403);

    const { data: ownProfile, error: ownError } = await own.client
      .from('profiles').select('id').eq('id', own.userId);
    const { data: otherProfile, error: otherError } = await own.client
      .from('profiles').select('id').eq('id', other.userId);
    expect(ownError).toBeNull();
    expect(otherError).toBeNull();
    expect(ownProfile).toHaveLength(1);
    expect(otherProfile).toHaveLength(0);
  }

  test('öğrenci A, öğrenci B profilini göremez', async ({ page }) => {
    await checkStudent(page, studentA, true);
  });

  test('öğrenci B, öğrenci A profilini göremez', async ({ page }) => {
    await checkStudent(page, studentB, false);
  });

  test('yönetici site istatistiklerine erişir', async ({ page }) => {
    await loginInBrowser(page, admin, '/admin');
    const response = await page.evaluate(() =>
      fetch('/api/admin/site-statistics', { credentials: 'same-origin' })
        .then((result) => result.status));
    expect(response).toBe(200);
  });
});
