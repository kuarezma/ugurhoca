import { test, expect } from '@playwright/test';

test.describe('2. Test Çözme & Yanlış Defteri Akışı (Quizzes Flow)', () => {
  test('anonim kullanıcıyı giriş sayfasına yönlendirir', async ({ page }) => {
    await page.goto('/testler');

    await expect(page).toHaveURL(/\/giris$/);
    await expect(page.getByRole('heading', { name: /Giriş yap/i })).toBeVisible();
  });

  test('anonim kullanıcı hata defteri parametresiyle de girişe yönlendirilir', async ({ page }) => {
    await page.goto('/testler?tool=mistakes');

    await expect(page).toHaveURL(/\/giris$/);
  });
});
