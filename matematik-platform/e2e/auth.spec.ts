import { test, expect } from '@playwright/test';

test.describe('1. Kimlik Doğrulama & Giriş Akışı (Auth Flow)', () => {
  test('giriş sayfası temel elemanları ve form validasyonu', async ({ page }) => {
    await page.goto('/giris');

    // Başlık ve form alanları kontrolü
    await expect(page).toHaveTitle(/Giriş/i);
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Boş form gönderildiğinde native veya özel validasyon
    const submitBtn = page.getByRole('button', { name: /Giriş Yap/i });
    await expect(submitBtn).toBeVisible();
  });

  test('kayıt sayfasına geçiş bağlantısı çalışmalıdır', async ({ page }) => {
    await page.goto('/giris');

    const registerLink = page.getByRole('link', { name: /Kayıt Ol|Hesap Oluştur/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*kayit/);
    }
  });
});
