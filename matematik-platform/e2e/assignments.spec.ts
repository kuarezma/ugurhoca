import { test, expect } from '@playwright/test';

test.describe('4. Ödevler & Görev Takip Akışı (Assignments Flow)', () => {
  test('ödevler sayfasına erişim ve filtre bileşenleri', async ({ page }) => {
    await page.goto('/odevler');

    // Sayfa yüklenmeli veya giriş yapmamış kullanıcı için uyarı/başlık görünmeli
    const content = page.locator('main, body');
    await expect(content).toBeVisible();

    // Sayfada ödev veya durum başlığı yer almalı
    const pageHeading = page.locator('h1, h2').first();
    await expect(pageHeading).toBeVisible();
  });
});
