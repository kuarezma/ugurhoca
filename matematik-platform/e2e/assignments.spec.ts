import { test, expect } from '@playwright/test';

test.describe('4. Ödevler & Görev Takip Akışı (Assignments Flow)', () => {
  test('anonim kullanıcıyı giriş sayfasına yönlendirir', async ({ page }) => {
    await page.goto('/odevler');

    await expect(page).toHaveURL(/\/giris$/);
    await expect(page.getByRole('heading', { name: /Giriş yap/i })).toBeVisible();
  });
});
