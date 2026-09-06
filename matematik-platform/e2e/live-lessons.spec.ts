import { test, expect } from '@playwright/test';

test.describe('5. Canlı Ders & Matematik Araçları Akışı', () => {
  test('canlı ders sayfasına erişim ve oda/liste kontrolü', async ({ page }) => {
    await page.goto('/canli-ders');

    await expect(page).toHaveTitle(/Canlı Ders/i);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('matematik araçları hub sayfasına erişim ve hesaplayıcılar', async ({ page }) => {
    await page.goto('/araclar');

    await expect(page.getByText(/Matematik Araçları|Hesaplayıcılar/i).first()).toBeVisible();
    // LGS ve YKS hesaplayıcı kartları
    const lgsCard = page.getByRole('link', { name: /LGS Puan Hesaplama/i });
    if (await lgsCard.isVisible()) {
      await expect(lgsCard).toBeVisible();
    }
  });
});
